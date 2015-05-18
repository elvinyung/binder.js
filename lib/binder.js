'use strict';

// binder.js - binder core module
// powers the main databinding infrastructure.


var binder = (function(){
  var models = {};
  var modelNodes = {};

  var bindTypes = {
    INPUT: 0,
    TEXT: 1
  };

  // evaluate the given expression with the given scope.
  var scopedEval = function scopedEval(expr, scope) {
    return eval(expr);
  };

  // traverses the document body, calling f at every node.
  var traverseBody = function traverseBody(f) {
    function recurseNode(node) {
      f(node);
      Array.apply(null, node.childNodes).forEach(recurseNode);
    }
    recurseNode(document);
  };

  var addModel = function addModel(key, value) {
    models[key] = value;
    modelNodes[key] = [];

    traverseBody(function (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
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
      else if (node.nodeType === Node.TEXT_NODE && node.parentElement.tagName !== 'SCRIPT') {
        if (node.nodeValue.match(new RegExp('{{[.]*{key}[.]*}}'.replace('{key}', key)))) {
          node.pristineValue = node.nodeValue;
          node.bindType = bindTypes.TEXT;
          modelNodes[key].push(node);
        }
      }
    });
    
    updateModel(key, models[key]);
  };

  var renderTemplate = function renderTemplate(pristine) {
    // redraw from node.pristineValue
    var templMatch = pristine.match(/{{(.*)}}/);
    var partial = templMatch[1].replace(/\s/g, '')  // strip whitespace
    Object.keys(models).forEach(function(key) {
      partial.replace(new RegExp(key, 'g'), value); 
    });
    var evalResult = eval(partial);  // TODO: replace this with a safer custom written version
    return pristine.replace(templMatch[0], evalResult);
  }

  var updateModel = function updateModel(key, value) {
    models[key] = value;
    modelNodes[key].forEach(function (node) {
      if (node.bindType === bindTypes.INPUT) {
        node.value = value;
      } 
      else if (node.bindType === bindTypes.TEXT) {
        node.nodeValue = renderTemplate(node.pristineValue);
      }
    });
  };

  var getModel = function getModel(key) {
    return models[key];
  };

  return {
    addModel: addModel,
    updateModel: updateModel,
    getModel: getModel
  };
})();
