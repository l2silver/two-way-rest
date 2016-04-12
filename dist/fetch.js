'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestObject = requestObject;
exports.setAddress = setAddress;

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _methods = require('methods');

var _methods2 = _interopRequireDefault(_methods);

var _bluebird = require('bluebird');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('superagent-promise')(require('superagent'), _promise2.default);
function requestObject(method, body, url) {
  switch (method) {
    case 'get':
      return { url: url };
    case 'index':
      return { url: url };
    case 'destroy':
      return { url: url };
  }
  return { url: url, form: body };
}

function setAddress(url) {
  _methods2.default.map(function (method) {
    if (method == 'delete') {
      exports['del'] = function (path) {
        var body = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (body) {
          return request['del'](url + path).send(body).withCredentials().then(function (res) {
            if (res.statusCode == 200) {
              return res.body;
            }
            throw res;
          });
        } else {
          return request['del'](url + path).withCredentials().then(function (res) {
            if (res.statusCode == 200) {
              return res.body;
            }
            throw res;
          });
        }
      };
    } else {
      exports[method] = function (path) {
        var body = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (body) {
          return request[method](url + path).withCredentials().send(body).then(function (res) {
            if (res.statusCode == 200) {
              return res.body;
            }
            throw res;
          });
        } else {
          return request[method](url + path).withCredentials().then(function (res) {
            if (res.statusCode == 200) {
              return res.body;
            }
            throw res;
          });
        }
      };
    }
  });
  exports['up'] = function (address, formData) {
    return request.post(url + address).send(formData).withCredentials().then(function (res) {
      if (res.statusCode == 200) {
        return res.body;
      }
      throw res;
    });
  };
  exports['productionUrl'] = url;
}