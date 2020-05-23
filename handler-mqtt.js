const {
    ThingDescription, 
    LoadDeviceHandler,
    Connection, 
    Subscription,
    WritePropertyOpHandler,
    ObservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler
} = require('./handlers-skeleton.js');

var mqtt = require('mqtt');

function createOrGetConnection(thing, uri) {
    return new Promise((resolve, reject) => {
        if (thing.connections[uri]) {
            resolve(thing.connections[uri]);
            return;
        }

        let client = mqtt.connect(uri);
        client.on('connect', function () {
            thing.connections[uri]= new MqttConnection(client);
            resolve(client);
        });

        let wait = setTimeout(() => {
            clearTimeout(wait);
            reject();
        }, 5000)
    });
}

class MqttConnection extends Connection {
    constructor(client) {
        super();
        this.client = client;
    }
    cancel() {
        throw 'Unimplemented';
    }
}

class MqttLoadDeviceHandler extends LoadDeviceHandler {
    static isApplicable(uri) {
        return uri.startsWith("mqtt");
    }
    
    static loadDevice(adapter, uri) {
        return new Promise((resolve, reject) => {
            let wait = setTimeout(() => {
                clearTimeout(wait);
                reject();
            }, 5000)

            const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(uri);
            const hostname = regexp[1];
            const devicePath = regexp[2];

            var client = mqtt.connect(hostname);

            client.on('connect', () => {
                client.subscribe(devicePath, () => {
                    client.on('message', (topic, message, packet) => {
                        let description = JSON.parse(message);
                        let connections = {};
                        connections[hostname] = new MqttConnection(client);
                        clearTimeout(wait);
                        resolve(new ThingDescription(uri, message, description, connections));
                    });
                });

            });
        })
    }
}

class MqttWritePropertyOpHandler extends WritePropertyOpHandler {
    constructor(thing, hostname, path) {
        super();
        this.thing = thing;
        this.hostname = hostname;
        this.path = path;
    }

    writeProperty(data) {
        return createOrGetConnection(this.thing, this.hostname)
            .then(connection => connection.client.publish(this.path, JSON.stringify(data)));
    }

    static isApplicable(form) {
        return form.href.startsWith("mqtt");
    }

    static build(thing, form) {
        const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(form.href);
        const hostname = regexp[1];
        const path = regexp[2];
        return new MqttWritePropertyOpHandler(thing, hostname, path);
    }
}


class MqttInvokeActionOpHandler extends InvokeActionOpHandler {
    constructor(thing, hostname, path) {
        super();
        this.thing = thing;
        this.hostname = hostname;
        this.path = path;
    }

    invokeAction(data, uriVariables = {}) {
        return createOrGetConnection(this.thing, this.hostname)
            .then(connection => connection.client.publish(this.path, JSON.stringify(data)));
    }

    static isApplicable(form) {
        return form.href.startsWith("mqtt");
    }

    static build(thing, form) {
        const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(form.href);
        const hostname = regexp[1];
        const path = regexp[2];
        return new MqttInvokeActionOpHandler(thing, hostname, path);
    }
}


class MqttSubscription extends Subscription {
    constructor(connection, path, callback) {
        super();
        this.active = true;
        this.connection = connection;
        this.path = path;
        this.callback = callback;
        this._start();
    }
    _start() {
        this.connection.client.subscribe(this.path, () => {
            this.connection.client.on('message', (topic, message, packet) => {
                if (this.active) {
                    let obj = JSON.parse(message);
                    this.callback(obj);
                }
            });
        });
    }
    cancel() {
        this.active = false;
        this.connection.client.unsubscribe(path);
    }
}

class MqttObservePropertyOpHandler extends ObservePropertyOpHandler {
    constructor(thing, hostname, path) {
        super();
        this.thing = thing;
        this.hostname = hostname;
        this.path = path;
    }

    observeProperty(callback) {
        return createOrGetConnection(this.thing, this.hostname)
            .then(connection => new MqttSubscription(connection, this.path, callback));
    }

    static isApplicable(form) {
        return form.href.startsWith("mqtt");
    }

    static build(thing, form) {
        const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(form.href);
        const hostname = regexp[1];
        const path = regexp[2];
        return new MqttObservePropertyOpHandler(thing, hostname, path);
    }
}

class MqttSubscribeEventOpHandler extends SubscribeEventOpHandler {
    constructor(thing, hostname, path) {
        super();
        this.thing = thing;
        this.hostname = hostname;
        this.path = path;
    }

    subscribeEvent(callback) {
        return createOrGetConnection(this.thing, this.hostname)
            .then(connection => new MqttSubscription(connection, this.path, callback));
    }

    static isApplicable(form) {
        return form.href.startsWith("mqtt");
    }

    static build(thing, form) {
        const regexp = /([^/]*\/[^/]*\/[^/]*)(.+)/.exec(form.href);
        const hostname = regexp[1];
        const path = regexp[2];
        return new MqttSubscribeEventOpHandler(thing, hostname, path);
    }
}

module.exports = {
    MqttLoadDeviceHandler,
    MqttWritePropertyOpHandler,
    MqttInvokeActionOpHandler,
    MqttObservePropertyOpHandler,
    MqttSubscribeEventOpHandler
};