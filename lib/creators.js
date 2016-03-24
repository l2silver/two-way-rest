import {post, put, get, del, up} from './fetch';
import * as fetch from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';

export const arrayRegex = /(\[.*\])/g;
export const arrayRegexUnGreed = /(\[.*?\])/

export function getBrackets(name, list){
	const bracketMatch = name.match(arrayRegexUnGreed);
	if(bracketMatch){
		const nextList = list.push(bracketMatch[0]);
		return getBrackets(name.replace(arrayRegexUnGreed, ''), nextList);
	}
	return list;
}

export function getMergeInList(nextObject, name, abbrName){	
	const rawBrackets = name.split(arrayRegex)[1];
	const brackets = getBrackets(rawBrackets, List());
	return brackets.reduce((list, brackets)=>{
		const cleanBracket = brackets.replace(/(\[|\])/g, '');
		if(cleanBracket){
			return list.push(cleanBracket);
		}
		const arrayExists = nextObject.getIn(list);
		if(arrayExists){
			const newKey = arrayExist.toList.size();
			return list.push[newKey];
		}
		return list.push(0);
	}, List([abbrName]))
}

export function convertToArrayIf(nextObject, name, value){
	if(name.match(arrayRegex)){
		const abbrName = name.replace(arrayRegex, '');
		const mergeInList = getMergeInList(nextObject, name, abbrName);
		return nextObject.setIn(mergeInList, value);
	}
	return nextObject.set(name, value)
}

export function checkMulti(element){
	if(element.attributes['multiple']){
	    return List(element.options).reduce((list, option)=>{
	    	if(option.selected){
	    		return list.push(option.value)
	    	}
	    	return list
	    }, List())
	}
	return element.value;

}

export function getContent(content){
	const elements = content.childNodes;
	const contentMap = List(elements).reduce((object, element)=>{
			const nextObject = object.mergeDeep(getContent(element));
			if(element.getAttribute){
				const name = element.getAttribute('name');
				if(name){
					if(element.type === 'checkbox'){
						if(!element.checked){
							return nextObject;
						}
					}
					return convertToArrayIf(nextObject, name, checkMulti(element));
				}	
			}
			
			return nextObject;
		}, Map());
	return contentMap;
}


export function urlPath(tree){
	return '/'+tree.join('/');
}


export function calls(args, type){
	if(args.get(type)){
		return Promise.method(args.get(type))(args);
	}else{
		return Promise.method(()=>args)();
	}
}

export function callforwardCreator(args){
	return calls(args, 'callforward');
}

export function callbackCreator(args){
	return calls(args, 'callback');
}

export function onSuccessCBCreator(args){
	return calls(args, 'onSuccessCB');
}

export function onFailureCBCreator(args){
	return calls(args, 'onFailureCB');
}


export function createEventTrain(functions){
	const combinedFunctions = functions.reduce((functions, fn)=>{
			return Promise.method((args)=>{
				return functions(args)
				.then(fn);
			})
	}, Promise.method((args)=>{return args}));
	return combinedFunctions;
}

export function combineContent(args){
		const formContent = getContent(args.get('form'))
		const combinedContent = formContent.merge(args.get('content'));
		return args.merge({formContent, combinedContent});
}

export function endPromises(promise){
	return promise
	.catch((args)=>{
		console.log('error', args.get('response'));
		args.get('dispatch')(actions[args.get('type') + 'ErrorAction'](args.get('reducer'), args.get('tree'), args.get('combinedContent').mergeDeep(args.get('onFailure')), args.get('response')));
		return onFailureCBCreator(args);
	}).then((args)=>{
		return callbackCreator(args);
	})
}

export function postRequestCreator(args, fn){
	if(args.get('upload')){
		var formData = new FormData(args.get('form'));
		const keys = args.get('content').keySeq().toArray();
		keys.forEach((key)=>{
			formData.append(key, args.getIn(['content', key]))
		})
		return up(args.get('path'), formData);
	}
	return fn(args);
}

export function responseCreator(response, args, successFn){
	
	try{
		console.log('response', response);

		if(response.hasOwnProperty('errors')){
		throw args.set('response', response)
		}
		if(args.get('outTrees')){
			args.get('outTrees').map((outTree)=>{
				const nextArgs = successFn ? successFn(args) : args;
				const nextAction = actions[nextArgs.get('type') + 'Action'](
					nextArgs.get('reducer')
					, nextArgs.get('tree')
					, nextArgs.get('combinedContent').mergeDeep(nextArgs.get('onSuccess'))
					, response
					, outTree
					, nextArgs.get('parent')
					)
				return args.get('dispatch')(
					nextAction
					);
			});
			return onSuccessCBCreator(nextArgs.set('response', response));
		}else{
			const nextArgs = successFn ? successFn(args) : args;

			const nextAction = actions[nextArgs.get('type') + 'Action'](
				nextArgs.get('reducer')
				, nextArgs.get('tree')
				, nextArgs.get('combinedContent').mergeDeep(nextArgs.get('onSuccess'))
				, response
				, nextArgs.get('outTree')
				, nextArgs.get('parent')
				)
			nextArgs.get('dispatch')(
				nextAction
				);
			
			return onSuccessCBCreator(nextArgs.set('response', response));

		}

	}catch(e){
		console.log('ERROR INFORMATION')
		console.log(e, e.lineNumber)

	}
	
}


export function coreGET(args, type){
	return (dispatch, getState)=>{
		console.log('coreGET', args.toJS())
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
			return get(args.get('path'))
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


export function substateDelete(args){
	return (dispatch, getState)=>{
		const content = getContent(args.get('form'));
		return dispatch(actions.substateDeleteAction(args.get('reducer'), args.get('tree'), content.toJS()))
	}
}

export function substateCreate(args){
	return (dispatch, getState)=>{

		const content = getContent(
			args.get('form')
		).merge(args.get('content'));
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
	return (dispatch, getState)=>{
		function responsePromise(args){
			console.log('path', args.get('path'));
			return postRequestCreator(args, args=>post(args.get('path'), args.get('combinedContent').toJS()))
			.then((response)=>{
				return responseCreator(response, args, args=>args.update('outTree', outTree=>outTree.push(response.id.toString())))
			})
		}
		const nextArgs = args.merge({dispatch, getState, type: 'create'});
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

export function createFront(args){
	return (dispatch, getState)=>{
		function responsePromise(args){
			return responseCreator({}, args)
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



export function index(args){
	return coreGET(args, 'index');
}

export function show(args){
	return coreGET(args, 'show');
}

