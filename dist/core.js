'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.custom = custom;
exports.createTree = createTree;
exports.checkTWREntries = checkTWREntries;
exports.orderedMap = orderedMap;
exports.idArray = idArray;
exports.createMapObject = createMapObject;
exports.wrapMapState = wrapMapState;
exports.mapState = mapState;
exports.addToGLobe = addToGLobe;
exports.treeObject = treeObject;
exports.createInitialGlobe = createInitialGlobe;
exports.createNextGlobe = createNextGlobe;
exports.addTreeToObject = addTreeToObject;
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

function custom(state, fn) {
	return fn(state);
}

function createTree(k) {
	if (Array.isArray(k)) {
		return (0, _immutable.List)(k);
	}
	return (0, _immutable.List)([k]);
}

function checkTWREntries(_globe, _firstInstance, _tree) {
	var startTime = new Date().getTime();
	try {
		var _lastInstance = _tree.reduce(function (_previousInstance, _entry, _index, array) {
			if (_previousInstance) {
				var _instanceTWR = _previousInstance.get(_entry + 'TWR');
				if (_instanceTWR) {
					if (_immutable.List.isList(_instanceTWR)) {
						var _orderedMap = _instanceTWR.reduce(function (orderedMap, id) {
							var _globeInstance = _globe.getIn([_entry.toString(), id.toString()]);
							if (_globeInstance && !_globeInstance.get('deleted_at')) {
								return orderedMap.set(id.toString(), _globeInstance.set('_globeTWR', _globe));
							}
							return orderedMap;
						}, (0, _immutable.OrderedMap)());
						return _orderedMap;
					}
					var _globeInstance = _globe.getIn([_entry.pluralize.toString(), _instanceTWR.toString()]);
					if (_globeInstance) {
						return _globeInstance.set('_globeTWR', _globe);
					}
					return undefined;
				}
				return _previousInstance.get(_entry.toString());
			}
			return _previousInstance;
		}, _firstInstance);
		return _lastInstance;
	} catch (e) {
		console.log('Error in checkTWREntries', e);
	}
}

_immutable.Map.prototype.gex = function (k, notSetValue) {
	try {
		var _globe = this.get('_globeTWR');
		var _tree = createTree(k);
		if (_globe) {
			return checkTWREntries(_globe, this, _tree);
		}
		var _firstInstance = this.get(_tree.first());
		if (_firstInstance && _firstInstance.get) {
			var _foundGlobe = _firstInstance.get('_globeTWR');
			if (_foundGlobe) {
				return checkTWREntries(_foundGlobe, this, _tree);
			}
		}
		if (this.getIn(k)) {
			return this.getIn(k);
		}

		throw '_globeTWR must be defined';
	} catch (e) {
		console.log('Error in Gex', e);
		throw e;
	}
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
				isTree: true,
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
							nextObject: orderedMap(js),
							thisObject: idArray(js)
						});
					}
				}
				return (0, _immutable.Map)({
					thisTree: tree.push(k),
					thisObject: (0, _immutable.List)(js),
					nextObject: false
				});
			}
			if (js.id) {
				if (k != js.id) {
					return (0, _immutable.Map)({
						thisTree: tree.push(k + 'TWR'),
						nextTree: (0, _immutable.List)([k.pluralize]),
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

function wrapMapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	var startTime = new Date().getTime();

	var nextState = mapState(js.toJS ? js.toJS() : js, tree, (0, _immutable.Map)().asMutable());
	console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeDeep(nextState.asImmutable());
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
		if (_immutable.List.isList(js)) {
			return addToGLobe(js, tree, globe);
		}
		if (_immutable.Map.isMap(js)) {
			return addToGLobe(js.merge({ tree: tree }), tree, globe);
		}
		return addToGLobe((0, _immutable.Map)(js).merge({ tree: tree }), tree, globe);
	} catch (e) {
		console.log('in error');
		console.log('js', js, js.toJS ? js.toJS() : 'not immutable');
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
			if (globes && !mapObject.get('skip')) {
				try {
					if (mapObject.get('isTree')) {
						return treeObject(mapObject, globes);
					}
					var initialGlobe = createInitialGlobe(globes, mapObject);
					return createNextGlobe(initialGlobe, mapObject);
				} catch (e) {
					console.log('error in reduce addToGLobe', e, e.lineNumber);
				}
			}
			return globes;
		}, globe);
	} catch (e) {
		console.log('addToGLobe error', e);
	}
}

function treeObject(mapObject, globes) {
	try {
		if (mapObject.get('thisTree').size > 2) {
			var objectToAddTree = globes.getIn(mapObject.get('thisTree').pop());
			if (objectToAddTree && objectToAddTree.get && objectToAddTree.get('id')) {
				return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
			}
		}
		return globes;
	} catch (e) {
		console.log('treeObject error', e, mapObject.toJS());
	}
}

function createInitialGlobe(globes, mapObject) {
	try {
		if ((0, _immutable.is)(globes.getIn(mapObject.get('thisTree')), mapObject.get('thisObject'))) {
			return globes;
		}

		return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
	} catch (e) {
		console.log('create initialGlobe error', e, mapObject.toJS(), globes.toJS(), globes.getIn(mapObject.get('thisTree')));
	}
}
function createNextGlobe(initialGlobe, mapObject) {
	try {
		// && (!is(mapObject.get('thisTree'), mapObject.get('nextTree')) || !is(mapObject.get('thisObject'), mapObject.get('nextObject')) )  
		if (mapObject.get('nextObject')) {
			if (mapObject.get('thisObject')) {
				var nextGlobe = addTreeToObject(mapObject, initialGlobe);
				if (nextGlobe) {
					return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), initialGlobe));
				}
			}
		}
		return initialGlobe;
	} catch (e) {
		console.log('Create Next Globe Error', e, mapObject.toJS());
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

function setGet(state, tree) {
	return wrapMapState(true, tree, state);
}

function index(state, tree, response) {
	return wrapMapState(response, tree, state);
}

function show(state, tree, response) {
	try {
		return wrapMapState(response, tree, state);
	} catch (e) {
		console.log('show error', e);
	}
}

function substateCreate() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Map)() : arguments[0];
	var tree = arguments[1];
	var content = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	return state.set('Substate', wrapMapState((0, _immutable.Map)(content), tree, state.get('Substate')));
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
		return cloneElement.toSeq().mapEntries(function (_ref3) {
			var _ref4 = _slicedToArray(_ref3, 2);

			var k = _ref4[0];
			var v = _ref4[1];

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
		var nextState = wrapMapState(content.merge((0, _immutable.Map)(response)), outTree, liveGlobe);
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
	return wrapMapState(content.merge(response), outTree, liveGlobe);
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
	return state.set('Substate', wrapMapState(mergedContent, tree, Substate));
}