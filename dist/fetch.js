'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchObject = fetchObject;

require('isomorphic-fetch');

var _methods = require('methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_methods2.default.forEach(function (method) {
  exports[method] = function (path) {
    var body = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var url = 'http://localhost:8000';
    return fetch(url + path, fetchObject(method, body)).then(function (res) {
      return res.json();
    });
  };
});
function fetchObject(method, body) {
  switch (method) {
    case 'get':
      return { method: method };
    case 'put':
      console.log('PUT REQUEST');
      return { method: 'POST', body: body, headers: {
          'X-HTTP-Method-Override': 'PUT'
        } };
  }
  console.log('POST');
  return { method: method, body: body };
}