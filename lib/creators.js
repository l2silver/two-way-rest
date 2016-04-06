import {post, put, get, del, up} from './fetch';
import * as fetch from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';
import {
	getContent,
	calls,
	callforwardCreator,
	callbackCreator,
	onSuccessCBCreator,
	onFailureCBCreator,
	createEventTrain,
	combineContent,
	endPromises,
	postRequestCreator,
	responseCreator,
	getType
} from './creatorsHelpers'


export const customAction = actions.custom;

export function coreGET(args, type){
	return (dispatch, getState)=>{
		if(getState()[args.get('reducer')]
			.getIn(
				componentHelpers[type+'Check'](
					args.get('tree')
				)
			)
		){
			if(!args.get('force')){
				return true;	
			}
		}
		dispatch(actions.setAction(
			args.get('reducer')
			, componentHelpers[type+'Check'](
				args.get('tree')
			)
		));
		return callforwardCreator(args.mergeDeep({dispatch, getState}))
		.then((args)=>{
			return getType(args)
			.then((response)=>{
				console.log('response'+type, response);
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				dispatch(actions[type + 'Action'](args.get('reducer'), args.get('tree'), response));
				return onSuccessCBCreator(args.set('response', response));
			})
			.catch((response)=>{
				console.log('errors', response);
				dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
				return onFailureCBCreator(args.set('response', response));
			}).then((args)=>{
				return callbackCreator(args);
			});
		});
	}
}


export function substateDeleteCreator(args){
	return (dispatch, getState)=>{
		const content = getContent(args.get('form'));
		return dispatch(actions.substateDeleteAction(args.get('reducer'), args.get('tree'), content.toJS()))
	}
}

export function substateCreateCreator(args){
	return (dispatch, getState)=>{
		const content = getContent(
			args.get('form')
		).mergeDeep(args.get('content'));
		return dispatch(
			actions.substateCreateAction(
				args.get('reducer')
				, args.get('tree')
				, content.toJS()
			)
		)
	}	
}

export function create(args){
	return (dispatch, getState, store)=>{
		function responsePromise(args){
			return postRequestCreator(args, args=>post(args.get('path'), args.get('combinedContent').toJS()))
			.then((response)=>{
				return responseCreator(response, args, args=>args.update('outTree', outTree=>outTree.push(response.id.toString())))
			})
		}
		const nextArgs = args.merge({dispatch, getState, type: 'create'}).set('store', store);
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
	}
}

export function update(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
			return postRequestCreator(args, args=>put(args.get('path'), args.get('combinedContent').toJS()))
			.then((response)=>{
				return responseCreator(response, args)
			})
		}
		const nextArgs = args.merge({dispatch, getState, type: 'update'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
	}
}

export function destroy(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
			return postRequestCreator(args
				, args=>{
					return del(args.get('path'))
			})
			.then((response)=>{
				return responseCreator(response, args)
			})
		}
		const nextArgs = args.merge({dispatch, getState, type: 'destroy'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))	
	}
}

export function getId(args){
	if(args.get('id')){
		return args.get('id');
	}
	return componentHelpers.createId();
}

export function createFront(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
			const newId = getId(args);
			const response = {id: newId};
			return responseCreator(response, args, args=>args.update('outTree', outTree=>outTree.push(response.id.toString())))
		}
		const nextArgs = args.merge({dispatch, getState, type: 'create'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
	}
}

export function updateFront(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
				return responseCreator({}, args)
		}
		const nextArgs = args.merge({dispatch, getState, type: 'update'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs));
	}
}

export function destroyFront(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
				return responseCreator({}, args);
		}
		const nextArgs = args.merge({dispatch, getState, type: 'destroy'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
	}
}



export function index(args){
	return coreGET(args, 'index');
}

export function show(args){
	return coreGET(args, 'show');
}

export function customCreator(reducer, args){
	return (dispatch, getState)=>{
		return dispatch(customAction(reducer, args))
	}
}