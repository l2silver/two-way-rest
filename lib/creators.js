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
	getType,
	getId

} from './creatorsHelpers'

export const customAction = actions.custom;

export function coreGET(args, type){	
	if(args.get('getState')()[args.get('reducer')]
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
	args.get('batchDispatch')(actions.setAction(
		args.get('reducer')
		, componentHelpers[type+'Check'](
			args.get('tree')
		)
	));
	return callforwardCreator(args)
	.then((args)=>{
		return getType(args)
		.then((response)=>{
			console.log('response'+type, response);
			if(response.hasOwnProperty('errors')){
				throw response;
			}
			args.get('dispatch')(actions[type + 'Action'](args.get('reducer'), args.get('tree'), response));
			return onSuccessCBCreator(args.set('response', response));
		})
		.catch((response)=>{
			console.log('errors', response);
			args.get('dispatch')(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
			return onFailureCBCreator(args.set('response', response));
		}).then((args)=>{
			return callbackCreator(args);
		});
	});
}


export function substateDeleteCreator(args){
	const content = getContent(args.get('form'));
	return args.get('batchDispatch')(actions.substateDeleteAction(args.get('reducer'), args.get('tree'), content.toJS()))
}

export function substateCreateCreator(args){
	const content = getContent(
		args.get('form')
	).mergeDeep(args.get('content'));
	return args.get('batchDispatch')(
		actions.substateCreateAction(
			args.get('reducer')
			, args.get('tree')
			, content.toJS()
		)
	)
}

export function create(args){

	function responsePromise(args){
		return postRequestCreator(args, args=>post(args.get('path'), args.get('combinedContent').toJS()))
		.then((response)=>{
			return responseCreator(response, args, args=>args.update('outTree', outTree=>outTree.push(response.id.toString())))
		})
	}
	const nextArgs = args.merge({type: 'create'});
	return endPromises(createEventTrain([
		combineContent
		, callforwardCreator
		, responsePromise
		])(nextArgs))
}

export function update(args){
	function responsePromise(args){
		return postRequestCreator(args, args=>put(args.get('path'), args.get('combinedContent').toJS()))
		.then((response)=>{
			return responseCreator(response, args)
		})
	}
	const nextArgs = args.merge({type: 'update'});
	return endPromises(createEventTrain([
		combineContent
		, callforwardCreator
		, responsePromise
		])(nextArgs))
}

export function destroy(args){
	function responsePromise(args){
		return postRequestCreator(args
			, args=>{
				return del(args.get('path'))
		})
		.then((response)=>{
			return responseCreator(response, args)
		})
	}
	const nextArgs = args.merge({type: 'destroy'});
	return endPromises(createEventTrain([
		combineContent
		, callforwardCreator
		, responsePromise
		])(nextArgs))
}



export function createFront(args){
		function responsePromise(args){
			const newId = getId(args);
			const response = {id: newId};
			return responseCreator(response, args, args=>args.update('outTree', outTree=>outTree.push(response.id.toString())))
		}
		const nextArgs = args.merge({type: 'create'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
}

export function updateFront(args){
		function responsePromise(args){
				return responseCreator({}, args)
		}
		const nextArgs = args.merge({type: 'update'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs));
}

export function destroyFront(args){
		function responsePromise(args){
				return responseCreator({}, args);
		}
		const nextArgs = args.merge({ type: 'destroy'});
		return endPromises(createEventTrain([
			combineContent
			, callforwardCreator
			, responsePromise
			])(nextArgs))
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