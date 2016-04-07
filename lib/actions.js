export function showAction(reducer, tree, response){
	return({
		type: reducer,
		tree,
		response,
		verb: 'SHOW'
	})
}


export function indexAction(reducer, tree, response){
	return({
		type: reducer,
		tree,
		response,
		verb: 'INDEX'
	})
}

export function indexErrorAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE_ERROR'
	})
}

export function createAction(reducer, tree, content, response, outTree, parent = false){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE',
		outTree,
		parent
	})
}
export function createErrorAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE_ERROR'
	})
}

export function updateAction(reducer, tree, content, response, outTree){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'UPDATE',
		outTree
	})
}

export function updateErrorAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'UPDATE_ERROR'
	})
}

export function substateDeleteAction(reducer, tree, content){
	return({
		type: reducer,
		tree,
		content,
		verb: 'SUBSTATE_DELETE'
	})
}

export function substateCreateAction(reducer, tree, content){
	return({
		type: reducer,
		tree,
		content,
		verb: 'SUBSTATE_CREATE'
	})
}


export function destroyAction(reducer, tree, content, response, outTree){
	return({
		type: reducer,
		tree,
		verb: 'DESTROY',
		outTree
	})
}

export function indexSetAction(reducer, tree){
	return({
		type: reducer,
		tree,
		verb: 'SET_INDEX'
	})
}

export function setAction(reducer, tree){
	return({
		type: reducer,
		tree,
		verb: 'SET_GET'
	})
}

export function showSetAction(reducer, tree){
	return({
		type: reducer,
		tree,
		verb: 'SET_SHOW'
	})
}

export function custom(reducer, fn){
	return({
		type: reducer,
		fn,
		verb: 'CUSTOM'
	})
}