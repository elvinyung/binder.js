
// binder.js - binder core module
// powers the main databinding infrastructure.


var binder = function(){
  var models = {};
  var modelNodes = {};

  var bindTypes = {
    INPUT: 0,
    TEXT: 1
  };

  // traverses the document body, calling f at every node.
  function traverseBody (f) {
    function recurseNode (node) {
      f(node);
      Array.apply(null, node.childNodes).forEach(recurseNode);
    }
    recurseNode(document.body);
  }

  function addModel (key, value) {
    models[key] = value;
    modelNodes[key] = [];

    traverseBody(function (node) {
      if (node.nodeType == 1) {
        // TODO: add support for textareas
        if (node.tagName == 'INPUT') {
          // TODO: add cases for object property models
          console.log(node.getAttribute('model'));
          if (node.getAttribute('model') == key) {
            function modelUpdateFromInput () {
              updateModel(key, node.value);
            }

            // add input listeners to input fields
            node.onchange = modelUpdateFromInput;
            node.oninput = modelUpdateFromInput;
            node.onpaste = modelUpdateFromInput;

            node.bindType = bindTypes.INPUT;
            modelNodes[key].push(node);
          }
        }
      }
      else if (node.nodeType == 3 && node.parentElement.tagName != 'SCRIPT') {
        if (node.nodeValue.match(new RegExp('{{[.]*{key}[.]*}}'.replace('{key}', key)))) {
          console.log(node.nodeValue);
          node.pristineValue = node.nodeValue;
          node.bindType = bindTypes.TEXT;
          modelNodes[key].push(node);
        }
      }
    });
    
    updateModel(key);
  }

  function updateModel(key, value) {
    value = value || models[key];
    models[key] = value;
    modelNodes[key].forEach(function (node) {
      if (node.bindType == bindTypes.INPUT) {
        node.value = value;
      } 
      else if (node.bindType == bindTypes.TEXT) {

        // redraw from node.pristineValue
        var templMatch = node.pristineValue.match(/{{(.*)}}/);
        var partial = templMatch[1]
                        .replace(/\s/g, '')  // strip whitespace
                        .replace(new RegExp(key, 'g'), value); 
        node.nodeValue = node.pristineValue.replace(templMatch[0], partial);
      }
    });
  }

  return {
    addModel: addModel,
    updateModel: updateModel
  };
}();
