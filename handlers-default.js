const { 
    HttpLoadDeviceHandler,
    HttpReadPropertyOpHandler,
    HttpWritePropertyOpHandler,
    HttpInvokeActionOpHandler,
    HttpLongPollingObservePropertyOpHandler,
    HttpLongPollingSubscribeEventOpHandler
} = require('./handler-http.js');

const loadDeviceHandlers = [HttpLoadDeviceHandler];
const observePropertyHandlers = [HttpLongPollingObservePropertyOpHandler];
const readPropertyHandlers = [HttpReadPropertyOpHandler];
const writePropertyHandlers = [HttpWritePropertyOpHandler];
const invokeActionHandlers = [HttpInvokeActionOpHandler];
const subscribeEventHandlers = [HttpLongPollingSubscribeEventOpHandler];

module.exports = {
    loadDeviceHandlers,
    observePropertyHandlers,
    readPropertyHandlers,
    writePropertyHandlers,
    invokeActionHandlers,
    subscribeEventHandlers
};