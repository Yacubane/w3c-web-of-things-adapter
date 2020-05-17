const { Subscription, OpHandler,
    ReadPropertyOpHandler,
    WritePropertyOpHandler,
    ObservePropertyOpHandler,
    UnobservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler,
    UnsubscribeEventOpHandler
} = require('./handlers-skeleton.js');

const fetch = require('node-fetch');
var URITemplate = require('urijs/src/URITemplate');

class HttpWritePropertyOpHandler extends WritePropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    writeProperty(data) {
        return fetch(this.href, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
        }).then((res) => {
            return res.json();
        }).then((response) => {
            return response;
        }).catch((e) => {
        });
    }

    static isApplicable(form) {
        if (form.href.startsWith("http") && !form.subprotocol) {
            return true;
        }
        return false;
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
        return fetch(this.href, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                Accept: 'application/json',
            },
        }).then((res) => {
            return res.json();
        }).then((response) => {
            return response;
        });
    }

    static isApplicable(form) {
        if (form.href.startsWith("http") && !form.subprotocol) {
            return true;
        }
        return false;
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
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
        }).then((res) => {
            return res.json();
        })
    }

    static isApplicable(form) {
        if (form.href.startsWith("http") && !form.subprotocol) {
            return true;
        }
        return false;
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
            headers: {
                'Content-type': 'application/json',
                Accept: 'application/json',
            },
        }).then((res) => {
            return res.json();
        }).then((response) => {
            if (this.active) {
                console.log("RES " + response);
                this.callback(response);
                this._start();
            }
        }).catch((e) => {
            if (this.active) {
                this._start();
            }
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
        return new HttpLongPollingSubscription(this.href, callback);
    }

    static isApplicable(form) {
        if (form.href.startsWith("http") && form.subprotocol == "longpoll") {
            return true;
        }
        return false;
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
        return new HttpLongPollingSubscription(this.href, callback);
    }

    static isApplicable(form) {
        if (form.href.startsWith("http") && form.subprotocol == "longpoll") {
            return true;
        }
        return false;
    }

    static build(thing, form) {
        return new HttpLongPollingSubscribeEventOpHandler(form.href);
    }
}

module.exports = {
    HttpReadPropertyOpHandler, HttpWritePropertyOpHandler,
    HttpInvokeActionOpHandler,
    HttpLongPollingObservePropertyOpHandler,
    HttpLongPollingSubscribeEventOpHandler
};