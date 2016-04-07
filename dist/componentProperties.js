'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defaultGetProperties = exports.defaultPostCreateProperties = exports.defaultPostUpdateProperties = exports.defaultPostProperties = exports.defaultCreateSubstate = exports.defaultPostRenderProperties = exports.defaultPostRenderClickProperties = exports.defaultGetRenderProperties = exports.defaultProperties = exports.getTree = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.setStore = setStore;
exports.getStore = getStore;
exports.urlPath = urlPath;
exports.getIndex = getIndex;
exports.convertTree = convertTree;
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

var store;
function setStore(newStore) {
	store = newStore;
}
function getStore() {
	return store;
}

var i = (0, _i2.default)(true);

function urlPath(tree) {
	return '/' + tree.join('/');
}

function _getTree(start, location) {
	var fullUrl = (0, _immutable.List)(location.split('/'));
	var index = getIndex(start, fullUrl);
	var url = fullUrl.slice(index + 1);
	if (fullUrl.last() == 'edit' || fullUrl.last() == 'index' || fullUrl.last() == 'show') {
		return url.pop();
	}
	return url;
}

exports.getTree = _getTree;
function getIndex(start, fullUrl) {
	var index = fullUrl.indexOf(start);
	return index ? index : fullUrl.indexOf(_fetch.productionUrl) ? fullUrl.indexOf(_fetch.productionUrl) : -1;
}

function convertTree(tree) {
	if (Object.prototype.toString.call(tree) === '[object Array]') {
		return tree;
	} else {
		return tree.toList().toJS();
	}
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

var ignoreProps = {
	state: true,
	instance: true,
	instances: true,
	replace: true,
	children: true
};

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
		response: twr.props.response ? twr.props.response : false

	});
}

var defaultProperties = exports.defaultProperties = (0, _immutable.Map)({
	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	createDisposableContent: function createDisposableContent(content) {
		this.disposableContent = content;
	},
	resetDisposableContent: function resetDisposableContent() {
		this.disposableContent = false;
	},
	createContent: function createContent() {
		var content = this.disposableContent ? (0, _immutable.Map)(Object.assign({}, this.disposableContent)) : (0, _immutable.Map)(this.props.content);
		this.resetDisposableContent();
		return content;
	},
	submitContent: function submitContent(content) {
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
		console.log('samePage', (0, _immutable.is)(this.newPage(), this.newPage(nextProps)));
		return (0, _immutable.is)(this.newPage(), this.newPage(nextProps));
	},
	shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
		if (this.props.forceUpdate) {
			return true;
		}
		/*
  	I force the TWR components to update everytime because of a strange bug I cant figure out, 
  where components dont receive the most up-to-date state through redux connect. If anyone can figure this out...
  	*/
		return true;
		if (window.location.href != this.oldWindow) {
			this.oldWindow = window.location.href;
			return true;
		}
		return !this.sameGlobe(nextProps);
	},
	componentDidUpdate: function componentDidUpdate() {
		var _this = this;

		return benchmark('componentDidUpdate', function () {
			_this.resetFunction();
			if (_this.checkTreeChangeStatus) {
				_this.globalResetFunction();
				_this.checkTreeChangeStatus = false;
			}
		});
	},
	componentWillUpdate: function componentWillUpdate() {
		return this.checkTreeChange();
	},
	componentDidMount: function componentDidMount() {
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
	getState: function getState(props) {
		var useProps = this.whichProps(props);
		return useProps.state;
	},
	newPage: function newPage(props) {
		var State = this.getState(props);
		if (State) {
			var reducer = this.reducer();
			return State[reducer];
		}
		return false;
	},
	page: function page(props) {
		var State = this.newPage(props);
		if (State) {
			return State.set('_globeTWR', State);
		}
		return false;
	},
	instance: function instance(props) {
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
					if ((0, _immutable.is)((0, _immutable.Map)({ TWRShow: true }), instance.delete('_globeTWR'))) {
						return false;
					}
					var seqInstance = instance.toSeq();
					var _firstInstance = seqInstance.first();
					if (_firstInstance && _firstInstance.get) {
						if (_firstInstance.get('id')) {
							return seqInstance.map(function (_instance) {
								return _instance.set('_globeTWR', page);
							}).toOrderedMap();
						}
					}
					return instance.set('_globeTWR', page);
				}
				return instance;
			}
		}
		return false;
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
			return (0, _immutable.List)(props.tree);
		}
		if (props.location) {
			return _getTree(this.reducer(), props.location);
		}
		if (props.instance) {

			return props.instance.get('tree');
		}
		throw 'This instance has no tree instance, or location';
		//return getTree(this.reducer());
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return (0, _immutable.List)(this.props.outTree);
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
			customAction: this.customAction
		};
	}
});

var defaultGetRenderProperties = exports.defaultGetRenderProperties = {
	render: function render() {
		var _this2 = this;

		var DomTag = this.props.tag ? this.props.tag : 'div';

		if (this.props.forceRender || this.instance() && !(0, _immutable.is)(this.instance(), (0, _immutable.Map)({ TWRShow: true }))) {
			try {
				if (this.props.replace) {
					return this.props.replace(this);
				}
				var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
					if (child) {
						return _react2.default.cloneElement(child, _this2.childrenProps());
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
		var _this3 = this;

		var DomTag = this.props.tag ? this.props.tag : 'div';

		try {
			if (this.props.replace) {
				return this.props.replace(this);
			}

			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, _this3.childrenProps());
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
		var _this4 = this;

		var DomTag = this.props.tag ? this.props.tag : 'form';

		try {
			if (this.props.replace) {
				return this.props.replace(this);
			}

			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, _this4.childrenProps());
			});
			return _react2.default.createElement(
				DomTag,
				{ style: this.props.style, className: this.props.className ? 'twr ' + this.props.className : 'twr', onSubmit: this.submitForm },
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
		var _this5 = this;

		actionCreators.substateDeleteCreator(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this5.getId());
		}))(store.dispatch, store.getState);
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
		var _this6 = this;

		event.preventDefault();
		actionCreators.create(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this6.getId());
		}))(store.dispatch, store.getState);
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
			return (0, _immutable.List)(this.props.outTree);
		}
		return this.props.instance.get('tree');
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		actionCreators.update(createArgs(this, (0, _reactDom.findDOMNode)(this)))(store.dispatch, store.getState);
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
			return (0, _immutable.List)(this.props.outTree);
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