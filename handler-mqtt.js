const { Subscription, OpHandler,
    ReadPropertyOpHandler,
    WritePropertyOpHandler,
    ObservePropertyOpHandler,
    UnobservePropertyOpHandler,
    InvokeActionOpHandler,
    SubscribeEventOpHandler,
    UnsubscribeEventOpHandler
} = require('./handlers-skeleton.js');


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
    constructor(href, callback) {
        super();
        this._start();
    }
    _start() {
      
    }
    cancel() {
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
    MqttWritePropertyOpHandler,
    MqttInvokeActionOpHandler,
    MqttObservePropertyOpHandler,
    MqttSubscribeEventOpHandler
};