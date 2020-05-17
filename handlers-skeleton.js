class ThingDescription {
    constructor(id, text, description, connections) {
        this.id = id;
        this.text = text;
        this.description = description;
        this.connections = connections;
    }
}

class LoadDeviceHandler {
    static isApplicable(uri) {
        throw 'Unimplemented';
    }
    static loadDevice(adapter, uri) {
        throw 'Unimplemented';
    }
}

class Connection {
    cancel() {
        throw 'Unimplemented';
    }
}

class Subscription {
    cancel() {
        throw 'Unimplemented';
    }
}

class OpHandler {
    static isApplicable(form) {
        throw 'Unimplemented';
    }
    static build(thing, form) {
        throw 'Unimplemented';
    }
}

class ReadPropertyOpHandler extends OpHandler {
    readProperty() {
        throw 'Unimplemented';
    }
}

class WritePropertyOpHandler extends OpHandler {
    writeProperty(data) {
        throw 'Unimplemented';
    }
}

class ObservePropertyOpHandler extends OpHandler {
    observeProperty(callback) {
        throw 'Unimplemented';
    }
}

class UnobservePropertyOpHandler extends OpHandler {
    readProperty() {
        throw 'Unimplemented';
    }
}

class InvokeActionOpHandler extends OpHandler {
    invokeAction(data, uriVariables) {
        throw 'Unimplemented';
    }
}

class SubscribeEventOpHandler extends OpHandler {
    observeProperty(callback) {
        throw 'Unimplemented';
    }
}

class UnsubscribeEventOpHandler extends OpHandler {
    readProperty() {
        throw 'Unimplemented';
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