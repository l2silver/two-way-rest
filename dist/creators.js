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