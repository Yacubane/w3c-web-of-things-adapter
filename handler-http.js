const {
    ThingDescription,
    LoadDeviceHandler,
    Subscription,
    ReadPropertyOpHandler,
    WritePropertyOpHandler,
    ObservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler
} = require('./handlers-skeleton.js');

const W3CTransformer = require('./transformer.js');
const URITemplate = require('urijs/src/URITemplate');
const fetch = require('node-fetch');

class HttpLoadDeviceHandler extends LoadDeviceHandler {
    static isApplicable(uri) {
        return uri.startsWith("http");
    }
    static loadDevice(adapter, uri) {
        return fetch(uri, { headers: { Accept: 'application/json' } })
            .then(res => res.text())
            .then(res => {
                let data = JSON.parse(res);
                data = W3CTransformer.transformData(data);
                return new ThingDescription(uri, res, data);
            }).catch(console.error);
    }
}

class HttpWritePropertyOpHandler extends WritePropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    writeProperty(data) {
        return HttpPropertyAction.propertyHandler(this.href, 'PUT', data);
    }

    static isApplicable(form) {
        return form.href.startsWith("http") && !form.subprotocol;
    }

    static build(thing, form) {
        return new HttpWritePropertyOpHandler(form.href);
    }
}

class HttpReadPropertyOpHandler extends ReadPropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    readProperty() {
        return HttpPropertyAction.propertyHandler(this.href, 'GET');
    }

    static isApplicable(form) {
        return form.href.startsWith("http") && !form.subprotocol;
    }

    static build(thing, form) {
        return new HttpReadPropertyOpHandler(form.href);
    }
}

class HttpInvokeActionOpHandler extends InvokeActionOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    invokeAction(data, uriVariables = {}) {
        let uri = URITemplate(this.href);
        uri = uri.expand(uriVariables);
        return fetch(uri, {
            method: 'POST',
            headers: HttpPropertyAction.defaultHeaders,
            body: JSON.stringify(data),
        }).then((res) => {
            return res.json();
        }).catch(console.error);
    }

    static isApplicable(form) {
        return form.href.startsWith("http") && !form.subprotocol;
    }

    static build(thing, form) {
        return new HttpInvokeActionOpHandler(form.href);
    }
}


class HttpLongPollingSubscription extends Subscription {
    constructor(href, callback) {
        super();
        this.href = href;
        this.callback = callback;
        this.active = true;
        this._start();
    }

    _start() {
        fetch(this.href, {
            method: 'GET',
            headers: HttpPropertyAction.defaultHeaders,
        }).then((res) => {
            return res.json();
        }).then((response) => {
            if (this.active) this.callback(response);
        }).catch(console.error)
        .finally(() => {
            if (this.active) this._start();
        });
    }

    cancel() {
        this.active = false;
    }
}

class HttpLongPollingObservePropertyOpHandler extends ObservePropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    observeProperty(callback) {
        return new Promise((resolve, reject) => {
            resolve(new HttpLongPollingSubscription(this.href, callback));
        })
    }

    static isApplicable(form) {
        return form.href.startsWith("http") && form.subprotocol == "longpoll";
    }

    static build(thing, form) {
        return new HttpLongPollingObservePropertyOpHandler(form.href);
    }
}

class HttpLongPollingSubscribeEventOpHandler extends SubscribeEventOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    subscribeEvent(callback) {
        return new Promise((resolve, reject) => new HttpLongPollingSubscription(this.href, callback));
    }

    static isApplicable(form) {
        return form.href.startsWith("http") && form.subprotocol == "longpoll";
    }

    static build(thing, form) {
        return new HttpLongPollingSubscribeEventOpHandler(form.href);
    }
}

class HttpPropertyAction {
    static defaultHeaders = {
        'Content-type': 'application/json',
        'Accept': 'application/json',
    }

    static propertyHandler(href, metchod, data = null) {
        let options = {
            method: metchod,
            headers: HttpPropertyAction.defaultHeaders,
        };

        if (!!data) headers['body'] = JSON.stringify(data);

        return fetch(href, options).then((res) => {
            return res.json();
        }).then((response) => {
            return response;
        }).catch(console.error);
    }
}

module.exports = {
    HttpLoadDeviceHandler,
    HttpReadPropertyOpHandler, HttpWritePropertyOpHandler,
    HttpInvokeActionOpHandler,
    HttpLongPollingObservePropertyOpHandler,
    HttpLongPollingSubscribeEventOpHandler
};