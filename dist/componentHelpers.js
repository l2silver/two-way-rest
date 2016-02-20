'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.triggerSubmit = triggerSubmit;

var _reactDom = require('react-dom');

function triggerSubmit(form) {
	(0, _reactDom.findDOMNode)(form).dispatchEvent(new Event('submit'));
}