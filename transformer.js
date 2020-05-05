class W3CTransformer {

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

}

module.exports = W3CTransformer;
