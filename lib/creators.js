import {post, put, get, des, up} from './fetch';
import * as fetch from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';


export function changeFetchType(type, args){
	if(args.get('upload')){
		var formData = new FormData(args.get('form'));
		const keys = args.get('content').keySeq().toArray();
		keys.forEach((key)=>{
			formData.append(key, args.getIn(['content', key]))
		})
		return up(args.get('path'), formData);
	}
	switch(type){
		case 'create':
			return post(args.get('path'), args.get('combinedContent').toJS())
	}
	return put(args.get('path'), args.get('combinedContent').toJS());

}

export function corePOST(args, type){
	return (dispatch)=>{
		console.log('type', type);
		const content = getContent(args.get('form')).merge(args.get('content'));
		const nextArgs = args.set('formContent', getContent(args.get('form')))
		const combinedContent = nextArgs.get('content').merge(nextArgs.get('formContent'));
		return callforwardCreator(nextArgs.set('combinedContent', combinedContent))
		.then((args)=>{
			return changeFetchType(type, args)
			.then((response)=>{
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				console.log('response', response);
				
				dispatch(actions[type + 'Action'](args.get('reducer'), args.get('tree'), args.get('combinedContent').toJS(), response));
				/*
				console.log('how is there an error here?')
				*/
				return callbackCreator(args.set('response', response));
			});
		})
		.catch((response)=>{
			console.log('error', response);
			dispatch(actions[type + 'ErrorAction'](args.get('reducer'), args.get('tree'), args.get('combinedContent'), response, args.postContent));
		})
	}	
}

export function coreGET(args, type){
	const lowerType = type.toLowerCase();
	return (dispatch, getState)=>{
		if(getState()[args.get('reducer')]
			.getIn(
				componentHelpers['check' + type](
					args.get('tree')
				)
			)
		){
			return true;
		}
		dispatch(actions['set'+type+'Action'](args.get('reducer'), args.get('tree')));
		return callforwardCreator(args)
		.then((args)=>{
			return get(args.get('path'))
			.then((response)=>{
				console.log('get response'+type, response);
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				dispatch(actions[lowerType + 'Action'](args.get('reducer'), args.get('tree'), response));
				return callbackCreator(args.set('response', response));
			})
			.catch((response)=>{
				console.log('errors', response);
				return dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
			});
		});
	}
}




export function substateCreate(args){
	return (dispatch, getState)=>{
		const content = getContent(args.get('form'));
		return callforwardCreator(args)
		.then((args)=>{
			return dispatch(actions.substateCreateAction(args.get('reducer'), args.get('tree'), content.toJS()))
		})
		.catch((response)=>{
			return dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), content.toJS(), response, args.get('postContent')));
		})
	}
}

export function create(args){
	return corePOST(args, 'create')
}

export function calls(args, type){
	if(args.get(type)){
		return Promise.method(args.get(type))(args);
	}else{
		return Promise.method(()=>args)();
	}
}

export function createFront(reducer, tree, form){
	return (dispatch, getState)=>{
		const formData = new FormData(form);
		post(
			  urlPath(tree)
			, formData
		).then((response)=>{			
			const content = getContent(form, reducer, tree);
			if(response.hasOwnProperty('errors')){
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));	
			}else{
				return dispatch(createAction(reducer, tree, content.toJS(), response));
			}
		})
	}
}

export function updateFront(args){
	//reducer, tree, form, update){
	return (dispatch, getState)=>{
		const content = getContent(args.get('form'));
		const contentWithUpdate = content.merge(args.get('content'));
		console.log('contentJS', contentWithUpdate.toJS())
		return dispatch(actions.updateFrontAction(args.get('reducer'), args.get('tree'), contentWithUpdate.toJS()));
	}
}

export function update(args){
	return corePOST(args, 'update')
}

export function index(args){
	return coreGET(args, 'Index');
}

export function show(args){
	return coreGET(args, 'Show');
}


export function destroy(args){
	const content = getContent(args.get('form'), args.get('reducer'), args.get('tree'));
	const treeWithId = args.get('tree').push(content.get('id'))
	return (dispatch, getState)=>{
		return des(urlPath(args.get('tree')))
		.then((response)=>{
			console.log('resonse', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(indexErrorAction(args.get('reducer'), args.get('tree'), response));	
			}else{
				return dispatch(actions.destroyAction(args.get('reducer'), args.get('tree'), response));
			}
		})
	}
}
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

export function getContent(content){
	const elements = content.childNodes;
	const contentMap = List(elements).reduce((object, element)=>{
			const nextObject = object.mergeDeep(getContent(element));
			if(element.getAttribute){
				const name = element.getAttribute('name');
				if(name){
					return convertToArrayIf(nextObject, name, element.value);
				}	
			}
			
			return nextObject;
		}, Map());
	return contentMap;
}

export function getFiles(content){
	const elements = content.childNodes;
	const contentMap = List(elements).reduce((object, element)=>{
			const nextList = list.concat(getContent(element));
			console.log('element', element)
			if(element.getAttribute){
				const type = element.getAttribute('type');
				if(type){
					return nextList.push({name: element.getAttribute('name'), path: element.getAttribute('value')});
				}	
			}
			
			return nextList;
		}, List());
	return contentMap;
} 

export function urlPath(tree){
	return '/'+tree.join('/');
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
	return calls(args, 'onSuccessCB');
}
