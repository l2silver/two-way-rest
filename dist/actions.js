'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.showAction = showAction;
exports.indexAction = indexAction;
exports.indexErrorAction = indexErrorAction;
exports.createAction = createAction;
exports.substateDeleteAction = substateDeleteAction;
exports.substateCreateAction = substateCreateAction;
exports.createErrorAction = createErrorAction;
exports.updateAction = updateAction;
exports.updateFrontAction = updateFrontAction;
exports.updateErrorAction = updateErrorAction;
exports.destroyAction = destroyAction;
exports.setIndexAction = setIndexAction;
exports.setShowAction = setShowAction;
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

function createAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE'
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

function createErrorAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'CREATE_ERROR'
	};
}

function updateAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'UPDATE'
	};
}

function updateFrontAction(reducer, tree, content, response) {
	return {
		type: reducer,
		tree: tree,
		content: content,
		response: response,
		verb: 'UPDATE_FRONT'
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
function destroyAction(reducer, tree, id) {
	return {
		type: reducer,
		tree: tree,
		id: id,
		verb: 'DESTROY'
	};
}

function setIndexAction(reducer, tree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'SET_INDEX'
	};
}

function setShowAction(reducer, tree) {
	return {
		type: reducer,
		tree: tree,
		verb: 'SET_SHOW'
	};
}