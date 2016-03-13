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

export function createAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE'
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

export function createErrorAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE_ERROR'
	})
}

export function updateAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'UPDATE'
	})
}

export function updateFrontAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'UPDATE_FRONT'
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
export function destroyAction(reducer, tree, id){
	return({
		type: reducer,
		tree,
		id,
		verb: 'DESTROY'
	})
}

export function setIndexAction(reducer, tree){
	return({
		type: reducer,
		tree,
		verb: 'SET_INDEX'
	})
}

export function setShowAction(reducer, tree){
	return({
		type: reducer,
		tree,
		verb: 'SET_SHOW'
	})
}