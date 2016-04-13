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
					var _ret = function () {
						var pluralEntry = _entry.pluralize.toString();
						if (_immutable.List.isList(_instanceTWR)) {
							var _orderedMap = _instanceTWR.reduce(function (orderedMap, id) {
								var _globeInstance = _globe.getIn([_entry.toString(), id.toString()]);
								if (_globeInstance && !_globeInstance.get('deleted_at')) {
									return orderedMap.set(id.toString(), _globeInstance.asMutable().set('_globeTWR', _globe).set('tree', (0, _immutable.List)([pluralEntry, id.toString()])).asImmutable());
								}
								return orderedMap;
							}, (0, _immutable.OrderedMap)());
							return {
								v: _orderedMap
							};
						}
						var _globeInstance = _globe.getIn([pluralEntry, _instanceTWR.toString()]);
						if (_globeInstance) {
							return {
								v: _globeInstance.asMutable().set('_globeTWR', _globe).set('tree', (0, _immutable.List)([pluralEntry, _instanceTWR.toString()])).asImmutable()
							};
						}
						return {
							v: undefined
						};
					}();

					if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
				}
				var _nextInstance = _previousInstance.get(_entry.toString());
				return _nextInstance;
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
	try {
		return children.reduce(function (orderedMap, child) {
			return orderedMap.set(child.get('id').toString(), child);
		}, (0, _immutable.OrderedMap)());
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

function wrapMapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	var startTime = new Date().getTime();
	var nextState = mapState(_immutable.Map.isMap(js) || _immutable.List.isList(js) ? js : (0, _immutable.fromJS)(js), tree, (0, _immutable.Map)().asMutable());
	//console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeDeep(nextState.asImmutable());
}

function checklistWithId(js) {
	return _immutable.List.isList(js) && js.first() && js.first().get && js.first().get('id');
}

/*

What does the mapState function do.

It takes a regularJS object, converts it to an immutableObject, and changes relational data 

*/

function mapState(js, tree) {
	var globe = arguments.length <= 2 || arguments[2] === undefined ? (0, _immutable.Map)() : arguments[2];

	try {
		if ((typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null) {
			return globe.setIn(tree, js);
		}
		if (checklistWithId(js)) {
			return addToGLobe(orderedMap(js), tree, globe);
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
			if (globes && !mapObject.get('skip')) {
				try {
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

function createMapObject(k, js, tree) {
	var random = Math.floor(Math.random() * 100 + 1);
	try {
		if (k == 'tree' || k == '_globeTWR') {
			return (0, _immutable.Map)({
				skip: true
			});
		}
		if (js && (typeof js === 'undefined' ? 'undefined' : _typeof(js)) === 'object') {
			if (checklistWithId(js)) {
				return (0, _immutable.Map)({
					thisTree: tree.push(k + 'TWR'),
					nextTree: (0, _immutable.List)([k]),
					nextObject: orderedMap(js),
					thisObject: idArray(js)
				});
			}
			if (js.get('id')) {
				if (k != js.get('id')) {
					return (0, _immutable.Map)({
						thisTree: tree.push(k + 'TWR'),
						nextTree: (0, _immutable.List)([k.pluralize]),
						nextObject: orderedMap((0, _immutable.List)([js])),
						thisObject: js.get('id').toString()
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

function recursiveSetInitialObject(globe, mapObject) {

	try {
		return globe.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
	} catch (e) {
		return globe.mergeIn(mapObject.get('thisTree').pop(), _defineProperty({}, mapObject.get('thisTree').last(), mapObject.get('thisObject')));
	}
}

function createInitialGlobe(globes, mapObject) {
	try {
		if ((0, _immutable.is)(globes.getIn(mapObject.get('thisTree')), mapObject.get('thisObject'))) {
			return globes;
		}
		var initialGlobe = recursiveSetInitialObject(globes, mapObject);
		return initialGlobe;
	} catch (e) {
		console.log('create initialGlobe error', e, mapObject.toJS(), globes.toJS(), globes.getIn(mapObject.get('thisTree')));
	}
}
function createNextGlobe(initialGlobe, mapObject) {
	try {
		if (mapObject.get('nextObject')) {
			if (mapObject.get('thisObject')) {

				var nextGlobe = initialGlobe;
				if (nextGlobe) {
					var mergeWithGlobe = mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), initialGlobe);
					if (mergeWithGlobe) {
						try {
							return nextGlobe.mergeDeep(mergeWithGlobe);
						} catch (e) {
							return mergeWithGlobe.mergeDeep(nextGlobe);
						}
					}
				}
			}
		}
		return initialGlobe;
	} catch (e) {
		console.log('Create Next Globe Error', e);
		console.log('Create Next Globe Error', mapObject);
		console.log('Create Next Globe Error', initialGlobe);
	}
}