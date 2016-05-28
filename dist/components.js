'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.DeclareReducer = exports.TWRBatch = exports.StupidDeclareReducer = exports.TWRLink = exports.TWRBreadCrumbs = exports.TWRCreateChildFront = exports.TWRCreateChild = exports.TWRCreateFront = exports.TWRCreate = exports.TWRIndexFront = exports.TWRShowFront = exports.TWRShow = exports.TWRIndex = exports.TWRDestroyFront = exports.TWRDestroy = exports.TWRXUpdate = exports.TWRUpdateFront = exports.TWRUpdate = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var i = (0, _i2.default)(true);

var TWRUpdate = exports.TWRUpdate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderProperties).merge(_componentProperties.defaultPostUpdateProperties).toJS());

var TWRUpdateFront = exports.TWRUpdateFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderProperties).merge(_componentProperties.defaultPostUpdateProperties).merge({
	submitForm: function submitForm(event) {
		if (event.hasOwnProperty('preventDefault')) {
			event.preventDefault();
		}
		actionCreators.updateFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
	}
}).toJS());

var TWRXUpdate = exports.TWRXUpdate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	getId: function getId() {
		return this.props.instance.get('id');
	},
	getTree: function getTree(props) {
		return (0, _immutable.List)(props.instance.get('tree'));
	},
	outTree: function outTree() {
		if (this.props.outTree) {
			return (0, _immutable.List)(this.props.outTree);
		}
		return this.tree().shift();
	},
	submitForm: function submitForm(event) {
		var _this = this;

		event.preventDefault();
		actionCreators.updateFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this.getId());
		}));
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}
}).toJS());

var TWRDestroy = exports.TWRDestroy = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostProperties).merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	getTree: function getTree(props) {
		return (0, _immutable.List)(props.instance.get('tree'));
	},
	outTree: function outTree() {
		return this.tree();
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		if (this.props.noPrompt) {
			return actionCreators.destroy((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
		var result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if (result) {
			return actionCreators.destroy((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}

}).toJS());

var TWRDestroyFront = exports.TWRDestroyFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostProperties).merge(_componentProperties.defaultCreateSubstate).merge(_componentProperties.defaultPostRenderClickProperties).merge({
	outTree: function outTree() {
		return this.tree();
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		if (this.props.noPrompt) {
			return actionCreators.destroyFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
		var result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if (result) {
			return actionCreators.destroyFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
		}
	},
	path: function path() {
		return (0, _componentProperties.urlPath)(this.tree());
	}

}).toJS());

var TWRIndex = exports.TWRIndex = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetProperties).merge(_componentProperties.defaultIndexProperties).merge({
	mount: function mount() {
		return actionCreators.index((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
	}
}).toJS());
var TWRShow = exports.TWRShow = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetProperties).merge({
	mount: function mount() {
		return actionCreators.show((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)));
	}
}).toJS());

var TWRShowFront = exports.TWRShowFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetRenderProperties).toJS());

var TWRIndexFront = exports.TWRIndexFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultGetRenderProperties).merge(_componentProperties.defaultIndexProperties).toJS());

var TWRCreate = exports.TWRCreate = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge({
	getTree: function getTree(props) {
		var listTree = (0, _componentProperties.generateTree)(props.tree);
		return listTree.push(this.getId());
	}
}).toJS());

var TWRCreateFront = exports.TWRCreateFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge({
	getTree: function getTree(props) {
		var listTree = (0, _componentProperties.generateTree)(props.tree);
		return listTree.push(this.getId());
	},
	submitForm: function submitForm(event) {
		var _this2 = this;

		event.preventDefault();
		var dom = (0, _reactDom.findDOMNode)(this);
		actionCreators.createFront((0, _componentProperties.createArgs)(this, dom).update('content', function (content) {
			return content.set('id', _this2.getId());
		}));
	}
}).toJS());

var TWRCreateChild = exports.TWRCreateChild = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge(_componentProperties.defaultCreateChildProperties).toJS());

var TWRCreateChildFront = exports.TWRCreateChildFront = _react2.default.createClass(_componentProperties.defaultProperties.merge(_componentProperties.defaultPostCreateProperties).merge(_componentProperties.defaultCreateChildProperties).merge({
	submitForm: function submitForm(event) {
		var _this3 = this;

		event.preventDefault();
		var tree = this.props.instance.get('tree');
		var parentInstanceName = tree.pop().last();
		actionCreators.createFront((0, _componentProperties.createArgs)(this, (0, _reactDom.findDOMNode)(this)).update('content', function (content) {
			return content.set('id', _this3.getId()).set(parentInstanceName.singularize + '_id', _this3.props.instance.get('id').toString());
		}));
	}
}).toJS());

var TWRBreadCrumbs = exports.TWRBreadCrumbs = _react2.default.createClass(_componentProperties.defaultProperties.merge({
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
		var _this4 = this;

		var tree = (0, _componentProperties.getTree)(this.reducer()).toArray();
		return tree.map(function (currentValue, index, originTree) {
			if (index + 1 != originTree.length) {
				return _this4.generateLink(currentValue, originTree, index);
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

var TWRLink = exports.TWRLink = _react2.default.createClass(_componentProperties.defaultProperties.merge({
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

var StupidDeclareReducer = exports.StupidDeclareReducer = _react2.default.createClass({
	displayName: 'StupidDeclareReducer',

	shouldComponentUpdate: function shouldComponentUpdate() {
		return true;
	},
	childContextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired,
		listTables: _react2.default.PropTypes.func.isRequired,
		parent: _react2.default.PropTypes.object.isRequired,
		getState: _react2.default.PropTypes.func.isRequired
	},
	getChildContext: function getChildContext() {
		return {
			reducer: this.props.reducer,
			listTables: function listTables() {},
			parent: this,
			getState: this.getState
		};
	},
	getState: function getState() {
		return this.props.state;
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			{ className: 'DeclareReducer' },
			this.props.children
		);
	}
});

var TWRBatch = exports.TWRBatch = function (_Component) {
	_inherits(TWRBatch, _Component);

	function TWRBatch() {
		_classCallCheck(this, TWRBatch);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(TWRBatch).apply(this, arguments));
	}

	_createClass(TWRBatch, [{
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate() {
			return true;
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.batchedActions = [];
			this.indexBatchedActions = 0;

			this.totalBatchedActions = this.props.children.length;
			this.dispatched = false;
		}
	}, {
		key: 'batchBatchDispatch',
		value: function batchBatchDispatch(actions) {
			this.batchedActions = this.batchedActions.concat(actions);
			this.indexBatchedActions += 1;
			if (this.indexBatchedActions == this.totalBatchedActions) {

				(0, _componentProperties.runBatchBatchDispatch)(this.batchedActions);
				this.dispatched = true;
				this.forceUpdate();
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this6 = this;

			var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
				if (child) {
					return _react2.default.cloneElement(child, { batchBatchDispatch: _this6.batchBatchDispatch.bind(_this6) });
				}
			});
			if (this.dispatched) {
				return this.props.afterBatch;
			}
			return _react2.default.createElement(
				'div',
				null,
				childrenWithProps
			);
		}
	}]);

	return TWRBatch;
}(_react.Component);

function mapStateToProps(state) {
	return {
		state: state
	};
}

var DeclareReducer = exports.DeclareReducer = (0, _reactRedux.connect)(mapStateToProps)(StupidDeclareReducer);