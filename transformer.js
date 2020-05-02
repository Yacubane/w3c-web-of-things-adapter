class TransformerW3C {

  static transformData(data) {
    for(let actionName in data.actions) {
      let action = data.actions[actionName];
      if(!action.uriVariables) continue;
    
      action['input'] = {type: "object", properties: {}}
      for(let argumentName in action.uriVariables) {
        action.input.properties[argumentName] = action.uriVariables[argumentName]
      }
    }
    return data;
  }

  static getUlr(action) {
    let query = Object.keys(action.input)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(action.input[k]))
      .join('&');
    if(!!query) query = "?" + query;
    return `${action.device.url}/actions/${action.name}${query}`;
  }

}

module.exports = TransformerW3C;
