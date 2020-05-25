# W3C Web of Things adapter

This is an adapter add-on for the [Mozilla WebThings Gateway](https://github.com/mozilla-iot/gateway) that allows a user to add W3C Web of Things devices. This is a fork of original thing-url-adapter.

## Notes

> :warning: W3C Web of Things (WoT) describes API in very generic way. There is not possible to implement every protocol that can be used with WoT. 

This project aims to implement basic HTTP binding covered in W3C WoT Specification:
[HTTP binding assertions](https://www.w3.org/TR/wot-thing-description/#http-binding-assertions)
[Example interations](https://www.w3.org/TR/2020/NOTE-wot-binding-templates-20200130/#appendix-example-sequences)

Whats more, project aims to cover other protocols (like MQTT) with similar API as HTTP one (communication with same JSONs as in HTTP)

Finally, with this project, there should be possible to create new devices using some WoT implementations (like [Eclipse Thingweb](https://github.com/eclipse/thingweb.node-wot)) and expose them easily in Mozilla Gateway.

## Supporting protocol

* HTTP
* MQTT

## Example usage

1. Make sure your devices are available via url, for example:

![Things available on localhost:8082](https://github.com/jakubdybczak/w3c-web-of-things-adapter/blob/master/readme_assets/addon_configuration_1.png "Available things")

2. Go to addon configuration page and add url where addon should search for device that you want to add:

![Addon configuration](https://github.com/jakubdybczak/w3c-web-of-things-adapter/blob/master/readme_assets/addon_configuration_2.png "Adding urls to addon")

3. Go back to *Things* page on WebThings Gateway page and add new thing:

![Using new thing](https://github.com/jakubdybczak/w3c-web-of-things-adapter/blob/master/readme_assets/addon_configuration_3.png "Using new thing on Things page")

4. Now you can use your W3C Web of Things devices via Mozilla WebThings Gateway.

## Prove of concept project

If you want to test adapter without having actual devices, you can check our prove of concept project available here: [W3C Web of Things adapter POC](https://github.com/jakubdybczak/eclipse-thingweb-mozilla-gateway-poc).

## Developing in W3C WoT API

We recommend using [Eclipse Thingweb](https://github.com/eclipse/thingweb.node-wot) for developing in WoT API. This implementation of WoT is based on bindings and examples from W3C's documents.

## How to add new protocol handling?

1. Create file `handler-<protocol_name>.js` with implementation method from `handlers-skeleleton.js` 
2. Import new handler to `handlers-default.js` 

## About project

This project was started as a project for Internet of Things AGH UST university course. 
