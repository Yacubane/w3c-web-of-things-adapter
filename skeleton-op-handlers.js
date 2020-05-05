class Subscription {
    cancel() {
        throw 'Unimplemented';
    }
}

class OpHandler {
    static isApplicable(form) {
        throw 'Unimplemented';
    }
    static build(form) {
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
    Subscription, OpHandler,
    ReadPropertyOpHandler, WritePropertyOpHandler,
    ObservePropertyOpHandler, UnobservePropertyOpHandler,
    SubscribeEventOpHandler, UnsubscribeEventOpHandler
};