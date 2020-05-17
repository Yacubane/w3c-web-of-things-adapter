const {
    ThingDescription, LoadDeviceHandler,
    Connection, Subscription, OpHandler,
    ReadPropertyOpHandler,
    WritePropertyOpHandler,
    ObservePropertyOpHandler,
    UnobservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler,
    UnsubscribeEventOpHandler
} = require('./handlers-skeleton.js');

var mqtt = require('mqtt');

class MqttLoadDeviceHandler extends LoadDeviceHandler {
    static isApplicable(uri) {
        if (uri.startsWith("mqtt")) {
            return true;
        }
        return false;
    }
    static loadDevice(adapter, uri) {
        return new Promise((resolve, reject) => {
            const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(uri);
            const hostname = regexp[1];
            const devicePath = regexp[2];

            var client = mqtt.connect(hostname);

            client.on('connect', function () {
                client.subscribe(devicePath, function () {
                    client.on('message', function (topic, message, packet) {
                        let description = JSON.parse(message);
                        resolve(new ThingDescription(uri, message, description, { hostname: client }));
                    });
                });

            });

            let wait = setTimeout(() => {
                clearTimout(wait);
                reject();
            }, 5000)
        })
    }
}

class MqttWritePropertyOpHandler extends WritePropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    writeProperty(data) {

    }

    static isApplicable(form) {
        if (form.href.startsWith("mqtt")) {
            return true;
        }
        return false;
    }

    static build(thing, form) {
        return new MqttWritePropertyOpHandler(form.href);
    }
}


class MqttInvokeActionOpHandler extends InvokeActionOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    invokeAction(data, uriVariables = {}) {

    }

    static isApplicable(form) {
        if (form.href.startsWith("mqtt")) {
            return true;
        }
        return false;
    }

    static build(thing, form) {
        return new MqttInvokeActionOpHandler(form.href);
    }
}


class MqttSubscription extends Subscription {
    constructor(client, path, callback) {
        super();
        this.active = true;
        this.client = client;
        this.path = path;
        this._start();
    }
    _start() {
        client.subscribe(path, function () {
            client.on('message', function (topic, message, packet) {
                if (this.active) {
                    let obj = JSON.parse(message);
                    callback(obj);
                }
            });
        });
    }
    cancel() {
        this.active = false;
        client.unsubscribe(path);
    }
}

class MqttObservePropertyOpHandler extends ObservePropertyOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    observeProperty(callback) {
        return new MqttSubscription(this.href, callback);
    }

    static isApplicable(form) {
        if (form.href.startsWith("mqtt")) {
            return true;
        }
        return false;
    }

    static build(thing, form) {
        return new MqttObservePropertyOpHandler(form.href);
    }
}

class MqttSubscribeEventOpHandler extends SubscribeEventOpHandler {
    constructor(href) {
        super();
        this.href = href;
    }

    subscribeEvent(callback) {
        return new MqttSubscribeEventOpHandler(this.href, callback);
    }

    static isApplicable(form) {
        if (form.href.startsWith("mqtt")) {
            return true;
        }
        return false;
    }

    static build(thing, form) {
        return new MqttSubscribeEventOpHandler(form.href);
    }
}

module.exports = {
    MqttLoadDeviceHandler,
    MqttWritePropertyOpHandler,
    MqttInvokeActionOpHandler,
    MqttObservePropertyOpHandler,
    MqttSubscribeEventOpHandler
};