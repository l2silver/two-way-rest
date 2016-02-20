'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.index = index;
exports.checkTreeState = checkTreeState;
exports.fromJSOrdered = fromJSOrdered;
exports.convertArrayToOrderedMap = convertArrayToOrderedMap;
exports.create = create;
exports.cleanSubstate = cleanSubstate;
exports.createError = createError;
exports.createErrorContent = createErrorContent;
exports.update = update;
exports.destroy = destroy;
exports.setMaps = setMaps;
exports.checkTreeExists = checkTreeExists;
exports.createId = createId;

var _immutable = require('immutable');

/*
So, what gets passed through fromJSOrdered? Everything? Why not?
What are the rules?

Lets cross that bridge when we get there->

So 
*/

function index(state, tree, response) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).setIn(ListTree, fromJSOrdered(response));
}

function checkTreeState() {}

function fromJSOrdered(js) {
	return (typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null ? js : Array.isArray(js) ? convertArrayToOrderedMap(js, fromJSOrdered) : (0, _immutable.Seq)(js).map(fromJSOrdered).toMap();
}

function convertArrayToOrderedMap(array, fn) {
	return (0, _immutable.Seq)(array).toKeyedSeq().mapEntries(function (_ref) {
		var _ref2 = _slicedToArray(_ref, 2);

		var k = _ref2[0];
		var v = _ref2[1];

		if (v.id) {
			return [v.id, fn(v)];
		} else {
			return [v, fn(v)];
		}
	}).toOrderedMap();
}

function create(state, tree, content, response) {
	console.log('tree in create', tree, content, response);
	var ListTree = (0, _immutable.List)(tree);
	var cleanedSubstate = cleanSubstate(state, content, ListTree);
	var ListTreeWithoutSubstate = ListTree.shift();
	console.log('ListTreeWithoutSubstate', ListTreeWithoutSubstate.toJS());
	return setMaps(cleanedSubstate, ListTreeWithoutSubstate).setIn(ListTreeWithoutSubstate.push(response.id.toString()), (0, _immutable.Map)(content).merge(response).merge({ tree: ListTreeWithoutSubstate.toJS() }));
}

function cleanSubstate(state, content, ListTree) {
	if (content.id) {
		var ListTreeWithSubstateId = ListTree.push(content.id.toString());
		var newId = createId();
		var ListTreeWithNewSubstateId = ListTree.push(newId);
		var cloneElement = state.getIn(ListTreeWithSubstateId);
		var cloneElementBaseAttributes = (0, _immutable.Map)({
			tree: cloneElement.get('tree'),
			reducer: cloneElement.get('reducer')
		});
		var stateWithCloneElement = state.setIn(ListTreeWithNewSubstateId, (0, _immutable.Map)().merge(cloneElementBaseAttributes.set('id', newId)));
		return stateWithCloneElement.deleteIn(ListTreeWithSubstateId);
	}
	return state;
}

function createError(state, tree, content, response) {
	var errorContent = createErrorContent(content, (0, _immutable.fromJS)(response));
	var substateTree = (0, _immutable.List)(tree).unshift('Substate').push(errorContent.get('id'));
	return setMaps(state, substateTree).setIn(substateTree, errorContent);
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

	console.log('inUpdate');
	var ListTree = (0, _immutable.List)(tree);
	var ListTreeWithId = ListTree.push(content.id);
	return setMaps(state, ListTreeWithId).mergeIn(ListTreeWithId, (0, _immutable.Map)(content).merge(response));
}

function destroy(state, tree, id) {
	var ListTree = (0, _immutable.List)(tree);
	var ListTreeWithId = ListTree.push(id);
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