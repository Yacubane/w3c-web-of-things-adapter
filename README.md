# W3C Web of Things adapter

This is an adapter add-on for the [Mozilla WebThings Gateway](https://github.com/mozilla-iot/gateway) that allows a user to add W3C Web of Things devices. This is a fork of original thing-url-adapter.

## Notes
> :warning: W3C Web of Things (WoT) describes API in very generic way. There is not possible to implement every protocol that can be used with WoT. 

This project aims to implement basic HTTP binding covered in W3C WoT Specification:
[HTTP binding assertions](https://www.w3.org/TR/wot-thing-description/#http-binding-assertions)

Whats more, project aims to cover example sequences of interations from WoT binding templates document:
[Example interations](https://www.w3.org/TR/2020/NOTE-wot-binding-templates-20200130/#appendix-example-sequences)

Finally, with this project, there should be possible to create new devices using some WoT implementations (like [Eclipse Thingweb](https://github.com/eclipse/thingweb.node-wot)) and expose them easily in Mozilla Gateway.

## Developing in W3C WoT API
We recommend using [Eclipse Thingweb](https://github.com/eclipse/thingweb.node-wot) for developing in WoT API. This implementation of WoT is based on bindings and examples from W3C's documents.
