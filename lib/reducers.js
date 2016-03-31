import {
	index
	, setIndex
	, setGet
	, show
	, setShow
	, create
	, createError
	, substateCreate
	, substateDelete
	, update
	, updateFront
	, updateError
	, destroy
	, destroyError
	, custom
} from './core';

import {Map} from 'immutable'

export function combineSwitches(list){
	if(list.length > 1){
		return list.reduce((previousFunction, currentFunction)=>{
			return function(state, action){
				return previousFunction(currentFunction(state, action), action);
			}
		});	
	}
	if(list.length == 1){
		return list[0]
	}
	throw 'combineSwitches requires atleast one switch function'
}

export function generateRestSwitch(reducer){
	return function(state = Map(), action){
		switch(action.type){
			case reducer:
				switch(action.verb){
					case 'INDEX':
						return index(state, action.tree, action.response);
					case 'SET_GET':
						return setGet(state, action.tree);
					case 'SET_INDEX':
						return setIndex(state, action.tree);
					case 'SHOW':
						return show(state, action.tree, action.response);
					case 'SET_SHOW':
						return setShow(state, action.tree, action.response);
					case 'CREATE':
						return create(state, action.tree, action.content, action.response, action.outTree, action.parent);
					case 'SUBSTATE_CREATE':
						return substateCreate(state, action.tree, action.content);
					case 'SUBSTATE_DELETE':
						return substateDelete(state, action.tree, action.content);
					case 'CREATE_ERROR':
						return createError(state, action.tree, action.content, action.response);
					case 'UPDATE':
						return update(state, action.tree, action.content, action.response, action.outTree);
					case 'UPDATE_ERROR':
						return update(state, action.tree, action.content, action.response);
					case 'DESTROY':
						return destroy(state, action.tree, action.outTree);
					case 'DESTROY_ERROR':
						return destroy(state, action.tree);
					case 'CUSTOM':
						return custom(state, action.fn);
				}
		}
		return state;
	}
}