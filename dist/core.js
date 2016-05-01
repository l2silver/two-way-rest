'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.custom = custom;
exports.setGet = setGet;
exports.index = index;
exports.show = show;
exports.substateCreate = substateCreate;
exports.substateDelete = substateDelete;
exports.createCleanCloneElement = createCleanCloneElement;
exports.cleanSubstate = cleanSubstate;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.createError = createError;

var _immutable = require('immutable');

var _componentHelpers = require('./componentHelpers');

var _mapState = require('./mapState');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function custom(state, fn) {
	return fn(state);
}

function setGet(state, tree) {
	var nextState = (0, _mapState.wrapMapState)(_defineProperty({}, tree.last(), true), tree.pop(), state);
	return nextState;
}

function index(state, tree, response) {
	return (0, _mapState.wrapMapState)(response, tree, state);
}

function show(state, tree, response) {
	try {
		return (0, _mapState.wrapMapState)(response, tree, state);
	} catch (e) {
		console.log('show error', e);
	}
}

function substateCreate() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Map)() : arguments[0];
	var tree = arguments[1];
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	return state.set('Substate', (0, _mapState.wrapMapState)((0, _immutable.Map)(content), tree, state.get('Substate')));
}

function substateDelete() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Map)() : arguments[0];
	var tree = arguments[1];
	var content = arguments[2];

	var Substate = state.get('Substate').deleteIn(tree);
	return state.set('Substate', Substate);
}

function createCleanCloneElement(cloneElement) {
	if (cloneElement) {
		return cloneElement.toSeq().mapEntries(function (_ref) {
			var _ref2 = _slicedToArray(_ref, 2);

			var k = _ref2[0];
			var v = _ref2[1];

			if (k == 'tree' || k == 'id') {
				return [k, v];
			} else {
				return [k, ''];
			}
		}).toMap();
	}
	return (0, _immutable.Map)();
}

function cleanSubstate() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Map)() : arguments[0];
	var tree = arguments[1];
	var lastCreatedId = arguments[2];

	try {
		var cloneElement = state.getIn(tree);
		var cleanCloneElement = createCleanCloneElement(cloneElement);
		if (lastCreatedId) {
			return state.setIn(tree, cleanCloneElement.set('lastCreatedId', lastCreatedId));
		}
		return state.setIn(tree, cleanCloneElement);
	} catch (e) {
		console.log('error in clean substate', e);
	}
}

function create(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];
	var parent = arguments[5];

	try {
		var precleanedSubstate = state.get('Substate');
		var Substate = cleanSubstate(precleanedSubstate, tree, response.id ? response.id : false);
		var liveGlobe = state.set('Substate', Substate);
		var nextState = (0, _mapState.wrapMapState)(content.merge((0, _immutable.fromJS)(response)), outTree, liveGlobe);
		if (parent) {
			var _ret = function () {
				var childName = tree.first() + 'TWR';
				var childId = outTree.last().toString();
				var parentRelations = nextState.getIn(parent).get(childName);
				if (parentRelations) {
					return {
						v: nextState.updateIn(parent.push(childName), function (children) {
							return children.push(childId);
						})
					};
				}
				return {
					v: nextState.setIn(parent.push(childName), (0, _immutable.List)([childId]))
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
		}
		return nextState;
	} catch (e) {
		console.log('CORE CREATE ERROR', e);
	}
}

function update(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];

	var precleanedSubstate = state.get('Substate');
	var Substate = cleanSubstate(precleanedSubstate, tree);
	var liveGlobe = state.set('Substate', Substate);
	return (0, _mapState.wrapMapState)(content.merge(response), outTree, liveGlobe);
}

function destroy(state, tree, outTree) {
	var precleanedSubstate = state.get('Substate');
	var Substate = cleanSubstate(precleanedSubstate, tree);
	return state.deleteIn(outTree).set('Substate', Substate);
}

function createError(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var Substate = state.get('Substate');
	var mergedContent = content.merge(response);
	return state.set('Substate', (0, _mapState.wrapMapState)(mergedContent, tree, Substate));
}