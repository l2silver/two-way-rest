'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TWRDestroyFront = exports.TWRDestroy = exports.TWRXUpdate = exports.TWRUpdate = exports.TWRCreateChild = exports.TWRCreateFront = exports.TWRCreate = exports.TWRLink = exports.TWRIndexFront = exports.TWRShowFront = exports.TWRShow = exports.TWRIndex = exports.TWRBreadCrumbs = exports.DeclareReducer = exports.StupidTWRLink = exports.StupidTWRBreadCrumbs = exports.StupidTWRCreateChild = exports.StupidTWRCreateFront = exports.StupidTWRCreate = exports.StupidTWRIndexFront = exports.StupidTWRShowFront = exports.StupidTWRShow = exports.StupidTWRIndex = exports.StupidTWRDestroyFront = exports.StupidTWRDestroy = exports.StupidTWRXUpdate = exports.StupidTWRUpdateFront = exports.StupidTWRUpdate = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

var _componentProperties = require('./componentProperties');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var i = (0, _i2.default)(true);

var StupidTWRUpdate = exports.StupidTWRUpdate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderProperties).merge({
	globeType: function globeType() {
		return 'Substate';
	},
	tree: function tree() {
		var tree = this.props.instance.get('tree').pop().push(this.getId());
		return tree;
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return (0, _immutable.List)(this.props.outTree);
		}
		return this.props.instance.get('tree');
	},
	submitForm: function submitForm(event) {
		var _this = this;

		event.preventDefault();
		this.props.update((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this.getId());
		}));
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.props.instance.get('tree'));
	}
}).toJS());

var StupidTWRUpdateFront = exports.StupidTWRUpdateFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderProperties).merge({
	getId: function getId() {
		return this.props.instance.get('id');
	},
	tree: function tree() {
		return (0, _immutable.List)(this.props.instance.get('tree'));
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return (0, _immutable.List)(this.props.outTree);
		}
		return this.tree().shift();
	},
	submitForm: function submitForm(event) {
		var _this2 = this;

		event.preventDefault();
		this.props.updateFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this2.getId());
		}));
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree().shift());
	}
}).toJS());

var StupidTWRXUpdate = exports.StupidTWRXUpdate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	getId: function getId() {
		return this.props.instance.get('id');
	},
	tree: function tree() {
		return (0, _immutable.List)(this.props.instance.get('tree'));
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return (0, _immutable.List)(this.props.outTree);
		}
		return this.tree().shift();
	},
	submitForm: function submitForm(event) {
		var _this3 = this;

		event.preventDefault();
		this.props.updateFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this3.getId());
		}));
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}
}).toJS());

var StupidTWRDestroy = exports.StupidTWRDestroy = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostProperties).merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	tree: function tree() {
		return (0, _immutable.List)(this.props.instance.get('tree'));
	},
	outTree: function outTree() {
		return this.tree();
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		if (this.props.noPrompt) {
			return this.props.destroy((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
		var result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if (result) {
			return this.props.destroy((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}

}).toJS());

var StupidTWRDestroyFront = exports.StupidTWRDestroyFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostProperties).merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	tree: function tree() {
		return (0, _immutable.List)(this.props.instance.get('tree'));
	},
	outTree: function outTree() {
		return this.tree();
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		if (this.props.noPrompt) {
			return this.props.destroyFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
		var result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if (result) {
			return this.props.destroyFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}

}).toJS());

var StupidTWRIndex = exports.StupidTWRIndex = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetProperties).merge({
	mount: function mount() {
		return this.props.index((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
	}
}).toJS());
var StupidTWRShow = exports.StupidTWRShow = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetProperties).merge({
	mount: function mount() {
		return this.props.show((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
	}
}).toJS());

var StupidTWRShowFront = exports.StupidTWRShowFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetRenderProperties).toJS());

var StupidTWRIndexFront = exports.StupidTWRIndexFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetRenderProperties).toJS());

var StupidTWRCreate = exports.StupidTWRCreate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge({
	tree: function tree() {
		return (0, _immutable.List)(this.props.tree).push(this.getId());
	}
}).toJS());

var StupidTWRCreateFront = exports.StupidTWRCreateFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge({
	tree: function tree() {
		return (0, _immutable.List)(this.props.tree).push(this.getId());
	},
	submitForm: function submitForm(event) {
		var _this4 = this;

		event.preventDefault();
		var tree = this.instance().get('tree');
		this.props.createFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this4.getId());
		}));
	}
}).toJS());

var StupidTWRCreateChild = exports.StupidTWRCreateChild = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge({
	parent: function parent() {
		return (0, _immutable.List)([this.props.instance.get('tree').first(), this.props.instance.get('tree').last()]);
	},
	tree: function tree() {
		return (0, _immutable.List)([this.props.childName, this.getId()]);
	},
	submitForm: function submitForm(event) {
		var _this5 = this;

		event.preventDefault();
		console.log('this', this);

		var tree = this.props.instance.get('tree');
		var parentInstanceName = tree.pop().last();
		this.props.create((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this5.getId()).set(parentInstanceName.singularize + '_id', _this5.props.instance.get('id').toString());
		}));
	}
}).toJS());

var StupidTWRBreadCrumbs = exports.StupidTWRBreadCrumbs = _react2.default.createClass(_componentProperties.defaultProperties.merge({
	getCurrentTree: function getCurrentTree(start, currentValue) {
		var fullUrl = (0, _immutable.List)(window.location.href.split('/'));
		var index = fullUrl.indexOf(start);
		var currentIndex = fullUrl.indexOf(currentValue);
		var url = fullUrl.slice(index + 1, currentIndex + 1);
		return url;
	},
	convertCurrentValueToName: function convertCurrentValueToName(currentValue) {
		if (_typeof(currentValue.split('_')) == 'object') {
			return (0, _immutable.List)(currentValue.split('_')).toSeq().map(function (part) {
				return part.titleize;
			}).toArray().join(' ');
			return;
		} else {
			return currentValue.capitalize;
		}
	},
	generateNameLink: function generateNameLink(currentValue, originTree, index) {
		var currentTree = this.getCurrentTree(this.reducer(), currentValue);
		var linkProps = this.props.map[currentValue];
		if (linkProps && linkProps.return !== false) {
			return _react2.default.createElement(
				'li',
				null,
				_react2.default.createElement(
					_reactRouter.Link,
					{ to: this.reducer() + '/' + currentTree.join('/') + linkProps.return },
					this.convertCurrentValueToName(currentValue)
				)
			);
		}
	},
	generateIdLink: function generateIdLink(currentValue, originTree, index) {
		var lastValue = originTree[index - 1];
		var currentTree = this.getCurrentTree(this.reducer(), lastValue).push(currentValue);
		var linkProps = this.props.map[lastValue];

		if (linkProps && linkProps.id !== false) {
			return _react2.default.createElement(
				'li',
				null,
				_react2.default.createElement(
					_reactRouter.Link,
					{ to: this.reducer() + '/' + currentTree.join('/') + linkProps.id },
					this.page().getIn(currentTree.push('name'))
				)
			);
		}
	},
	generateLink: function generateLink(currentValue, originTree, index) {
		if (isNaN(currentValue)) {
			return this.generateNameLink(currentValue, originTree, index);
		} else {
			return this.generateIdLink(currentValue, originTree, index);
		}
	},
	generateLinks: function generateLinks() {
		var _this6 = this;

		var tree = (0, _componentProperties.getTree)(this.reducer()).toArray();
		return tree.map(function (currentValue, index, originTree) {
			if (index + 1 != originTree.length) {
				return _this6.generateLink(currentValue, originTree, index);
			}
		});
	},
	checkArrayEmpty: function checkArrayEmpty(array) {
		return array.reduce(function (boolean, value) {
			if (!boolean) {
				return value;
			}
			return true;
		}, false);
	},

	render: function render() {
		if (this.checkArrayEmpty(this.generateLinks())) {
			return _react2.default.createElement(
				'ol',
				{ className: 'breadcrumb' },
				this.generateLinks()
			);
		} else {
			return _react2.default.createElement('div', { style: { display: 'none' } });
		}
	}
}).toJS());

var StupidTWRLink = exports.StupidTWRLink = _react2.default.createClass(_componentProperties.defaultProperties.merge({
	rest: function rest() {
		if (this.props.rest) {
			return '/' + this.props.rest;
		}
		return '';
	},
	to: function to() {
		return this.reducer() + '/' + this.tree().join('/') + this.rest();
	},
	render: function render() {
		return _react2.default.createElement(
			_reactRouter.Link,
			{ to: this.to() },
			this.props.children
		);
	}
}).toJS());

var DeclareReducer = exports.DeclareReducer = _react2.default.createClass({
	displayName: 'DeclareReducer',

	childContextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	getChildContext: function getChildContext() {
		return {
			reducer: this.props.reducer
		};
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			{ className: 'DeclareReducer' },
			this.props.children
		);
	}
});

function mapStateToProps(state) {
	return {
		state: state
	};
}

var TWRBreadCrumbs = exports.TWRBreadCrumbs = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRBreadCrumbs);

var TWRIndex = exports.TWRIndex = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRIndex);

var TWRShow = exports.TWRShow = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRShow);

var TWRShowFront = exports.TWRShowFront = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRShowFront);

var TWRIndexFront = exports.TWRIndexFront = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRIndexFront);

var TWRLink = exports.TWRLink = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRLink);

var TWRCreate = exports.TWRCreate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRCreate);

var TWRCreateFront = exports.TWRCreateFront = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRCreateFront);

var TWRCreateChild = exports.TWRCreateChild = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRCreateChild);

var TWRUpdate = exports.TWRUpdate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRUpdate);

var TWRXUpdate = exports.TWRXUpdate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRXUpdate);

var TWRDestroy = exports.TWRDestroy = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRDestroy);

var TWRDestroyFront = exports.TWRDestroyFront = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidTWRDestroyFront);