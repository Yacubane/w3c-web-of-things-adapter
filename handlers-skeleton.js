class ThingDescription {
    constructor(id, text, description, connections) {
        this.id = id;
        this.text = text;
        this.description = description;
        this.connections = connections;
    }
}

const UnimlementedMethodExceprion = (className, methodName) => new Error(`[${className}]: Inimplemented '${methodName}' method.`);

class LoadDeviceHandler {
    static isApplicable(uri) {
        throw UnimlementedMethodExceprion('LoadDeviceHandler', 'isApplicable');
    }
    static loadDevice(adapter, uri) {
        throw UnimlementedMethodExceprion('LoadDeviceHandler', 'loadDevice');
    }
}

class Connection {
    cancel() {
        throw UnimlementedMethodExceprion('Connection', 'cancel');
    }
}

class Subscription {
    cancel() {
        throw UnimlementedMethodExceprion('Subscription', 'cancel');
    }
}

class OpHandler {
    static isApplicable(form) {
        throw UnimlementedMethodExceprion('OpHandler', 'isApplicable');
    }
    static build(thing, form) {
        throw UnimlementedMethodExceprion('OpHandler', 'build');
    }
}

class ReadPropertyOpHandler extends OpHandler {
    readProperty() {
        throw UnimlementedMethodExceprion('ReadPropertyOpHandler', 'readProperty');
    }
}

class WritePropertyOpHandler extends OpHandler {
    writeProperty(data) {
        throw UnimlementedMethodExceprion('WritePropertyOpHandler', 'writeProperty');
    }
}

class ObservePropertyOpHandler extends OpHandler {
    observeProperty(callback) {
        throw UnimlementedMethodExceprion('ObservePropertyOpHandler', 'observeProperty');
    }
}

class UnobservePropertyOpHandler extends OpHandler {
    readProperty() {
        throw UnimlementedMethodExceprion('UnobservePropertyOpHandler', 'readProperty');
    }
}

class InvokeActionOpHandler extends OpHandler {
    invokeAction(data, uriVariables) {
        throw UnimlementedMethodExceprion('InvokeActionOpHandler', 'invokeAction');
    }
}

class SubscribeEventOpHandler extends OpHandler {
    observeProperty(callback) {
        throw UnimlementedMethodExceprion('SubscribeEventOpHandler', 'observeProperty');
    }
}

class UnsubscribeEventOpHandler extends OpHandler {
    readProperty() {
        throw UnimlementedMethodExceprion('UnsubscribeEventOpHandler', 'readProperty');
    }
}

module.exports = {
    ThingDescription, LoadDeviceHandler,
    Connection, Subscription, OpHandler,
    ReadPropertyOpHandler, WritePropertyOpHandler,
    ObservePropertyOpHandler, UnobservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler, UnsubscribeEventOpHandler
};