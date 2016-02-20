'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.triggerSubmit = triggerSubmit;

var _reactDom = require('react-dom');

function triggerSubmit(form) {
	(0, _reactDom.findDOMNode)(form).dispatchEvent(new Event('submit'));
}
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
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.index = index;
exports.checkTreeState = checkTreeState;
exports.fromJSOrdered = fromJSOrdered;
exports.convertArrayToOrderedMap = convertArrayToOrderedMap;
exports.create = create;
exports.cleanSubstate = cleanSubstate;
exports.createError = createError;
exports.createErrorContent = createErrorContent;
exports.update = update;
exports.destroy = destroy;
exports.setMaps = setMaps;
exports.checkTreeExists = checkTreeExists;
exports.createId = createId;

var _immutable = require('immutable');

/*
So, what gets passed through fromJSOrdered? Everything? Why not?
What are the rules?

Lets cross that bridge when we get there->

So 
*/

function index(state, tree, response) {
	var ListTree = (0, _immutable.List)(tree);
	return setMaps(state, ListTree).setIn(ListTree, fromJSOrdered(response));
}

function checkTreeState() {}

function fromJSOrdered(js) {
	return (typeof js === 'undefined' ? 'undefined' : _typeof(js)) !== 'object' || js === null ? js : Array.isArray(js) ? convertArrayToOrderedMap(js, fromJSOrdered) : (0, _immutable.Seq)(js).map(fromJSOrdered).toMap();
}

function convertArrayToOrderedMap(array, fn) {
	return (0, _immutable.Seq)(array).toKeyedSeq().mapEntries(function (_ref) {
		var _ref2 = _slicedToArray(_ref, 2);

		var k = _ref2[0];
		var v = _ref2[1];

		if (v.id) {
			return [v.id, fn(v)];
		} else {
			return [v, fn(v)];
		}
	}).toOrderedMap();
}

function create(state, tree, content, response) {
	console.log('tree in create', tree, content, response);
	var ListTree = (0, _immutable.List)(tree);
	var cleanedSubstate = cleanSubstate(state, content, ListTree);
	var ListTreeWithoutSubstate = ListTree.shift();
	console.log('ListTreeWithoutSubstate', ListTreeWithoutSubstate.toJS());
	return setMaps(cleanedSubstate, ListTreeWithoutSubstate).setIn(ListTreeWithoutSubstate.push(response.id.toString()), (0, _immutable.Map)(content).merge(response).merge({ tree: ListTreeWithoutSubstate.toJS() }));
}

function cleanSubstate(state, content, ListTree) {
	if (content.id) {
		var ListTreeWithSubstateId = ListTree.push(content.id.toString());
		var newId = createId();
		var ListTreeWithNewSubstateId = ListTree.push(newId);
		var cloneElement = state.getIn(ListTreeWithSubstateId);
		var cloneElementBaseAttributes = (0, _immutable.Map)({
			tree: cloneElement.get('tree'),
			reducer: cloneElement.get('reducer')
		});
		var stateWithCloneElement = state.setIn(ListTreeWithNewSubstateId, (0, _immutable.Map)().merge(cloneElementBaseAttributes.set('id', newId)));
		return stateWithCloneElement.deleteIn(ListTreeWithSubstateId);
	}
	return state;
}

function createError(state, tree, content, response) {
	var errorContent = createErrorContent(content, (0, _immutable.fromJS)(response));
	var substateTree = (0, _immutable.List)(tree).unshift('Substate').push(errorContent.get('id'));
	return setMaps(state, substateTree).setIn(substateTree, errorContent);
}

function createErrorContent(content, response) {
	if (content.id) {
		return (0, _immutable.Map)(content).set('errors', response);
	} else {
		var id = createId();
		return (0, _immutable.Map)(content).merge({
			id: id,
			errors: response
		});
	}
}

function update(state, tree, content) {
	var response = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	console.log('inUpdate');
	var ListTree = (0, _immutable.List)(tree);
	var ListTreeWithId = ListTree.push(content.id);
	return setMaps(state, ListTreeWithId).mergeIn(ListTreeWithId, (0, _immutable.Map)(content).merge(response));
}

function destroy(state, tree, id) {
	var ListTree = (0, _immutable.List)(tree);
	var ListTreeWithId = ListTree.push(id);
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
}

function setMaps(state, tree) {
	var stateTree = tree.reduce(function (stateTree, tree) {
		var trees = stateTree.get('trees').push(tree);
		var state = stateTree.get('state');
		var newState = checkTreeExists(state, trees, tree);
		return (0, _immutable.Map)({
			state: newState,
			trees: trees
		});
	}, (0, _immutable.Map)({
		state: state,
		trees: (0, _immutable.List)()
	}));
	return stateTree.get('state');
}

function checkTreeExists(state, trees, tree) {
	if (state.hasIn(trees)) {
		return state;
	} else {
		if (isNaN(tree)) {
			return state.setIn(trees, (0, _immutable.OrderedMap)());
		} else {
			return state.setIn(trees, (0, _immutable.Map)());
		}
	}
}

function createId() {
	return Math.random().toString().slice(3);
}
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.indexAction = indexAction;
exports.indexErrorAction = indexErrorAction;
exports.createAction = createAction;
exports.createErrorAction = createErrorAction;
exports.updateAction = updateAction;
exports.destroyAction = destroyAction;
exports.create = create;
exports.createFront = createFront;
exports.updateFront = updateFront;
exports.update = update;
exports.index = index;
exports.destroy = destroy;
exports.getContent = getContent;
exports.urlPath = urlPath;

var _fetch = require('./fetch');

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _immutable = require('immutable');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

String.prototype.toUnderscore = function () {
	return this.replace(/([A-Z])/g, function ($1) {
		return '_' + $1.toLowerCase();
	}).replace(/^_/, '');
};

function indexAction(reducer, tree, response) {
	return {
		type: reducer,
		tree: tree,
		response: response,
		verb: 'INDEX'
	};
}

function indexErrorAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE_ERROR'
	};
}

function createAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE'
	};
}

function createErrorAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE_ERROR'
	};
}

function updateAction(reducer, tree, response) {
	return {
		type: reducer,
		tree: tree,
		content: response,
		verb: 'UPDATE'
	};
}

function destroyAction(reducer, tree, id) {
	return {
		type: reducer,
		tree: tree,
		id: id,
		verb: 'DESTROY'
	};
}

function create(reducer, tree, form) {
	var callback = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

	return function (dispatch, getState) {
		console.log('rdfcreate', reducer, tree, form);
		var treeWithoutSubstate = (0, _immutable.List)(tree).shift();
		var formData = new _formData2.default(form);
		(0, _fetch.post)(urlPath(treeWithoutSubstate), formData).then(function (response) {
			console.log('response', response);
			var content = getContent(form, reducer, tree);
			console.log('content3', content.toJS());
			console.log('callback', callback);
			if (response.hasOwnProperty('errors')) {
				dispatch(createErrorAction(reducer, tree, content.toJS(), response));
			} else {

				dispatch(createAction(reducer, tree, content.toJS(), response));
			}
			if (callback) {
				return dispatch(callback(reducer, tree, content.toJS(), response));
			}
		});
	};
}

function createFront(reducer, tree, form) {
	return function (dispatch, getState) {
		var formData = new _formData2.default(form);
		(0, _fetch.post)(urlPath(tree), formData).then(function (response) {
			var content = getContent(form, reducer, tree);
			console.log('content2', content.toJS());
			if (response.hasOwnProperty('errors')) {
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));
			} else {
				return dispatch(createAction(reducer, tree, content.toJS(), response));
			}
		});
	};
}

function updateFront(reducer, tree, form) {
	return function (dispatch, getState) {
		console.log('updateFront');
		var content = getContent(form, reducer, tree);
		console.log('contentJS', content.toJS());
		return dispatch(updateAction(reducer, tree, content.toJS()));
	};
}

function update(reducer, tree, form) {
	return function (dispatch, getState) {
		console.log('updateCreator');
		console.log('this should be firing');
		var content = getContent(form, reducer, tree);
		console.log('content1', content.toJS());
		var treeWithId = (0, _immutable.List)(tree).push(content.get('id'));
		var formData = new _formData2.default();

		_jquery2.default.ajax({
			type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
			dataType: 'json', // Set datatype - affects Accept header
			url: 'http://localhost:8000/' + urlPath(treeWithId), // A valid URL
			headers: { 'X-HTTP-Method-Override': 'PUT' }, // X-HTTP-Method-Override set to PUT.
			data: (0, _jquery2.default)(form).serialize() // Some data e.g. Valid JSON as a string
		}).done(function (response) {
			console.log('resonse', response);
			if (response.hasOwnProperty('errors')) {
				console.log('errors');
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));
			} else {
				return dispatch(updateAction(reducer, tree, content.toJS(), response));
			}
		});
	};
}

function index(reducer, tree, form) {
	return function (dispatch, getState) {
		_jquery2.default.ajax({
			type: 'GET', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
			dataType: 'json', // Set datatype - affects Accept header
			url: 'http://localhost:8000' + urlPath(tree), // A valid URL
			data: (0, _jquery2.default)(form).serialize() // Some data e.g. Valid JSON as a string
		}).done(function (response) {
			console.log('resonse', response);
			if (response.hasOwnProperty('errors')) {
				console.log('errors');
				return dispatch(indexErrorAction(reducer, tree, response));
			} else {
				return dispatch(indexAction(reducer, tree, response));
			}
		});
	};
}

function destroy(reducer, tree, form) {
	var content = getContent(form, reducer, tree);
	var treeWithId = (0, _immutable.List)(tree).push(content.get('id'));
	return function (dispatch, getState) {
		_jquery2.default.ajax({
			type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
			dataType: 'json', // Set datatype - affects Accept header
			headers: { 'X-HTTP-Method-Override': 'DELETE' }, // X-HTTP-Method-Override set to DELETE.
			url: 'http://localhost:8000' + urlPath(treeWithId), // A valid URL
			data: (0, _jquery2.default)(form).serialize() // Some data e.g. Valid JSON as a string
		}).done(function (response) {
			console.log('resonse', response);
			if (response.hasOwnProperty('errors')) {
				console.log('errors');
				return dispatch(indexErrorAction(reducer, tree, response));
			} else {
				return dispatch(destroyAction(reducer, tree, response));
			}
		});
	};
}

function getContent(content, reducer, tree) {
	var elements = content.childNodes;
	var contentMap = (0, _immutable.List)(elements).reduce(function (object, element) {
		var name = element.getAttribute('name');
		if (name) {
			return object.set(name, element.value);
		}
		return object;
	}, (0, _immutable.Map)());
	return contentMap.merge({ reducer: reducer, tree: tree });
}

function urlPath(tree) {
	console.log('tree before urlPath', tree);
	var backendSyntaxTree = tree.reduce(function (list, branch) {
		console.log('branch', branch);
		var underscored = branch.toUnderscore();
		return list.push(underscored);
	}, (0, _immutable.List)());

	return '/' + backendSyntaxTree.join('/');
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchObject = fetchObject;

require('isomorphic-fetch');

var _methods = require('methods');

var _methods2 = _interopRequireDefault(_methods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_methods2.default.forEach(function (method) {
  exports[method] = function (path) {
    var body = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var url = 'http://localhost:8000';
    return fetch(url + path, fetchObject(method, body)).then(function (res) {
      return res.json();
    });
  };
});
function fetchObject(method, body) {
  switch (method) {
    case 'get':
      return { method: method };
    case 'put':
      console.log('PUT REQUEST');
      return { method: 'POST', body: body, headers: {
          'X-HTTP-Method-Override': 'PUT'
        } };
  }
  console.log('POST');
  return { method: method, body: body };
}
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = hello;
/*
import * as twoWayReducers from './reducers';
import * as twoWayCreators from './creators';
import * as twoWayComponents from './components';
import * as twoWayComponentHelpers from './componentHelpers';
import * as twoWayFetch from './fetch';
import * as twoWayCore from './core';

export default Object.assign(
		twoWayCore
	, twoWayReducers
	, twoWayCreators
	, twoWayFetch
	, twoWayCore
	, twoWayComponents
	, twoWayComponentHelpers
);
*/

function hello() {
	console.log('Hi');
}
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.combineSwitches = combineSwitches;
exports.generateRestSwitch = generateRestSwitch;

var _core = require('./core');

function combineSwitches(list) {
	return list.reduce(function (previousFunction, currentFunction) {
		return function (state, action) {
			return previousFunction(currentFunction(state, action), action);
		};
	});
}

function generateRestSwitch(reducer) {
	return function (state, action) {
		switch (action.type) {
			case reducer:
				switch (action.verb) {
					case 'INDEX':
						return (0, _core.index)(state, action.tree, action.response);
					case 'CREATE':
						return (0, _core.create)(state, action.tree, action.content, action.response);
					case 'CREATE_ERROR':
						return (0, _core.createError)(state, action.tree, action.content, action.response);
					case 'UPDATE':
						return (0, _core.update)(state, action.tree, action.content, action.response);
					case 'UPDATE_ERROR':
						return (0, _core.update)(state, action.tree, action.content, action.response);
					case 'DESTROY':
						return (0, _core.destroy)(state, action.tree, action.id);
					case 'DESTROY_ERROR':
						return (0, _core.destroy)(state, action.tree);
				}
		}
		return state;
	};
}
