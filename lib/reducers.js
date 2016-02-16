import {
	index
	, create
	, createError
	, update
	, updateError
	, destroy
	, destroyError
} from './core';

export function combineSwitches(list){
	return list.reduce((previousFunction, currentFunction)=>{
		return function(state, action){
			return previousFunction(currentFunction(state, action), action);
		}
	});
}

export function generateRestSwitch(reducer){
	return function(state, action){
		switch(action.type){
			case reducer:
				switch(action.verb){
					case 'INDEX':
						return index(state, action.tree, action.response);
					case 'CREATE':
						return create(state, action.tree, action.content, action.response);
					case 'CREATE_ERROR':
						return createError(state, action.tree, action.content, action.response);
					case 'UPDATE':
						return update(state, action.tree, action.content, action.response);
					case 'UPDATE_ERROR':
						return update(state, action.tree, action.content, action.response);
					case 'DESTROY':
						return destroy(state, action.tree, action.id);
					case 'DESTROY_ERROR':
						return destroy(state, action.tree);
				}
		}
		return state;
	}
}