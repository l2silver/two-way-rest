'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.showAction = showAction;
exports.indexAction = indexAction;
exports.indexErrorAction = indexErrorAction;
exports.createAction = createAction;
exports.createErrorAction = createErrorAction;
exports.updateAction = updateAction;
exports.updateErrorAction = updateErrorAction;
exports.substateDeleteAction = substateDeleteAction;
exports.substateCreateAction = substateCreateAction;
exports.destroyAction = destroyAction;
exports.indexSetAction = indexSetAction;
exports.setAction = setAction;
exports.showSetAction = showSetAction;
function showAction(reducer, tree, response) {
	return {
		type: reducer,
		tree: tree,
		response: response,
		verb: 'SHOW'
	};
}

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

function createAction(reducer, tree, content, response, outTree) {
	var parent = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE',
		outTree: outTree,
		parent: parent
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

function updateAction(reducer, tree, content, response, outTree) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'UPDATE',
		outTree: outTree
	};
}

function updateErrorAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'UPDATE_ERROR'
	};
}

function substateDeleteAction(reducer, tree, content) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		verb: 'SUBSTATE_DELETE'
	};
}

function substateCreateAction(reducer, tree, content) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		verb: 'SUBSTATE_CREATE'
	};
}

function destroyAction(reducer, tree, content, response, outTree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'DESTROY',
		outTree: outTree
	};
}

function indexSetAction(reducer, tree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'SET_INDEX'
	};
}

function setAction(reducer, tree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'SET_GET'
	};
}

function showSetAction(reducer, tree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'SET_SHOW'
	};
}