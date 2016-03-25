'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createTree = createTree;
exports.checkTWREntries = checkTWREntries;
exports.orderedMap = orderedMap;
exports.idArray = idArray;
exports.createMapObject = createMapObject;
exports.mapState = mapState;
exports.addToGLobe = addToGLobe;
exports.addTreeToObject = addTreeToObject;
exports.setGet = setGet;
exports.setShow = setShow;
exports.index = index;
exports.show = show;
exports.substateCreate = substateCreate;
exports.substateDelete = substateDelete;
exports.cleanSubstate = cleanSubstate;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.createError = createError;
exports.updateFront = updateFront;

var _immutable = require('immutable');

var _componentHelpers = require('./componentHelpers');

function createTree(k) {
	if (Array.isArray(k)) {
		return (0, _immutable.List)(k);
	}
	return (0, _immutable.List)([k]);
}

function checkTWREntries(_globe, _firstInstance, _tree) {

	var _lastInstance = _tree.reduce(function (_previousInstance, _entry, _index, array) {
		var _instanceTWR = _previousInstance.get(_entry + 'TWR');
		if (_instanceTWR) {
			if (_immutable.List.isList(_instanceTWR)) {
				var _orderedMap = _instanceTWR.reduce(function (orderedMap, id) {
					var _globeInstance = _globe.getIn([_entry.toString(), id.toString()]);
					if (_globeInstance) {
						return orderedMap.set(id.toString(), _globeInstance);
					}
					return orderedMap;
				}, (0, _immutable.OrderedMap)());
				return _orderedMap;
			}
			return _globe.getIn([_entry.pluralize.toString(), _instanceTWR.toString()]);
		}
		return _previousInstance.get(_entry.toString());
	}, _firstInstance);
	if (_immutable.Map.isMap(_lastInstance) || _immutable.OrderedMap.isOrderedMap(_lastInstance)) {
		return _lastInstance.set('_globeTWR', _globe);
	}
	return _lastInstance;
}

_immutable.Map.prototype.gex = function (k, notSetValue) {
	var _root = this._root;
	var _globe = _root.get(0, undefined, '_globeTWR', notSetValue);
	var _tree = createTree(k);
	if (_globe) {
		return checkTWREntries(_globe, this, _tree);
	}
	throw '_globeTWR must be defined';
};

function orderedMap(children) {
	return children.reduce(function (orderedMap, child) {
		return orderedMap.set(child.id.toString(), child);
	}, (0, _immutable.OrderedMap)());
}

function idArray(children) {
	return children.reduce(function (list, child) {
		return list.push(child.id.toString());
	}, (0, _immutable.List)());
}

function createMapObject(k, js, tree) {
	var random = Math.floor(Math.random() * 100 + 1);
	try {
		if (k == 'tree') {
			return (0, _immutable.Map)({
				tree: true,
				thisTree: tree.push(k),
				thisObject: js
			});
		}
		if (js && (typeof js === 'undefined' ? 'undefined' : _typeof(js)) === 'object') {
			if (Array.isArray(js)) {
				if (js[0]) {
					if (js[0].id) {
						return (0, _immutable.Map)({
							thisTree: tree.push(k + 'TWR'),
							nextTree: (0, _immutable.List)([k]),
							deleteTree: tree.push(k),
							nextObject: orderedMap(js),
							thisObject: idArray(js)
						});
					}
				}
			}
			if (js.id) {
				if (k != js.id) {
					return (0, _immutable.Map)({
						thisTree: tree.push(k + 'TWR'),
						nextTree: (0, _immutable.List)([k.pluralize]),
						deleteTree: tree.push(k),
						nextObject: orderedMap([js]),
						thisObject: js.id.toString()
					});
				}
			}
		}
		return (0, _immutable.Map)({
			thisTree: tree.push(k),
			thisObject: js,
			nextTree: tree.push(k),
			nextObject: js
		});
	} catch (e) {
		console.log(random, 'mapOBJECT error', e);
		console.log('mapOBJECT js', js);
		console.log('mapOBJECT k', k);
	}
}
function mapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];


	//console.log('mapState js', js)
	if ((typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null) {
		return globe.setIn(tree, js);
	}
	if (Array.isArray(js)) {
		if (js[0]) {
			if (js[0].id) {
				return addToGLobe(orderedMap(js), tree, globe);
			}
		}
		return addToGLobe(js, tree, globe);
	}
	try {
		if (_immutable.Map.isMap(js)) {
			return addToGLobe(js.merge({ tree: tree }), tree, globe);
		}
		return addToGLobe((0, _immutable.Map)(js).merge({ tree: tree }), tree, globe);
	} catch (e) {
		console.log('in error');
		console.log('js', js);
		console.log('tree', tree.toJS());
		console.log(e);
		throw e;
	}
}

function addToGLobe(js, tree, globe) {
	try {

		return (0, _immutable.Seq)(js).toKeyedSeq().mapEntries(function (_ref) {
			var _ref2 = _slicedToArray(_ref, 2);

			var k = _ref2[0];
			var v = _ref2[1];

			return [k, createMapObject(k, v, tree)];
		}).reduce(function (globes, mapObject) {
			try {
				if (mapObject.get('tree')) {
					if (mapObject.get('thisTree').size > 2) {
						var objectToAddTree = globes.getIn(mapObject.get('thisTree').pop());
						if (objectToAddTree && objectToAddTree.get('id')) {
							return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
						}
					}
					return globes;
				}
				var random = Math.floor(Math.random() * 100 + 1);
				var initialGlobe = globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
				if (mapObject.get('thisObject')) {
					var nextGlobe = addTreeToObject(mapObject, initialGlobe);
					return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), globes));
				}
				return initialGlobe;
			} catch (e) {
				console.log('error in addToGLobe', e, e.lineNumber);
			}
		}, globe);
	} catch (e) {
		console.log('addToGLobeFull', e);
	}
}

function addTreeToObject(mapObject, globes) {
	try {
		if (_typeof(mapObject.get('thisObject')) == 'object' && !Array.isArray(mapObject.get('thisObject')) && !_immutable.List.isList(mapObject.get('thisObject')) && !_immutable.OrderedMap.isOrderedMap(mapObject.get('thisObject'))) {

			if (_immutable.Map.isMap(mapObject.get('thisObject'))) {
				if (mapObject.get('thisObject').get('id')) {
					return globes.mergeIn(mapObject.get('thisTree'), { tree: mapObject.get('thisTree') });
				}
			} else {
				if (mapObject.get('thisObject').id) {
					return globes.setIn(mapObject.get('thisTree'), (0, _immutable.Map)(mapObject.get('thisObject')).merge({ tree: mapObject.get('thisTree') }));
				}
			}
		}
		return globes;
	} catch (e) {
		console.log("ERROR IN addTreeToObject", e);
	}
}

/*
export function transformResponse(js, tree){
	if(typeof js !== 'object' || js === null){
		return js;
	}else{
		if(Array.isArray(js)){
			return convertArrayToOrderedMap(js, transformResponse, tree);
		}else{
			return transformObject(js, tree);
		}
	}
}

export function transformObject(js, tree){
	if(js.id){
		const newTree = List(tree).push(js.id.toString());
		return Seq(js).mapEntries(([k, v]) => {
			return [k, transformResponse(v, newTree.push(k))]
		}).toMap().merge({tree: newTree});
	}else{
		return Map(js);
	}
}

export function convertArrayToOrderedMap(array, fn, tree){
	return Seq(array).toKeyedSeq().mapEntries(([k, v]) =>
	 {
	 	if(v.id){
	 		return [v.id.toString(), fn(v, tree)]	
	 	}else{
	 		return [v, fn(v, tree)]	
	 	}
	 }).toOrderedMap();
}


export function fromJSOrdered(js) {
	return typeof js !== 'object' || js === null ? js : 
	Array.isArray(js) ? convertArrayToOrderedMap(js, fromJSOrdered): 
	Seq(js).map(fromJSOrdered).toMap();
}


export function setMaps(state, tree){
	const stateTree = tree.reduce((stateTree, tree)=>{
		const trees = stateTree.get('trees').push(tree);
		const state = stateTree.get('state');		
		const newState = checkTreeExists(state, trees, tree)
		return Map({
			  state: newState
			, trees
		})
		
	}, 
	Map({
		  state
		, trees: List()
		})
	);
	return stateTree.get('state');
}

export function checkTreeExists(state, trees, tree){
	if(state.hasIn(trees)){
			return state
	}else{
		if(isNaN(tree)){
			return state.setIn(trees, OrderedMap());
		}else{
			return state.setIn(trees, Map());
		}
	}
}
*/

function setGet(state, tree) {
	return mapState(true, tree, state);
}

function setShow(state, tree) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).setIn((0, _componentHelpers.checkShow)(ListTree), true);
}

function index(state, tree, response) {
	return mapState(response, tree, state);
}

function show(state, tree, response) {
	return mapState(response, tree, state);
}

function substateCreate(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	return state.set('Substate', mapState((0, _immutable.Map)(content), tree, state.get('Substate')));
}

function substateDelete(state, tree, content) {
	var ListTreeWithId = tree;
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
}

function cleanSubstate(state, tree) {
	var cloneElement = state.getIn(tree);
	var cleanCloneElement = cloneElement.toSeq().mapEntries(function (_ref3) {
		var _ref4 = _slicedToArray(_ref3, 2);

		var k = _ref4[0];
		var v = _ref4[1];

		if (k == 'tree' || k == 'id') {
			return [k, v];
		} else {
			return [k, ''];
		}
	}).toMap();
	return state.setIn(tree, cleanCloneElement);
}

function create(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];
	var parent = arguments[5];


	var precleanedSubstate = state.get('Substate');
	var Substate = cleanSubstate(precleanedSubstate, tree);
	var liveGlobe = state.set('Substate', Substate);
	var nextState = mapState(content.merge((0, _immutable.Map)(response)), outTree, liveGlobe);
	if (parent) {
		var _ret = function () {
			var childName = tree.first() + 'TWR';
			var childId = outTree.last().toString();
			console.log('parent', parent.toJS(), state.toJS());
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
}

function update(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	var outTree = arguments[4];

	var precleanedSubstate = state.get('Substate');
	var Substate = cleanSubstate(precleanedSubstate, tree);
	var liveGlobe = state.set('Substate', Substate);
	return mapState(content.merge(response), outTree, liveGlobe);
}

function destroy(state, tree, outTree) {
	console.log('outTree', outTree.toJS());
	var precleanedSubstate = state.get('Substate');
	var Substate = cleanSubstate(precleanedSubstate, tree);
	return state.deleteIn(outTree).set('Substate', Substate);
}

function createError(state, tree) {
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var Substate = state.get('Substate');
	var mergedContent = content.merge(response);
	return state.set('Substate', mapState(mergedContent, tree, Substate));
}

function updateFront(state, tree, content) {
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var ListTree = tree;
	return setMaps(state, ListTree).mergeDeepIn(ListTree, (0, _immutable.Map)(content).merge(response));
}