'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.transformResponse = transformResponse;
exports.transformObject = transformObject;
exports.convertArrayToOrderedMap = convertArrayToOrderedMap;
exports.fromJSOrdered = fromJSOrdered;
exports.setMaps = setMaps;
exports.checkTreeExists = checkTreeExists;
exports.setIndex = setIndex;
exports.setShow = setShow;
exports.index = index;
exports.show = show;
exports.substateCreate = substateCreate;
exports.substateDelete = substateDelete;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.cleanSubstate = cleanSubstate;
exports.createError = createError;
exports.updateFront = updateFront;

var _immutable = require('immutable');

var _componentHelpers = require('./componentHelpers');

function transformResponse(js, tree) {
	if ((typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null) {
		return js;
	} else {
		if (Array.isArray(js)) {
			return convertArrayToOrderedMap(js, transformResponse, tree);
		} else {
			return transformObject(js, tree);
		}
	}
}

function transformObject(js, tree) {
	if (js.id) {
		var _ret = function () {
			var newTree = (0, _immutable.List)(tree).push(js.id.toString());
			return {
				v: (0, _immutable.Seq)(js).mapEntries(function (_ref) {
					var _ref2 = _slicedToArray(_ref, 2);

					var k = _ref2[0];
					var v = _ref2[1];

					return [k, transformResponse(v, newTree.push(k))];
				}).toMap().merge({ tree: newTree })
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	} else {
		return (0, _immutable.Map)(js);
	}
}

function convertArrayToOrderedMap(array, fn, tree) {
	return (0, _immutable.Seq)(array).toKeyedSeq().mapEntries(function (_ref3) {
		var _ref4 = _slicedToArray(_ref3, 2);

		var k = _ref4[0];
		var v = _ref4[1];

		if (v.id) {
			return [v.id.toString(), fn(v, tree)];
		} else {
			return [v, fn(v, tree)];
		}
	}).toOrderedMap();
}

function fromJSOrdered(js) {
	return (typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null ? js : Array.isArray(js) ? convertArrayToOrderedMap(js, fromJSOrdered) : (0, _immutable.Seq)(js).map(fromJSOrdered).toMap();
}

function setMaps(state, tree) {
	var stateTree = tree.reduce(function (stateTree, tree) {
		var trees = stateTree.get('trees').push(tree);
		var state = stateTree.get('state');
		var newState = checkTreeExists(state, trees, tree);
		return (0, _immutable.Map)({
			state: newState,
			trees: trees
		});
	}, (0, _immutable.Map)({
		state: state,
		trees: (0, _immutable.List)()
	}));
	return stateTree.get('state');
}

function checkTreeExists(state, trees, tree) {
	if (state.hasIn(trees)) {
		return state;
	} else {
		if (isNaN(tree)) {
			return state.setIn(trees, (0, _immutable.OrderedMap)());
		} else {
			return state.setIn(trees, (0, _immutable.Map)());
		}
	}
}

function setIndex(state, tree) {
	var ListTree = (0, _immutable.List)(tree);
	var nextState = setMaps(state, ListTree).setIn((0, _componentHelpers.checkIndex)(ListTree), true);
	return nextState;
}

function setShow(state, tree) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).setIn((0, _componentHelpers.checkShow)(ListTree), true);
}

function index(state, tree, response) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).mergeDeepIn(ListTree, transformResponse(response, tree));
}

function show(state, tree, response) {
	var ListTree = tree;
	return setMaps(state, ListTree).mergeIn(ListTree, transformResponse(response, tree.pop()));
}

function substateCreate(state, tree, content) {
	var ListTreeWithId = tree;
	return setMaps(state, ListTreeWithId).mergeDeepIn(ListTreeWithId, (0, _immutable.Map)(content).merge({ tree: (0, _immutable.List)(tree) }));
}

function substateDelete(state, tree, content) {
	var ListTreeWithId = tree;
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
}

function create(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];

	var cleanedSubstate = cleanSubstate(state, tree);
	return setMaps(cleanedSubstate, outTree).setIn(outTree, content.merge(transformResponse(response, outTree.pop())));
}

function update(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];

	var cleanedSubstate = cleanSubstate(state, tree);
	var updatedState = setMaps(cleanedSubstate, outTree).mergeDeepIn(outTree, content.mergeDeep(transformResponse(response, outTree.pop())));
	return updatedState;
}

function destroy(state, tree, outTree) {
	var cleanedSubstate = cleanSubstate(state, tree);
	return setMaps(cleanedSubstate, outTree).deleteIn(outTree);
}

function cleanSubstate(state, ListTree) {
	var SubstateListTree = ListTree;
	var cloneElement = state.getIn(SubstateListTree);
	var cleanCloneElement = cloneElement.toSeq().mapEntries(function (_ref5) {
		var _ref6 = _slicedToArray(_ref5, 2);

		var k = _ref6[0];
		var v = _ref6[1];

		if (k == 'tree' || k == 'id') {
			return [k, v];
		} else {
			return [k, ''];
		}
	}).toMap();
	return state.setIn(SubstateListTree, cleanCloneElement);
}

function createError(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	return state.mergeDeepIn(tree, content.merge(response));
}

function updateFront(state, tree, content) {
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var ListTree = tree;
	return setMaps(state, ListTree).mergeDeepIn(ListTree, (0, _immutable.Map)(content).merge(response));
}