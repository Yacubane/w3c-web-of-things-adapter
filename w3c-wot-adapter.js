/**
 * WoT adapter for Mozilla Gateway
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';
const {
  loadDeviceHandlers,
  observePropertyHandlers,
  readPropertyHandlers,
  writePropertyHandlers,
  invokeActionHandlers,
  subscribeEventHandlers
} = require('./handlers-default.js');

const crypto = require('crypto');
const manifest = require('./manifest.json');
const { URL } = require('url');

const {
  Adapter,
  Database,
  Device,
  Event,
  Property,
} = require('gateway-addon');

let webthingBrowser;
let subtypeBrowser;
let httpBrowser;

const POLL_INTERVAL = 5 * 1000;

class ThingProperty extends Property {
  constructor(device, name, forms, propertyDescription) {
    super(device, name, propertyDescription);
    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);

    this.ops = {};
    const opsTypes = ["readproperty", "writeproperty",
      "observeproperty", "unobserveproperty"];
    for (const opType of opsTypes) {
      this.ops[opType] = [];
    }

    for (const form of forms) {
      if (!form.op) {
        form.op = ["readproperty", "writeproperty"];
      }
    }

    for (const form of forms) {
      for (const op of form.op) {
        this.ops[op].push(form);
      }
    }

    const observeModes = this.ops["observeproperty"];
    for (const form of observeModes) {
      for (const protocolImpl of observePropertyHandlers) {
        if (protocolImpl.isApplicable(form)) {
          this.observePropertyHandler = protocolImpl.build(device, form);
        }
      }
    }

    const pollModes = this.ops["readproperty"];
    for (const form of pollModes) {
      for (const protocolImpl of readPropertyHandlers) {
        if (protocolImpl.isApplicable(form)) {
          this.readPropertyHandler = protocolImpl.build(device, form);
        }
      }
    }

    const writeModes = this.ops["writeproperty"];
    for (const form of writeModes) {
      for (const protocolImpl of writePropertyHandlers) {
        if (protocolImpl.isApplicable(form)) {
          this.writePropertyHandler = protocolImpl.build(device, form);
        }
      }
    }

    if (this.observePropertyHandler) {
      this.subscription = this.observePropertyHandler.observeProperty((response) => {
        this.setCachedValue(response);
        this.device.notifyPropertyChanged(this);
      });
    }

    this.poll();
  }

  cancelSubscriptions() {
    if (this.subscription) {
      this.subscription.cancel();
      this.subscription = null;
    }
  }

  poll() {
    if (this.readPropertyHandler) {
      this.readPropertyHandler.readProperty().then((response) => {
        this.setCachedValue(response);
        this.device.notifyPropertyChanged(this);
      });
    }
  }

  /**
   * @method setValue
   * @returns {Promise} resolves to the updated value
   *
   * @note it is possible that the updated value doesn't match
   * the value passed in.
   */
  setValue(value) {
    return this.writePropertyHandler.writeProperty(value).then((response) => {
      this.setCachedValue(value);
      this.device.notifyPropertyChanged(this);
      return value;
    }).catch((e) => {
      return this.value;
    });
  }
}

class ThingURLDevice extends Device {
  constructor(adapter, id, url, description, connections) {
    super(adapter, id);
    this.title = this.name = description.title || description.name;
    this.type = description.type;
    this['@context'] =
      description['@context'] || 'https://iot.mozilla.org/schemas';
    this['@type'] = description['@type'] || [];
    this.url = url;
    this.actionsUrl = null;
    this.eventsUrl = null;
    this.wsUrl = null;
    this.description = description.description;
    this.propertyPromises = [];
    this.ws = null;
    this.pingInterval = null;
    this.requestedActions = new Map();
    this.baseHref = new URL(url).origin;
    this.notifiedEvents = new Set();
    this.scheduledUpdate = null;
    this.closing = false;
    this.connections = connections;
    if (!connections) {
      this.connections = {};
    }
    this.actionsList = {};
    this.actionInvokers = {};
    this.eventsList = {};
    this.eventSubscriptions = {};

    for (const actionName in description.actions) {
      const action = description.actions[actionName];
      this.actionsList[actionName] = action;
      this.addAction(actionName, action);
    }

    for (const eventName in description.events) {
      const event = description.events[eventName];
      this.eventsList[eventName] = event;
      this.addEvent(eventName, event);
    }

    for (const propertyName in description.properties) {
      const propertyDescription = description.properties[propertyName];
      const property = new ThingProperty(this, propertyName, propertyDescription.forms, propertyDescription);
      this.properties.set(propertyName, property);
    }

    this.startReading();
  }

  startReading(now = false) {
    // If this is a recent gateway version, we hold off on polling/opening the
    // WebSocket until the user has actually saved the device.
    if (Adapter.prototype.hasOwnProperty('handleDeviceSaved') && !now) {
      return;
    }
    for (const actionName in this.actionsList) {
      var value = this.actionsList[actionName];
      for (const form of value.forms) {
        var invokeActionHandler = null;
        for (const invokeActionHandlerClass of invokeActionHandlers) {
          if (invokeActionHandlerClass.isApplicable(form)) {
            invokeActionHandler = invokeActionHandlerClass.build(this, form);
          }
        }
      }
      this.actionInvokers[actionName] = invokeActionHandler;
    }

    for (const eventName in this.eventsList) {
      var value = this.eventsList[eventName];
      for (const form of value.forms) {
        var subscribeEventHandler = null;
        for (const subscribeEventHandlerClass of subscribeEventHandlers) {
          if (subscribeEventHandlerClass.isApplicable(form)) {
            subscribeEventHandler = subscribeEventHandlerClass.build(this, form);
          }
        }
        if (subscribeEventHandler) {
          this.eventSubscriptions[eventName] = subscribeEventHandler.subscribeEvent((response) => {
            var event = {};
            event.data = response;
            this.createEvent(eventName, event);
          })
          break;
        }
      }


      // If there's no websocket endpoint, poll the device for updates.
      // eslint-disable-next-line no-lonely-if
      if (!this.scheduledUpdate) {
        Promise.all(this.propertyPromises).then(() => this.poll());
      }
    }
  }

  cancelSubscriptions() {
    for (const property of this.properties.values()) {
      property.cancelSubscriptions();
    }

    Object.keys(this.eventSubscriptions).forEach((key, index) => {
      if (this.eventSubscriptions[key]) {
        this.eventSubscriptions[key].cancel();
        this.eventSubscriptions[key] = null;
      }
    });
  }

  cancelConnections() {
    this.closing = true;

    Object.keys(this.connections).forEach((key, index) => {
      if (this.connections[key]) {
        this.connections[key].cancel();
        this.connections[key] = null;
      }
    });


    if (this.scheduledUpdate) {
      clearTimeout(this.scheduledUpdate);
    }
  }

  async poll() {
    if (this.closing) {
      return;
    }

    for (const prop of this.properties.values()) {
      prop.poll();
    }

    if (this.scheduledUpdate) {
      clearTimeout(this.scheduledUpdate);
    }

    this.scheduledUpdate = setTimeout(
      () => this.poll(),
      this.adapter.pollInterval
    );
  }

  createEvent(eventName, event) {
    const eventId = `${eventName}-${event.timestamp}`;

    event.timestamp = new Date().toISOString();

    this.notifiedEvents.add(eventId);
    const e = new Event(this,
      eventName,
      event.data || null);
    e.timestamp = event.timestamp;

    this.eventNotify(e);
  }

  performAction(action) {
    action.start();
    let invoker = this.actionInvokers[action.name];
    if (invoker) {
      return invoker.invokeAction(action.input, action.input).then((res) => {
        this.requestedActions.set(action.name, action);
      }).catch((e) => {
        console.log(`Failed to perform action: ${e}`);
        action.status = 'error';
        this.actionNotify(action);
      });
    }
  }

  cancelAction(actionId, actionName) {
    console.log(`Cancelling actions is unimplemented`);
  }
}

class ThingURLAdapter extends Adapter {
  constructor(addonManager) {
    super(addonManager, manifest.id, manifest.id);
    addonManager.addAdapter(this);
    this.knownUrls = {};
    this.savedDevices = new Set();
    this.pollInterval = POLL_INTERVAL;
  }

  async loadThing(url, retryCounter) {
    if (typeof retryCounter === 'undefined') {
      retryCounter = 0;
    }

    url = url.replace(/\/$/, '');

    if (!this.knownUrls[url]) {
      this.knownUrls[url] = {
        digest: '',
        timestamp: 0,
      };
    }

    if (this.knownUrls[url].timestamp + 5000 > Date.now()) {
      return;
    }

    let thingDescription;
    try {
      for (const loadDeviceHandler of loadDeviceHandlers) {
        if (loadDeviceHandler.isApplicable(url)) {
          thingDescription = await loadDeviceHandler.loadDevice(this, url);
        }
      }
    } catch (e) {
      // Retry the connection at a 2 second interval up to 5 times.
      console.log(e);
      if (retryCounter >= 5) {
        console.log(`Failed to connect to ${url}: ${e}`);
      } else {
        setTimeout(() => this.loadThing(url, retryCounter + 1), 2000);
      }

      return;
    }
    if (!thingDescription) {
      return;
    }

    const hash = crypto.createHash('md5');
    hash.update(thingDescription.text);
    const dig = hash.digest('hex');
    let known = false;
    if (this.knownUrls[url].digest === dig) {
      known = true;
    }

    this.knownUrls[url] = {
      digest: dig,
      timestamp: Date.now(),
    };

    if (thingDescription.id in this.devices) {
      if (known) {
        return;
      }
      await this.removeThing(this.devices[thingDescription.id], true);
    }
    await this.addDevice(thingDescription.id, url,
      thingDescription.description, thingDescription.connections);
  }

  unloadThing(url) {
    url = url.replace(/\/$/, '');

    for (const id in this.devices) {
      const device = this.devices[id];
      device.cancelSubscriptions();
      device.cancelConnections();
      this.removeThing(device, true);
    }

    if (this.knownUrls[url]) {
      delete this.knownUrls[url];
    }
  }

  /**
   * Add a ThingURLDevice to the ThingURLAdapter
   *
   * @param {String} deviceId ID of the device to add.
   * @return {Promise} which resolves to the device added.
   */
  addDevice(deviceId, deviceURL, description, connections) {
    return new Promise((resolve, reject) => {
      if (deviceId in this.devices) {
        reject(`Device: ${deviceId} already exists.`);
      } else {
        const device =
          new ThingURLDevice(this, deviceId, deviceURL, description, connections);
        Promise.all(device.propertyPromises).then(() => {
          this.handleDeviceAdded(device);

          if (this.savedDevices.has(deviceId)) {
            device.startReading(true);
          }

          resolve(device);
        }).catch((e) => reject(e));
      }
    });
  }

  /**
   * Handle a user saving a device. Note that incoming devices may not be for
   * this adapter.
   *
   * @param {string} deviceId - ID of the device
   */
  handleDeviceSaved(deviceId) {
    this.savedDevices.add(deviceId);

    if (this.devices.hasOwnProperty(deviceId)) {
      this.devices[deviceId].startReading(true);
    }
  }

  /**
   * Remove a ThingURLDevice from the ThingURLAdapter.
   *
   * @param {Object} device The device to remove.
   * @param {boolean} internal Whether or not this is being called internally
   * @return {Promise} which resolves to the device removed.
   */
  removeThing(device, internal) {
    return this.removeDeviceFromConfig(device).then(() => {
      if (!internal) {
        this.savedDevices.delete(device.id);
      }

      if (this.devices.hasOwnProperty(device.id)) {
        this.handleDeviceRemoved(device);
        device.cancelSubscriptions();
        return device;
      } else {
        throw new Error(`Device: ${device.id} not found.`);
      }
    });
  }

  /**
   * Remove a device's URL from this adapter's config if it was manually added.
   *
   * @param {Object} device The device to remove.
   */
  async removeDeviceFromConfig(device) {
    try {
      const db = new Database(this.packageName);
      await db.open();
      const config = await db.loadConfig();

      // If the device's URL is saved in the config, remove it.
      const urlIndex = config.urls.indexOf(device.url);
      if (urlIndex >= 0) {
        config.urls.splice(urlIndex, 1);
        await db.saveConfig(config);

        // Remove from list of known URLs as well.
        const adjustedUrl = device.url.replace(/\/$/, '');
        if (this.knownUrls.hasOwnProperty(adjustedUrl)) {
          delete this.knownUrls[adjustedUrl];
        }
      }
    } catch (err) {
      console.error(`Failed to remove device ${device.id} from config: ${err}`);
    }
  }

  startPairing() {
    for (const knownUrl in this.knownUrls) {
      this.loadThing(knownUrl).catch((err) => {
        console.warn(`Unable to reload Thing(s) from ${knownUrl}: ${err}`);
      });
    }
  }

  unload() {
    if (webthingBrowser) {
      webthingBrowser.stop();
    }

    if (subtypeBrowser) {
      subtypeBrowser.stop();
    }

    if (httpBrowser) {
      httpBrowser.stop();
    }

    for (const id in this.devices) {
      this.devices[id].cancelSubscriptions();
      this.devices[id].cancelConnections();
    }

    return super.unload();
  }
}

function loadThingURLAdapter(addonManager) {
  const adapter = new ThingURLAdapter(addonManager);

  const db = new Database(manifest.id);
  db.open().then(() => {
    return db.loadConfig();
  }).then((config) => {
    if (typeof config.pollInterval === 'number') {
      adapter.pollInterval = config.pollInterval * 1000;
    }

    for (const url of config.urls) {
      adapter.loadThing(url);
    }
  }).catch(console.error);
}

module.exports = loadThingURLAdapter;
