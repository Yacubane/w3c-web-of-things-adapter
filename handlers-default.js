const { 
    HttpLoadDeviceHandler,
    HttpReadPropertyOpHandler,
    HttpWritePropertyOpHandler,
    HttpInvokeActionOpHandler,
    HttpLongPollingObservePropertyOpHandler,
    HttpLongPollingSubscribeEventOpHandler
} = require('./handler-http.js');
const { 
    MqttLoadDeviceHandler,
    MqttWritePropertyOpHandler,
    MqttInvokeActionOpHandler,
    MqttObservePropertyOpHandler,
    MqttSubscribeEventOpHandler
} = require('./handler-mqtt.js');


const loadDeviceHandlers = [HttpLoadDeviceHandler, MqttLoadDeviceHandler];
const observePropertyHandlers = [HttpLongPollingObservePropertyOpHandler, MqttObservePropertyOpHandler];
const readPropertyHandlers = [HttpReadPropertyOpHandler];
const writePropertyHandlers = [HttpWritePropertyOpHandler, MqttWritePropertyOpHandler];
const invokeActionHandlers = [HttpInvokeActionOpHandler, MqttInvokeActionOpHandler];
const subscribeEventHandlers = [HttpLongPollingSubscribeEventOpHandler, MqttSubscribeEventOpHandler];

module.exports = {
    loadDeviceHandlers,
    observePropertyHandlers,
    readPropertyHandlers,
    writePropertyHandlers,
    invokeActionHandlers,
    subscribeEventHandlers
};