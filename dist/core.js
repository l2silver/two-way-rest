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
exports.index = index;
exports.setIndex = setIndex;
exports.setShow = setShow;
exports.show = show;
exports.substateCreate = substateCreate;
exports.substateDelete = substateDelete;
exports.create = create;
exports.cleanSubstate = cleanSubstate;
exports.createError = createError;
exports.createErrorContent = createErrorContent;
exports.update = update;
exports.updateFront = updateFront;
exports.destroy = destroy;
exports.setMaps = setMaps;
exports.checkTreeExists = checkTreeExists;
exports.createId = createId;

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

function index(state, tree, response) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).mergeDeepIn(ListTree, transformResponse(response, tree));
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

function create(state, tree, content, response, postContent) {
	var cleanedSubstate = cleanSubstate(state, content, tree);
	var ListTreeWithId = tree.shift().pop().push(response.id.toString());
	return setMaps(cleanedSubstate, ListTreeWithId).setIn(ListTreeWithId, transformResponse(response, ListTreeWithId.pop()).merge(postContent));
}

function cleanSubstate(state, content, ListTree, postContent) {
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
	return state.setIn(SubstateListTree, cleanCloneElement.merge(postContent));
}

function createError(state, tree, content, response) {
	return state.mergeDeepIn(tree, content.merge(response));
}

function createErrorContent(content, response) {
	if (content.id) {
		return (0, _immutable.Map)(content).set('errors', response);
	} else {
		var id = createId();
		return (0, _immutable.Map)(content).merge({
			id: id,
			errors: response
		});
	}
}

function update(state, tree, content) {
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var ListTree = tree.shift();
	var updatedState = setMaps(state, ListTree).mergeDeepIn(ListTree, (0, _immutable.Map)(content).mergeDeep(transformResponse(response, ListTree.pop())));
	return updatedState;
}

function updateFront(state, tree, content) {
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var ListTree = tree;
	return setMaps(state, ListTree).mergeDeepIn(ListTree, (0, _immutable.Map)(content).merge(response));
}

function destroy(state, tree, id) {
	var ListTree = (0, _immutable.List)(tree);
	var ListTreeWithId = ListTree;
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
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

function createId() {
	return Math.random().toString().slice(3);
}