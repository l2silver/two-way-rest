'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.triggerSubmit = triggerSubmit;
exports.createId = createId;
exports.reverseTree = reverseTree;
exports.checkBranch = checkBranch;
exports.mapIf = mapIf;
exports.getTreeStart = getTreeStart;
exports.getInstance = getInstance;
exports.indexCheck = indexCheck;
exports.showCheck = showCheck;
exports.goToAfter = goToAfter;
exports.goToParentAfter = goToParentAfter;

var _reactDom = require('react-dom');

var _immutable = require('immutable');

var _reactRouterRedux = require('react-router-redux');

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _i2.default)(true);
function triggerSubmit(form) {
	(0, _reactDom.findDOMNode)(form).dispatchEvent(new Event('submit'));
}

function createId() {
	return Math.random().toString().slice(3);
}
function reverseTree(tree, changeLast) {
	var mapTree = tree.reverse().reduce(function (object, branch) {
		if (isNaN(branch)) {
			var _ret = function () {
				var processedBranch = checkBranch(branch, changeLast);
				return {
					v: object.update('tree', function (tree) {
						return tree.push(processedBranch.pluralize).push(object.get('lastId'));
					})
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
		}
		return object.set('lastId', branch);
	}, (0, _immutable.Map)({ tree: (0, _immutable.List)() }));
	return mapTree.get('tree');
}

function checkBranch(branch, changeLast) {
	if (branch == changeLast) {
		return (0, _immutable.List)(branch.split('_')).pop().join('_');
	}
	return branch;
}

function mapIf(immutableObject, fn, False) {
	try {
		if (immutableObject) {
			if (immutableObject.get) {
				var _ret2 = function () {
					var _globeTWR = immutableObject.get('_globeTWR');
					if (!_globeTWR) {
						if (immutableObject.size > 0) {
							return {
								v: immutableObject.toSeq().map(fn)
							};
						}
						return {
							v: False
						};
					}
					return {
						v: immutableObject.toSeq().filterNot(function (v, k) {
							return k == '_globeTWR';
						}).map(function (v) {
							if (v.get && v.get('id')) {
								return v.set('_globeTWR', _globeTWR);
							}
							return v;
						}).map(fn)
					};
				}();

				if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
			}
			if (Array.isArray(immutableObject) && immutableObject.length > 0) {
				return immutableObject.map(fn);
			}
		}
		return False;
	} catch (e) {
		console.log('mapIF error', e);
	}
}

function getTreeStart(start, popNot) {
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

function indexCheck(tree) {
	return tree.pop().push(tree.last() + 'TWRIndex');
}

function showCheck(tree) {
	return tree.push('TWRShow');
}

function goToAfter(args, rest) {
	args.get('dispatch')((0, _reactRouterRedux.push)(args.get('reducer') + args.get('path') + '/' + args.get('response').id + (rest ? rest : '')));
}
function goToParentAfter(args, rest) {
	args.get('dispatch')((0, _reactRouterRedux.push)(args.get('reducer') + (0, _immutable.List)(args.get('path').split('/')).pop().pop().join('/') + (rest ? rest : '')));
}