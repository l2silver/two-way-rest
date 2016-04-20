import {post, put, get, del, up} from './fetch';
import * as fetch from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';
import {batchActions} from 'redux-batched-actions';
export const arrayRegex = /(\[.*\])/g;
export const arrayRegexUnGreed = /(\[.*?\])/

export function getId(args){
	if(args.get('id')){
		return args.get('id');
	}
	return componentHelpers.createId();
}

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
					if(element.type === 'checkbox' || element.type === 'radio'){
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


export function calls(args, type){
		if(args.get(type)){
			return Promise.method(
				(args)=>{
					try{
						return args.get(type)(args)
					}catch(e){
						console.log(type, 'error', e)
					}
				}
			)(args);
		}else{
			return Promise.method(()=>args)();
		}
}

export function callforwardCreator(args){
	return calls(args, 'callforward');
}

export function callbackCreator(args){
	return calls(args, 'callback').then(()=>{
		try{
			return args.get('batchDispatch')(batchActions(args.get('dispatchList')))		
		}catch(e){
			console.log('Error rendering after state change', e)
			throw e
		}		
	})
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



export function flattenContent(args, content){
	if(args.get('flattenContent')){
		const flattenContentList = createFlattenContentList(args.get('flattenContent'), args.get('tree').last())
		return flattenContentFromList(content, flattenContentList)
	}
	return content
}

export function createFlattenContentList(rawFlattenContentList, id){	
	const flattenContentList = rawFlattenContentList.split('/')
	return flattenContentList.map((v)=>{
		if(v == ':id'){
			return id
		}
		return v
	})
}

export function flattenContentFromList(content, list){
	const getContent = content.getIn(list);
	return content.merge(getContent).delete(list[0])
}

export function combineContent(args){
	const formContent = getContent(args.get('form'))
	const combinedContent = formContent.mergeDeep(args.get('content').toJS());
	if(args.get('type') == 'update'){
		const flattenedCombinedContent = flattenContent(args, content);
		return args.merge({formContent, flattenedCombinedContent});
	}
	return args.merge({formContent, combinedContent});
}


export function combineContent(args){
		const formContent = getContent(args.get('form'))
		const combinedContent = formContent.mergeDeep(args.get('content').toJS());
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
	
	
	console.log('response', response);

	if(response.hasOwnProperty('errors')){
		throw args.set('response', response)
	}
		try{
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
			console.log('ERROR ON RENDER RESPONSE', e)
		}	
}


export const getType = Promise.method((args)=>{
	if(args.get('response')){
		return args.get('response');
	}
	return get(args.get('path'));
});




/*

import {post, put, get, del, up} from './fetch';
import * as fetch from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';
import {batchActions} from 'redux-batched-actions';
export const arrayRegex = /(\[.*\])/g;
export const arrayRegexUnGreed = /(\[.*?\])/

export function getId(args){
	if(args.get('id')){
		return args.get('id');
	}
	return componentHelpers.createId();
}

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

export function flattenContent(args, content){
	if(args.get('flattenContent')){
		const flattenContentList = createFlattenContentList(args.get('flattenContent'), args.get('tree').pop())
		return flattenContentFromList(args.get('combinedContent'), flattenContentList)
	}
	return content
}

export function createFlattenContentList(rawFlattenContentList, id){	
	const flattenContentList = rawFlattenContentList.split('/')
	flattenContentList.toSeq().map((v)=>{
		if(v == ':id'){
			return id
		}
		return v
	})
}

export function flattenContentFromList(content, list){
	const getContent = content.getIn(list);
	return content.merge(getContent).deleteIn(list)
}

export function getContent(content){
	const elements = content.childNodes;
	const contentMap = List(elements).reduce((object, element)=>{
			const nextObject = object.mergeDeep(getContent(element));
			if(element.getAttribute){
				const name = element.getAttribute('name');
				if(name){
					if(element.type === 'checkbox' || element.type === 'radio'){
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


export function calls(args, type){
		if(args.get(type)){
			return Promise.method(
				(args)=>{
					try{
						return args.get(type)(args)
					}catch(e){
						console.log(type, 'error', e)
					}
				}
			)(args);
		}else{
			return Promise.method(()=>args)();
		}
}

export function callforwardCreator(args){
	return calls(args, 'callforward');
}

export function callbackCreator(args){
	return calls(args, 'callback').then(()=>{
		try{
			return args.get('batchDispatch')(batchActions(args.get('dispatchList')))		
		}catch(e){
			console.log('Error rendering after state change', e)
			throw e
		}		
	})
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
		const combinedContent = formContent.mergeDeep(args.get('content').toJS());
		if(args.get('type') == 'update'){
			const flattenedCombinedContent = flattenContent(args, content);
			return args.merge({formContent, flattenedCombinedContent});
		}
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
	
	
	console.log('response', response);

	if(response.hasOwnProperty('errors')){
		throw args.set('response', response)
	}
		try{
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
			console.log('ERROR ON RENDER RESPONSE', e)
		}	
}


export const getType = Promise.method((args)=>{
	if(args.get('response')){
		return args.get('response');
	}
	return get(args.get('path'));
});

*/