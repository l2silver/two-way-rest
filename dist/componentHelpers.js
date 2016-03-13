'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.triggerSubmit = triggerSubmit;
exports.mapIf = mapIf;
exports.getTree = getTree;
exports.getInstance = getInstance;
exports.checkIndex = checkIndex;
exports.checkShow = checkShow;
exports.goToAfter = goToAfter;

var _reactDom = require('react-dom');

var _immutable = require('immutable');

var _reactRouterRedux = require('react-router-redux');

function triggerSubmit(form) {
	(0, _reactDom.findDOMNode)(form).dispatchEvent(new Event('submit'));
}

function mapIf(immutableObject, fn, False) {
	if (immutableObject) {
		return immutableObject.toSeq().map(fn);
	}
	return False;
}

function getTree(start, popNot) {
	var fullUrl = (0, _immutable.List)(window.location.href.split('/'));
	var index = fullUrl.indexOf(start);
	var url = fullUrl.slice(index);
	if (popNot) {
		return url;
	}
	return url.pop();
}

function getInstance(url, page) {
	var Listurl = (0, _immutable.List)(url);
	if (page.getIn(Listurl.push('tree'))) {
		return page.getIn((0, _immutable.List)(url));
	}
	return false;
}

function checkIndex(tree) {
	return tree.pop().push(tree.last() + 'TWRIndex');
}

function checkShow(tree) {
	return tree.push('TWRShow');
}

function goToAfter(args, rest) {
	args.get('dispatch')((0, _reactRouterRedux.push)(args.get('reducer') + args.get('path') + '/' + args.get('response').id + rest));
}