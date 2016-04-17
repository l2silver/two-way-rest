'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defaultGetProperties = exports.defaultPostCreateProperties = exports.defaultPostUpdateProperties = exports.defaultPostProperties = exports.defaultCreateSubstate = exports.defaultPostRenderProperties = exports.defaultPostRenderClickProperties = exports.defaultGetRenderProperties = exports.defaultIndexProperties = exports.defaultProperties = exports.getTree = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.setStore = setStore;
exports.getStore = getStore;
exports.urlPath = urlPath;
exports.generateTree = generateTree;
exports.getIndex = getIndex;
exports.createErrors = createErrors;
exports.benchmark = benchmark;
exports.createArgs = createArgs;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _creators = require('./creators');

var actionCreators = _interopRequireWildcard(_creators);

var _componentHelpers = require('./componentHelpers');

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _fetch = require('./fetch');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var i = (0, _i2.default)(true);
var store;
function setStore(newStore) {
	store = newStore;
}
function getStore() {
	return store;
}
function urlPath(tree) {
	return '/' + tree.join('/');
}
function generateTree(tree, Comp) {
	if ((typeof tree === 'undefined' ? 'undefined' : _typeof(tree)) == 'object') {
		return (0, _immutable.List)(tree);
	}
	if (tree.charAt(0) == '/') {
		return _getTree(Comp.reducer(), tree);
	}
	return _getTree(Comp.reducer(), tree);
}
function _getTree(start, location, remote) {
	var fullUrl = (0, _immutable.List)(location.split('/'));
	var index = getIndex(start, fullUrl, location, remote);
	var url = fullUrl.slice(index + 1);
	if (fullUrl.last() == 'edit' || fullUrl.last() == 'index' || fullUrl.last() == 'show') {
		return url.pop();
	}
	return url;
}

exports.getTree = _getTree;
function getIndex(start, fullUrl, location, url) {
	var remote = url ? url : _fetch.productionUrl;
	var index = fullUrl.indexOf(start);
	return index > 0 ? index : location.match(remote) ? fullUrl.size - location.replace(remote, '').split('/').length : -1;
}

function createErrors(instance) {
	if (instance && instance.get && instance.get('errors')) {
		var errors = instance.get('errors');
		if (errors) {
			return _react2.default.createElement(
				'div',
				{ className: 'default-errors' },
				(typeof errors === 'undefined' ? 'undefined' : _typeof(errors)) == 'object' ? (0, _componentHelpers.mapIf)((0, _immutable.Seq)(errors), function (error) {
					return _react2.default.createElement(
						'span',
						{ className: 'label label-danger' },
						error
					);
				}) : _react2.default.createElement(
					'span',
					{ className: 'label label-danger' },
					errors
				)
			);
		}
	}
	return '';
}
var benchmarkStatus = false;

function benchmark(name, fn) {
	if (benchmarkStatus) {
		var startTime = new Date().getTime();
		var result = fn();
		console.log(name, new Date().getTime() - startTime);
		return result;
	}
	return fn();
}

function createArgs(twr, form) {
	var holdBatchDispatch = new function () {
		var _this = this;

		this.dispatchList = [];
		this.addDispatch = function (action) {
			_this.dispatchList.push(action);
		};
		this.getDispatchList = function () {
			return _this.dispatchList;
		};
	}();
	return (0, _immutable.Map)({
		reducer: twr.reducer(),
		tree: twr.tree(),
		outTree: twr.outTree(),
		path: twr.path() + (twr.props.pathEnd ? twr.props.pathEnd : ''),
		form: form,
		content: twr.createContent(),
		callforward: twr.props.callforward,
		callback: twr.props.callback,
		onSuccess: twr.props.onSuccess,
		onFailure: twr.props.onFailure,
		onSuccessCB: twr.props.onSuccessCB,
		onFailureCB: twr.props.onFailureCB,
		upload: twr.props.upload,
		force: twr.props.force,
		outTrees: twr.props.outTrees,
		parent: twr.parent(),
		id: twr.props.id,
		twr: twr,
		response: twr.props.response ? twr.props.response : false,
		dispatch: holdBatchDispatch.addDispatch,
		getState: store.getState,
		batchDispatch: store.dispatch,
		dispatchList: holdBatchDispatch.getDispatchList()
	});
}

var defaultProperties = exports.defaultProperties = (0, _immutable.Map)({
	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired,
		listTables: _react2.default.PropTypes.func.isRequired,
		parent: _react2.default.PropTypes.object.isRequired
	},
	childContextTypes: {
		listTables: _react2.default.PropTypes.func.isRequired,
		parent: _react2.default.PropTypes.object.isRequired
	},
	getChildContext: function getChildContext() {
		return {
			listTables: this.addChildListTables,
			parent: this
		};
	},
	addChildListTables: function addChildListTables(childListTables) {
		this.childListTables.mergeDeep(childListTables);
	},
	setListTables: function setListTables(table) {
		this.listTables.setIn(['Live', table], (0, _immutable.Map)({ name: table, reducer: this.reducer() }));
	},
	getListTables: function getListTables() {
		return this.listTables.mergeDeep(this.childListTables);
	},
	gexTable: function gexTable(table) {
		if (Array.isArray(table)) {
			return table;
		}
		return [table];
	},
	gexCheckLast: function gexCheckLast() {},
	gexFirstInstance: function gexFirstInstance(instance) {
		if (instance) {
			return instance;
		}
		return 'none';
	},
	gexOrderedMap: function gexOrderedMap(orderedMap, id) {
		var _globeInstance = this.page().getIn([_entry.toString(), id.toString()]);
		if (_globeInstance && !_globeInstance.get('deleted_at')) {
			return orderedMap.set(id.toString(), _globeInstance.asMutable().set('tree', (0, _immutable.List)([pluralEntry, id.toString()])).asImmutable());
		}
		return orderedMap;
	},
	gex: function gex(table, instance) {
		var _this2 = this;

		var _table = this.gexTable(table);
		var _firstInstance = this.gexFirstInstance(instance);
		var _component = this;
		try {

			var _lastInstance = _table.reduce(function (_previousInstance, _entry, _index) {
				if (_previousInstance === 'none') {
					_this2.setListTables(_entry);
					return (0, _immutable.Seq)(_this2.page().get(_entry)).map(function (foundInst) {
						return foundInst.set('tree', (0, _immutable.List)([_entry, foundInst.get('id').toString()]));
					}).toOrderedMap();
				}
				if (_previousInstance) {
					var _instanceTWR = _previousInstance.get(_entry + 'TWR');

					if (_instanceTWR) {
						var _ret = function () {
							_this2.setListTables(_entry);

							var pluralEntry = _entry.pluralize.toString();
							if (_immutable.List.isList(_instanceTWR)) {
								var orderedMap = _instanceTWR.reduce(function (orderedMap, id) {
									var _globeInstance = this.page().getIn([_entry.toString(), id.toString()]);
									if (_globeInstance && !_globeInstance.get('deleted_at')) {
										return orderedMap.set(id.toString(), _globeInstance.asMutable().set('tree', (0, _immutable.List)([pluralEntry, id.toString()])).asImmutable());
									}
									return orderedMap;
								}.bind(_this2), (0, _immutable.OrderedMap)());
								return {
									v: orderedMap
								};
							}
							var _globeInstance = _this2.page().getIn([pluralEntry, _instanceTWR.toString()]);
							if (_globeInstance) {
								return {
									v: _globeInstance.asMutable().set('tree', (0, _immutable.List)([pluralEntry, _instanceTWR.toString()])).asImmutable()
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
			console.log('GEX ERROR', e);
			throw e;
		}
	},
	createDisposableContent: function createDisposableContent(content) {
		this.disposableContent = content;
	},
	resetDisposableContent: function resetDisposableContent() {
		this.disposableContent = false;
		this.additionalContent = false;
	},
	createContentType: function createContentType() {
		if (this.additionalContent) {
			return this.disposableContent ? (0, _immutable.Map)(Object.assign({}, this.disposableContent)).merge(this.props.content) : (0, _immutable.Map)(this.props.content);
		}
		return this.disposableContent ? (0, _immutable.Map)(Object.assign({}, this.disposableContent)) : (0, _immutable.Map)(this.props.content);
	},
	createContent: function createContent() {
		var content = this.createContentType();
		this.resetDisposableContent();
		return content;
	},
	submitContent: function submitContent(content) {
		this.combineContent = true;
		this.createDisposableContent(content);
		return this.submitForm({ preventDefault: function preventDefault() {
				return true;
			} });
	},
	submitAdditionalContent: function submitAdditionalContent(content) {
		this.additionalContent = true;
		this.createDisposableContent(content);
		return this.submitForm({ preventDefault: function preventDefault() {
				return true;
			} });
	},

	submitFormNE: function submitFormNE() {
		return this.submitForm({ preventDefault: function preventDefault() {
				return true;
			} });
	},
	globalResetFunction: function globalResetFunction() {
		try {
			if (this.props.noReset) {
				return true;
			}
			return (0, _reactDom.findDOMNode)(this).reset ? (0, _reactDom.findDOMNode)(this).reset() : false;
		} catch (e) {
			console.log('global reset function Error', e);
		}
	},
	parent: function parent() {
		return false;
	},
	unmount: function unmount() {
		return true;
	},
	mount: function mount() {
		return true;
	},
	sameGlobe: function sameGlobe(nextProps) {
		var _this3 = this;

		var listTables = this.getListTables();
		var live = listTables.get('Live');
		if (live) {
			var bool = live.toSeq().reduce(function (bool, table) {
				var tableName = table.get('name');
				var reducer = table.get('reducer');

				if (bool) {
					return _this3.props.state[reducer].get(tableName) == nextProps.state[reducer].get(tableName);
				}
				return false;
			}, true);
			if (!bool) {
				return bool;
			}
		}

		var substate = listTables.get('Substate');
		if (substate) {
			return substate.toSeq().reduce(function (bool, table) {
				var tableName = table.get('name');
				var reducer = table.get('reducer');
				if (bool) {
					return _this3.props.state[reducer].getIn(['Substate', tableName]) == nextProps.state[reducer].getIn(['Substate', tableName]);
				}
				return false;
			}, true);
		}
		return true;
	},
	checkShouldComponentUpdate: function checkShouldComponentUpdate(nextProps) {
		var _this4 = this;

		if (this.props.forceUpdate) {
			return true;
		}
		if (window.location.href != this.oldWindow) {
			this.oldWindow = window.location.href;
			return true;
		}

		var propNames = Object.keys(nextProps);
		var newProps = propNames.reduce(function (bool, propName) {
			if (bool) {
				return bool;
			}
			switch (propName) {
				case 'state':
					return bool;
			}
			if (nextProps[propName] == _this4.props[propName]) {
				return false;
			}
			return true;
		}, false);

		if (newProps) {
			return true;
		}

		return !this.sameGlobe(nextProps);
	},
	shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
		if (this.checkShouldComponentUpdate(nextProps)) {
			this.getInstance = undefined;
			this.getPage = undefined;
			return true;
		}
		return false;
	},
	componentDidUpdate: function componentDidUpdate() {
		this.context.listTables(this.getListTables());
	},
	componentWillMount: function componentWillMount() {
		var tableName = this.tree().first();
		this.listTables = (0, _immutable.Map)().asMutable();
		if (this.globeType()) {
			this.listTables.set('Substate', (0, _immutable.Map)(_defineProperty({}, tableName, (0, _immutable.Map)({ name: tableName, reducer: this.reducer() }))).asMutable());
		} else {
			this.listTables.set('Live', (0, _immutable.Map)(_defineProperty({}, tableName, (0, _immutable.Map)({ name: tableName, reducer: this.reducer() }))).asMutable());
		}
		this.childListTables = (0, _immutable.Map)().asMutable();
	},
	componentWillUpdate: function componentWillUpdate() {
		this.resetFunction();
		return this.checkTreeChange();
	},
	componentDidMount: function componentDidMount() {
		this.context.listTables(this.getListTables());
		return this.checkTreeChange();
	},
	checkForDifferentPageRerender: function checkForDifferentPageRerender(oldTree, newTree) {
		if (oldTree) {
			if (oldTree.size != newTree.size) {
				return true;
			}
			if (oldTree.size <= 1) {
				if ((0, _immutable.is)(oldTree, newTree)) {
					return false;
				}
				return true;
			}
			var oldId = oldTree.last();
			var oldPrefix = oldTree.pop().join('/');
			var newId = newTree.last();
			var newPrefix = newTree.pop().join('/');

			if (isNaN(oldId)) {
				if (oldId != newId) {
					return true;
				}
			}
			if (oldPrefix != newPrefix) {
				return true;
			}
		}
		return false;
	},
	checkTreeChange: function checkTreeChange() {
		var tree = this.tree();
		if ((0, _immutable.is)(this.oldTree, tree)) {
			return false;
		}
		if (this.oldTree == undefined) {
			this.mount();
			this.mountFunctions();
		} else {
			this.unmount();
			this.mount();
			this.mountFunctions();
		}
		this.oldTree = tree;
		this.checkTreeChangeStatus = true;
		return true;
	},
	startFunction: function startFunction() {
		try {
			return this.props.startFunction ? this.props.startFunction(this) : false;
		} catch (e) {
			console.log('start function Error', e);
		}
	},
	whichProps: function whichProps(props) {
		if (props) {
			return props;
		}
		return this.props;
	},
	tree: function tree(props) {
		var useProps = this.whichProps(props);
		return this.getTree(useProps);
	},
	getState: function getState() {
		var useProps = this.whichProps(props);
		return useProps.state;
	},
	newPage: function newPage() {
		var State = this.props.state;
		if (State) {
			var reducer = this.reducer();
			return State[reducer];
		}
		return false;
	},
	generatePage: function generatePage() {
		var State = this.newPage();
		if (State) {
			return State;
		}
		return false;
	},
	page: function page() {
		if (_typeof(this.getPage) != undefined) {
			this.getPage = this.generatePage();
		}
		return this.getPage;
	},
	generateInstance: function generateInstance(props) {
		var useProps = this.whichProps(props);
		var tree = this.tree(useProps);
		var page = this.page(useProps);
		if (page && tree) {
			var globeType = this.globeType();
			if (globeType) {
				var State = page.get(globeType);
				if (State) {
					return State.getIn(tree);
				}
				return (0, _immutable.Map)();
			}
			var instance = page.getIn(tree);
			if (instance) {
				if (instance.set) {
					if ((0, _immutable.is)((0, _immutable.Map)({ TWRShow: true }), instance)) {
						return false;
					}
					if (this.index()) {
						var seqInstance = instance.toSeq();
						var _firstInstance = seqInstance.first();

						if (_firstInstance && _firstInstance.get) {
							if (_firstInstance.get('id')) {
								return seqInstance.map(function (_instance) {
									return _instance.set('tree', (0, _immutable.List)([tree.last(), _instance.get('id').toString()]));
								}).toOrderedMap();
							}
						}
						return false;
					}

					return instance.set('tree', (0, _immutable.List)(tree));
				}
				return instance;
			}
		}
		return false;
	},
	instance: function instance(props) {
		if (props || _typeof(this.getInstance) != undefined) {
			this.getInstance = this.generateInstance(props);
		}
		return this.getInstance;
	},

	resetFunction: function resetFunction() {
		return true;
	},
	mountFunctions: function mountFunctions() {
		this.globalResetFunction();
		this.startFunction();
	},
	reducer: function reducer() {
		if (this.props.reducer) {
			return this.props.reducer;
		}
		return this.context.reducer;
	},
	custom: function custom(fn) {
		return actionCreators.customCreator(this.reducer(), fn)(store.dispatch, store.getState);
	},
	customAction: function customAction(fn) {
		return actionCreators.customAction(this.reducer(), fn);
	},
	globeType: function globeType() {
		return false;
	},
	instances: function instances() {
		return this.instance();
	},
	getTree: function getTree(props) {
		if (props.tree) {
			return generateTree(props.tree, this);
		}
		if (props.location) {
			return _getTree(this.reducer(), props.location);
		}
		if (props.instance) {

			return props.instance.get('tree');
		}
		throw 'This instance has no tree instance, or location' + props.tree;
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return generateTree(props.outTree, this);
		}
		return this.tree();
	},
	path: function path() {
		if (this.props.path) {
			return this.props.path;
		}
		return urlPath(this.tree());
	},
	childrenProps: function childrenProps() {
		return {
			instance: this.instance(),
			instances: this.instance(),
			submitForm: this.submitForm,
			submitContent: this.submitContent,
			page: this.page(),
			custom: this.custom,
			customAction: this.customAction,
			gex: this.gex
		};
	},
	index: function index() {
		return false;
	}

});

var defaultIndexProperties = exports.defaultIndexProperties = (0, _immutable.Map)({
	index: function index() {
		return true;
	}
});

var defaultGetRenderProperties = exports.defaultGetRenderProperties = {
	render: function render() {
		var _this5 = this;

		var DomTag = this.props.tag ? this.props.tag : 'div';

		if (this.props.forceRender || this.instance() && !(0, _immutable.is)(this.instance(), (0, _immutable.Map)({ TWRShow: true }))) {
			try {
				if (this.props.replace) {
					return this.props.replace(this);
				}
				var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
					if (child) {
						return _react2.default.cloneElement(child, _this5.childrenProps());
					}
				});
				return _react2.default.createElement(
					DomTag,
					{ style: this.props.style, className: this.props.className ? 'twr ' + this.props.className : 'twr' },
					childrenWithProps,
					createErrors(this.instance())
				);
			} catch (e) {
				console.log('RENDER ERROR GET', this.tree().toJS(), e);
			}
		}
		return _react2.default.createElement(DomTag, { style: { display: 'none' } });
	}
};

var defaultPostRenderClickProperties = exports.defaultPostRenderClickProperties = {
	render: function render() {
		var _this6 = this;

		var DomTag = this.props.tag ? this.props.tag : 'div';

		try {
			if (this.props.replace) {
				return this.props.replace(this);
			}

			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, _this6.childrenProps());
			});
			return _react2.default.createElement(
				DomTag,
				{ style: this.props.style, className: this.props.className ? 'twr ' + this.props.className : 'twr', onClick: this.submitForm },
				childrenWithProps,
				createErrors(this.instance())
			);
		} catch (e) {
			console.log('RENDER ERROR POST CLICK', this.tree().toJS(), e);
		}

		return _react2.default.createElement(DomTag, { style: { display: 'none' } });
	}
};

var defaultPostRenderProperties = exports.defaultPostRenderProperties = {
	render: function render() {
		var _this7 = this;

		var DomTag = this.props.tag ? this.props.tag : 'form';

		try {
			if (this.props.replace) {
				return this.props.replace(this);
			}

			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, _this7.childrenProps());
			});
			return _react2.default.createElement(
				DomTag,
				{ style: this.props.style, className: this.props.className ? 'twr ' + this.props.className : 'twr', onClick: this.props.click ? this.submitForm : function () {}, onSubmit: this.submitForm },
				childrenWithProps,
				createErrors(this.instance())
			);
		} catch (e) {
			console.log('RENDER ERROR POST', this.tree().toJS(), e);
		}

		return _react2.default.createElement(DomTag, { style: { display: 'none' } });
	}
};

var defaultCreateSubstate = exports.defaultCreateSubstate = {
	getId: function getId() {
		if (this.props.id) {
			return this.props.id;
		}
		if (this.substateId) {
			return this.substateId;
		}
		this.substateId = (0, _componentHelpers.createId)();
		return this.substateId;
	},
	unmount: function unmount() {
		var _this8 = this;

		actionCreators.substateDeleteCreator(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this8.getId());
		}));
	}
};

var defaultPostProperties = exports.defaultPostProperties = (0, _immutable.Map)({
	globeType: function globeType() {
		return 'Substate';
	},
	getId: function getId() {
		if (this.substateId) {
			return substateId;
		}
		this.substateId = (0, _componentHelpers.createId)();
		return this.substateId;
	},
	submitForm: function submitForm(event) {
		var _this9 = this;

		event.preventDefault();
		actionCreators.create(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this9.getId());
		}));
	},
	path: function path() {
		if (this.props.path) {
			return this.props.path;
		}
		return urlPath(this.tree().pop());
	}
});

var defaultPostUpdateProperties = exports.defaultPostUpdateProperties = (0, _immutable.Map)({
	globeType: function globeType() {
		return 'Substate';
	},
	getTree: function getTree(props) {
		var tree = props.instance.get('tree').pop().push(this.getId());
		return tree;
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return generateTree(props.outTree, this);
		}
		return this.props.instance.get('tree');
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		actionCreators.update(createArgs(this, (0, _reactDom.findDOMNode)(this)));
	},
	path: function path() {
		return urlPath(this.props.instance.get('tree'));
	}
});

var defaultPostCreateProperties = exports.defaultPostCreateProperties = (0, _immutable.Map)(defaultPostProperties).merge(defaultPostRenderProperties).merge(defaultCreateSubstate).merge({
	resetFunction: function resetFunction() {
		try {
			if (this.props.noReset) {
				return true;
			}
			var instance = this.instance();
			if (instance && instance.get) {
				var lastCreatedId = instance.get('lastCreatedId');
				if (lastCreatedId && lastCreatedId != this.lastCreatedId) {
					this.lastCreatedId = lastCreatedId;
					return (0, _reactDom.findDOMNode)(this).reset ? (0, _reactDom.findDOMNode)(this).reset() : false;
				}
			}
		} catch (e) {
			console.log('reset function Error', e);
		}
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return generateTree(props.outTree, this);
		}
		return this.tree().pop();
	}
});

var defaultGetProperties = exports.defaultGetProperties = (0, _immutable.Map)({
	mapIf: function mapIf(instances, mapFn, instead) {
		if (instances === undefined) {
			return;
		}
	},
	getIn: function getIn(instance, tree, instead) {
		if (instance.getIn(tree) === undefined) {
			return this.triggerGet();
		}
	}
}).merge(defaultGetRenderProperties);