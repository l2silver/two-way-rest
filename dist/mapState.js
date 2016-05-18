'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.gex = gex;
exports.createTree = createTree;
exports.createOrderedMap = createOrderedMap;
exports.idArray = idArray;
exports.mergeWithoutList = mergeWithoutList;
exports.wrapMapState = wrapMapState;
exports.checklistWithId = checklistWithId;
exports.mapState = mapState;
exports.addToGLobe = addToGLobe;
exports.createMapObject = createMapObject;
exports.recursiveSetInitialObject = recursiveSetInitialObject;
exports.createInitialGlobe = createInitialGlobe;
exports.createNextGlobe = createNextGlobe;

var _immutable = require('immutable');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function gexTable(table) {
	if (Array.isArray(table)) {
		return table;
	}
	return [table];
}
function gexFirstInstance(instance) {
	if (instance) {
		return instance;
	}
	return 'none';
}

function gex(state, table, instance) {
	var _table = gexTable(table);
	var _firstInstance = gexFirstInstance(instance);
	try {

		var _lastInstance = _table.reduce(function (_previousInstance, _entry, _index) {
			if (_previousInstance === 'none') {
				return state.get(_entry);
			}
			if (_previousInstance) {
				var _instanceTWR = _previousInstance.get(_entry + 'TWR');

				if (_instanceTWR) {
					var pluralEntry = _entry.pluralize.toString();
					if (_immutable.List.isList(_instanceTWR)) {
						var orderedMap = _instanceTWR.reduce(function (orderedMap, id) {
							var _globeInstance = state.getIn([_entry.toString(), id.toString()]);
							if (_globeInstance && !_globeInstance.get('deleted_at')) {
								return orderedMap.set(id.toString(), _globeInstance);
							}
							return orderedMap;
						}, (0, _immutable.OrderedMap)());
						return orderedMap;
					}
					var _globeInstance = state.getIn([pluralEntry, _instanceTWR.toString()]);
					if (_globeInstance) {
						return _globeInstance;
					}
					return undefined;
				}
				var _nextInstance = _previousInstance.get(_entry.toString());
				return _nextInstance;
			}
			return _previousInstance;
		}, _firstInstance);
		return _lastInstance;
	} catch (e) {
		console.log('GEX ERROR', e);
		throw e;
	}
}

function createTree(k) {
	if (Array.isArray(k)) {
		return (0, _immutable.List)(k);
	}
	return (0, _immutable.List)([k]);
}

function createOrderedMap(children) {
	try {
		var orderedMap = children.reduce(function (orderedMap, child) {
			return orderedMap.set(child.get('id').toString(), child);
		}, (0, _immutable.OrderedMap)());
		return orderedMap;
	} catch (e) {
		console.log('orderedMap error', e, children);
	}
}

function idArray(children) {
	try {
		return children.reduce(function (list, child) {
			return list.push(child.get('id').toString());
		}, (0, _immutable.List)());
	} catch (e) {
		console.log('idArray error', e, children);
	}
}

function mergeWithoutList(prev, next) {
	if (prev && (typeof prev === 'undefined' ? 'undefined' : _typeof(prev)) == 'object') {
		if (_immutable.List.isList(prev)) {
			return next;
		} else {
			return prev.mergeWith(mergeWithoutList, next);
		}
	}
	return next;
}

function wrapMapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	var startTime = new Date().getTime();
	var startGlobe = (0, _immutable.Map)().asMutable();
	mapState(_immutable.Map.isMap(js) || _immutable.List.isList(js) ? js : (0, _immutable.fromJS)(js), tree, startGlobe);
	//console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeWith(mergeWithoutList, startGlobe.asImmutable());
	//return globe.mergeDeep(startGlobe.asImmutable());
}

function checklistWithId(js) {
	return _immutable.List.isList(js) && js.first() && js.first().get && js.first().get('id');
}

function mapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	try {
		if ((typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null) {
			return true;
			return globe.setIn(tree, js);
		}
		if (checklistWithId(js)) {

			var orderedMap = createOrderedMap(js);

			return addToGLobe(orderedMap, tree, globe);
		}
		return addToGLobe(js, tree, globe);
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
			if (!mapObject.skip) {
				try {
					createInitialGlobe(globe, mapObject);
					createNextGlobe(globe, mapObject);
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

function createMapObject(k, js, tree) {
	try {
		if (k == 'tree') {
			return {
				skip: true
			};
		}
		if (js && (typeof js === 'undefined' ? 'undefined' : _typeof(js)) === 'object') {
			if (checklistWithId(js)) {
				return {
					thisTree: tree.push(k + 'TWR'),
					nextTree: (0, _immutable.List)([k]),
					nextObject: createOrderedMap(js),
					thisObject: idArray(js)
				};
			}
			if (js.get('id')) {
				if (k != js.get('id')) {
					return {
						thisTree: tree.push(k + 'TWR'),
						nextTree: (0, _immutable.List)([k.pluralize]),
						nextObject: createOrderedMap((0, _immutable.List)([js])),
						thisObject: js.get('id').toString()
					};
				}
			}
		}
		var nextTree = tree.push(k);
		return {
			thisTree: nextTree,
			thisObject: js,
			nextTree: nextTree,
			nextObject: js
		};
	} catch (e) {
		console.log('mapOBJECT error', e);
		console.log('mapOBJECT js', js);
		console.log('mapOBJECT k', k);
	}
}

function recursiveSetInitialObject(globe, mapObject) {

	try {
		return globe.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
	} catch (e) {
		return globe.mergeIn(mapObject.get('thisTree').pop(), _defineProperty({}, mapObject.get('thisTree').last(), mapObject.get('thisObject')));
	}
}

function createInitialGlobe(globes, mapObject) {
	try {
		var _initialGlobe = globes.setIn(mapObject.thisTree, mapObject.thisObject);
	} catch (e) {
		console.log('create initialGlobe error', e, mapObject, globes.toJS());
	}
}
function createNextGlobe(globe, mapObject) {
	try {

		if (mapObject.nextObject) {
			if (mapObject.thisObject) {
				if (globe) {
					mapState(mapObject.nextObject, mapObject.nextTree, globe);
				}
			}
		}
	} catch (e) {
		console.log('Create Next Globe Error', e);
		console.log('Create Next Globe Error', mapObject);
		console.log('Create Next Globe Error', initialGlobe);
	}
}