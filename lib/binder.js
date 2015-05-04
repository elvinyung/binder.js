'use strict';

// binder.js - binder core module
// powers the main databinding infrastructure.


var binder = function() {
  var models = {};
  var modelNodes = {};

  var bindTypes = {
    INPUT: 0,
    TEXT: 1
  };

  // traverses the document body, calling f at every node.
  var traverseBody = function traverseBody(f) {
    function recurseNode(node) {
      f(node);
      Array.apply(null, node.childNodes).forEach(recurseNode);
    }
    recurseNode(document.body);
  };

  var addModel = function addModel(key, value) {
    models[key] = value;
    modelNodes[key] = [];

    traverseBody(function (node) {
      if (node.nodeType === 1) {
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          // TODO: add cases for object property models
          if (node.getAttribute('model') === key) {
            var modelUpdateFromInput = function modelUpdateFromInput() {
              updateModel(key, node.value);
            };

            // add input listeners to input fields
            node.addEventListener('change', modelUpdateFromInput);
            node.addEventListener('input', modelUpdateFromInput);
            node.addEventListener('paste', modelUpdateFromInput);

            node.bindType = bindTypes.INPUT;
            modelNodes[key].push(node);
          }
        }
      }
      else if (node.nodeType === 3 && node.parentElement.tagName !== 'SCRIPT') {
        if (node.nodeValue.match(new RegExp('{{[.]*{key}[.]*}}'.replace('{key}', key)))) {
          node.pristineValue = node.nodeValue;
          node.bindType = bindTypes.TEXT;
          modelNodes[key].push(node);
        }
      }
    });
    
    updateModel(key, models[key]);
  };

  var updateModel = function updateModel(key, value) {
    models[key] = value;
    modelNodes[key].forEach(function (node) {
      if (node.bindType === bindTypes.INPUT) {
        node.value = value;
      } 
      else if (node.bindType === bindTypes.TEXT) {

        // redraw from node.pristineValue
        var templMatch = node.pristineValue.match(/{{(.*)}}/);
        var partial = templMatch[1]
                        .replace(/\s/g, '')  // strip whitespace
                        .replace(new RegExp(key, 'g'), value); 
        node.nodeValue = node.pristineValue.replace(templMatch[0], partial);
      }
    });
  };

  return {
    addModel: addModel,
    updateModel: updateModel
  };
}();
