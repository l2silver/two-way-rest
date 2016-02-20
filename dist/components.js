'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MRFormDestroy = exports.MRXUpdate = exports.MRFormUpdate = exports.MRFormCreateChild = exports.MRFormCreate = exports.MRIndex = exports.MRFormCreateTwo = exports.RestXForm = exports.RestForm = exports.StupidMRFormDestroy = exports.StupidMRXUpdate = exports.StupidMRFormUpdate = exports.StupidMRFormCreateChild = exports.StupidMRFormCreate = exports.StupidMRIndex = exports.DeclareReducer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.convertTree = convertTree;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _creators = require('./creators');

var actionCreators = _interopRequireWildcard(_creators);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var i = (0, _i2.default)(true);

function convertTree(tree) {
	if (Object.prototype.toString.call(tree) === '[object Array]') {
		return tree;
	} else {
		return (0, _immutable.Map)(tree).toList().toJS();
	}
}

var DeclareReducer = exports.DeclareReducer = _react2.default.createClass({
	displayName: 'DeclareReducer',

	childContextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	getChildContext: function getChildContext() {
		return { reducer: this.props.reducer };
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			{ className: 'DeclareReducer' },
			this.props.children
		);
	}
});

var StupidMRIndex = exports.StupidMRIndex = _react2.default.createClass({
	displayName: 'StupidMRIndex',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	componentDidMount: function componentDidMount() {
		console.log('hello good morning from stupid mri component did mount', this.context.reducer);
		console.log('tree type', _typeof(this.props.tree));
		console.log('tree type', this.props.tree);

		this.props.index(this.context.reducer, convertTree(this.props.tree), (0, _reactDom.findDOMNode)(this));
	},
	render: function render() {
		return _react2.default.createElement(
			'form',
			null,
			this.props.children
		);
	}
});

var StupidMRFormCreate = exports.StupidMRFormCreate = _react2.default.createClass({
	displayName: 'StupidMRFormCreate',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		this.props.create(this.context.reducer, convertTree(this.props.tree), event.target);
	},
	render: function render() {
		return _react2.default.createElement(RestForm, _extends({}, this.props, { submitForm: this.submitForm }));
	}
});

var StupidMRFormCreateChild = exports.StupidMRFormCreateChild = _react2.default.createClass({
	displayName: 'StupidMRFormCreateChild',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		console.log('CreatreChildTree', this.props.tree);
		var tree = (0, _immutable.List)(convertTree(this.props.tree)).unshift('Substate');
		console.log('CreatreChildTree', tree);
		this.props.create(this.context.reducer, tree.concat([this.props.id.toString(), this.props.childName]).toArray(), event.target, this.props.callback);
	},
	render: function render() {
		var tree = (0, _immutable.List)(convertTree(this.props.tree));
		var objectModelName = tree.last();
		return _react2.default.createElement(
			'form',
			{ onSubmit: this.submitForm },
			this.props.children,
			_react2.default.createElement('input', { type: 'hidden', name: 'id', value: '' }),
			_react2.default.createElement('input', { type: 'hidden', name: objectModelName.singularize + '_id', value: this.props.id.toString() })
		);
	}
});

var StupidMRFormUpdate = exports.StupidMRFormUpdate = _react2.default.createClass({
	displayName: 'StupidMRFormUpdate',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		this.props.update(this.context.reducer, convertTree(this.props.tree), event.target);
	},
	render: function render() {
		return _react2.default.createElement(RestForm, _extends({}, this.props, { submitForm: this.submitForm }));
	}
});

var StupidMRXUpdate = exports.StupidMRXUpdate = _react2.default.createClass({
	displayName: 'StupidMRXUpdate',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		console.log('MRXUpdate', this.context.reducer);
		this.props.updateFront(this.context.reducer, convertTree(this.props.tree), (0, _reactDom.findDOMNode)(this));
	},
	render: function render() {
		return _react2.default.createElement(RestXForm, _extends({}, this.props, { submitForm: this.submitForm }));
	}
});

var StupidMRFormDestroy = exports.StupidMRFormDestroy = _react2.default.createClass({
	displayName: 'StupidMRFormDestroy',

	contextTypes: {
		reducer: _react2.default.PropTypes.string.isRequired
	},
	submitForm: function submitForm(event) {
		event.preventDefault();
		this.props.destroy(this.context.reducer, convertTree(this.props.tree), (0, _reactDom.findDOMNode)(this));
	},
	render: function render() {
		return _react2.default.createElement(RestXForm, _extends({}, this.props, { submitForm: this.submitForm }));
	}
});

var RestForm = exports.RestForm = function (_Component) {
	_inherits(RestForm, _Component);

	function RestForm() {
		_classCallCheck(this, RestForm);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(RestForm).apply(this, arguments));
	}

	_createClass(RestForm, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'form',
				{ onSubmit: this.props.submitForm.bind(this) },
				this.props.children,
				_react2.default.createElement('input', { type: 'hidden', name: 'id', value: this.props.id })
			);
		}
	}]);

	return RestForm;
}(_react.Component);

var RestXForm = exports.RestXForm = function (_Component2) {
	_inherits(RestXForm, _Component2);

	function RestXForm() {
		_classCallCheck(this, RestXForm);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(RestXForm).apply(this, arguments));
	}

	_createClass(RestXForm, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				{ className: 'X', onClick: this.props.submitForm.bind(this) },
				this.props.children,
				_react2.default.createElement('input', { type: 'hidden', name: 'id', value: this.props.id })
			);
		}
	}]);

	return RestXForm;
}(_react.Component);

function mapStateToProps(state) {
	return {};
}

var MRFormCreateTwo = exports.MRFormCreateTwo = function (_Component3) {
	_inherits(MRFormCreateTwo, _Component3);

	function MRFormCreateTwo() {
		_classCallCheck(this, MRFormCreateTwo);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(MRFormCreateTwo).apply(this, arguments));
	}

	_createClass(MRFormCreateTwo, [{
		key: 'render',
		value: function render() {
			var _this4 = this;

			if (this.props.substate && this.props.substate.hasIn([this.props.tree])) {
				return this.props.substate.get('AssembliesCategories').map(function (AssembliesCategory) {
					return _react2.default.createElement(
						MRFormCreate,
						_this4.props,
						_this4.props.children
					);
				});
			} else {
				return _react2.default.createElement(
					'span',
					null,
					_react2.default.createElement(
						MRFormCreate,
						this.props,
						this.props.children
					)
				);
			}
		}
	}]);

	return MRFormCreateTwo;
}(_react.Component);

var MRIndex = exports.MRIndex = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRIndex);

var MRFormCreate = exports.MRFormCreate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRFormCreate);

var MRFormCreateChild = exports.MRFormCreateChild = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRFormCreateChild);

var MRFormUpdate = exports.MRFormUpdate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRFormUpdate);

var MRXUpdate = exports.MRXUpdate = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRXUpdate);

var MRFormDestroy = exports.MRFormDestroy = (0, _reactRedux.connect)(mapStateToProps, actionCreators)(StupidMRFormDestroy);