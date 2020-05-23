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
- HTTP
- MQTT

## Developing in W3C WoT API
We recommend using [Eclipse Thingweb](https://github.com/eclipse/thingweb.node-wot) for developing in WoT API. This implementation of WoT is based on bindings and examples from W3C's documents.

## How to add new protocol handling?
1. Create file `handler-<protocol_name>.js` with implementation method from `handlers-skeleleton.js`
2. Import new handler to `handlers-default.js`

## About project
This project was started as a project for Internet of Things AGH UST university course. 
