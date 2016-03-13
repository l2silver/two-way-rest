'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defaultGetProperties = exports.defaultPostCreateProperties = exports.defaultPostProperties = exports.defaultCreateSubstate = exports.defaultPostRenderProperties = exports.defaultPostRenderClickProperties = exports.defaultGetRenderProperties = exports.defaultProperties = undefined;
exports.urlPath = urlPath;
exports.getTree = getTree;
exports.createId = createId;
exports.convertTree = convertTree;
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var i = (0, _i2.default)(true);

function urlPath(tree) {
	return '/' + tree.join('/');
}

function getTree(start) {
	var location = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	var checkLocation = location ? location : window.location.href;
	var fullUrl = (0, _immutable.List)(checkLocation.split('/'));
	var index = fullUrl.indexOf(start);
	var url = fullUrl.slice(index + 1);
	if (fullUrl.last() == 'edit' || fullUrl.last() == 'index') {
		return url.pop();
	}
	return url;
}

function createId() {
	return Math.random().toString().slice(3);
}

function convertTree(tree) {
	if (Object.prototype.toString.call(tree) === '[object Array]') {
		return tree;
	} else {
		return tree.toList().toJS();
	}
}

function createArgs(twr, form) {
	return (0, _immutable.Map)({
		reducer: twr.context.reducer,
		tree: twr.tree(),
		outTree: twr.outTree(),
		path: twr.path(),
		form: form,
		content: (0, _immutable.Map)(twr.props.content),
		callforward: twr.props.callforward,
		callback: twr.props.callback,
		onSuccess: twr.props.onSuccess,
		onFailure: twr.props.onFailure,
		onSuccessCB: twr.props.onSuccessCB,
		onFailureCB: twr.props.onFailureCB,
		upload: twr.props.upload
	});
}

var defaultProperties = exports.defaultProperties = (0, _immutable.Map)({
	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	unmount: function unmount() {
		return true;
	},
	mount: function mount() {
		return true;
	},
	componentWillUpdate: function componentWillUpdate() {
		return this.checkTreeChange();
	},
	componentDidMount: function componentDidMount() {
		return this.checkTreeChange();
	},
	checkTreeChange: function checkTreeChange() {
		if (this.oldTree != this.tree) {
			if (this.oldTree == undefined) {
				this.mount();
			} else {
				this.unmount();
				this.mount();
			}
			return this.oldTree = this.tree();
		}
		return false;
	},
	page: function page() {
		if (this.props.state) {
			return this.props.state[this.context.reducer];
		}
		return false;
	},
	instance: function instance() {
		if (this.page() && this.tree()) {
			return this.page().getIn(this.tree());
		}
		return false;
	},
	tree: function tree() {
		if (this.props.tree) {

			return (0, _immutable.List)(this.props.tree);
		}
		if (this.props.instance) {

			return this.props.instance.get('tree');
		}
		if (this.props.location) {

			return getTree(this.context.reducer, this.props.location);
		}
		return getTree(this.context.reducer);
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
	}
});

var defaultGetRenderProperties = exports.defaultGetRenderProperties = {
	render: function render() {
		var _this = this;

		if (this.instance() && !(0, _immutable.is)(this.instance(), (0, _immutable.Map)({ TWRShow: true }))) {
			if (this.props.replace) {
				return this.props.replace(this);
			}
			var DomTag = this.props.tag ? this.props.tag : 'div';
			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, {
					instance: _this.instance(),
					instances: _this.instance(),
					getIn: _this.getIn,
					mapIf: _this.mapIf
				});
			});
			return _react2.default.createElement(
				DomTag,
				{ className: this.props.className ? 'twr ' + this.props.className : 'twr' },
				childrenWithProps
			);
		}
		return _react2.default.createElement('div', { style: { display: 'none' } });
	}
};

var defaultPostRenderClickProperties = exports.defaultPostRenderClickProperties = {
	render: function render() {
		var _this2 = this;

		if (this.instance()) {
			if (this.props.replace) {
				return this.props.replace(this);
			}
			var DomTag = this.props.tag ? this.props.tag : 'div';
			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, { instance: _this2.instance(), submitForm: _this2.submitForm });
			});
			return _react2.default.createElement(
				DomTag,
				{ className: this.props.className ? 'twr ' + this.props.className : 'twr', onClick: this.submitForm },
				childrenWithProps
			);
		}
		return _react2.default.createElement('div', { style: { display: 'none' } });
	}
};

var defaultPostRenderProperties = exports.defaultPostRenderProperties = {
	render: function render() {
		var _this3 = this;

		if (this.instance()) {
			if (this.props.replace) {
				return this.props.replace(this);
			}
			var DomTag = this.props.tag ? this.props.tag : 'form';
			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				return _react2.default.cloneElement(child, { instance: _this3.instance(), submitForm: _this3.submitForm });
			});
			return _react2.default.createElement(
				DomTag,
				{ className: this.props.className ? 'twr ' + this.props.className : 'twr', onSubmit: this.submitForm },
				childrenWithProps
			);
		}
		return _react2.default.createElement('div', { style: { display: 'none' } });
	}
};

var defaultCreateSubstate = exports.defaultCreateSubstate = {
	getId: function getId() {
		if (this.substateId) {
			return this.substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	mount: function mount() {
		var _this4 = this;

		this.props.substateCreate(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this4.getId());
		}));
	},
	unmount: function unmount() {
		var _this5 = this;

		this.props.substateDelete(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this5.getId());
		}));
	}
};

var defaultPostProperties = exports.defaultPostProperties = (0, _immutable.Map)({
	getId: function getId() {
		if (this.substateId) {
			return substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	submitForm: function submitForm(event) {
		var _this6 = this;

		event.preventDefault();
		this.props.create(createArgs(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this6.getId());
		}));
	},
	path: function path() {
		return urlPath(this.tree().shift().pop());
	}
});

var defaultPostCreateProperties = exports.defaultPostCreateProperties = (0, _immutable.Map)(defaultPostProperties).merge(defaultPostRenderProperties).merge(defaultCreateSubstate);

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