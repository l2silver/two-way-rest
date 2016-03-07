import {post, put, get, des, up} from './fetch';
import * as componentHelpers from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
import * as actions from './actions'
import i from 'i';
export function corePOST(args, type){
	return (dispatch)=>{
		const content = getContent(args.get('form')).merge(args.get('content'));
		return callforwardCreator(args)
		.then((args)=>{
			return post(urlPath(args.get('tree')), content.toJS())
			.then((response)=>{
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				console.log('response', response);
				dispatch(actions[type + 'Action'](args.get('reducer'), args.get('tree'), content.toJS(), response));
				return callbackCreator(args.set('response', response));
			});
		})
		.catch((response)=>{
			console.log('error', response);
			dispatch(actions[type + 'ErrorAction'](args.reducer, args.tree, content.toJS(), response, args.postContent));
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
			return get(urlPath(args.get('tree')))
			.then((response)=>{
				console.log('response', response);
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				dispatch(actions[lowerType + 'Action'](args.get('reducer'), args.get('tree'), response));
				return args.set('response', response);
			})
			.then((args)=>{
					return callbackCreator(args);
			})
			.catch((response)=>{
				console.log('errors', response);
				return dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
			});
		});
		
	}
}

export function upload(args){
	return (dispatch, getState)=>{
		const content = getContent(args.form);
		return callforwardCreator(args)
		.then((args)=>{
			const formData = new FormData(args.form);
			console.log('formData', formData);
			return up(args.path, formData)
			.then((response)=>{
				console.log('in response');
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				console.log('response', response);
				dispatch(actions.updateAction(args.reducer, args.tree, content.toJS(), response));
				return response;
			})
			.then((response)=>{
				return callback(args, response);
			})
		})
		.catch((response)=>{
			dispatch(actions.createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
		})
	}
}


export function substateCreate(args){
	return (dispatch, getState)=>{
		const content = getContent(args.form);
		return callforwardCreator(args)
		.then((args)=>{
			dispatch(actions.substateCreateAction(args.reducer, args.tree, content.toJS()))
		})
		.catch((response)=>{
			dispatch(actions.createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
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
		const content = getContent(args.form);
		const contentWithUpdate = content.merge(args.content);
		console.log('contentJS', contentWithUpdate.toJS())
		return dispatch(updateAction(args.reducer, args.tree, contentWithUpdate.toJS()));
	}
}

export function update(args){
	return (dispatch, getState)=>{
		const data = getContent(args.form);
		return put(urlPath(args.tree), data.toJS()).then((response)=>{
			console.log('resonse', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(createErrorAction(args.reducer, args.tree, data.toJS(), response));
			}else{
				return dispatch(updateAction(args.reducer, args.tree, data.toJS(), response));
			}
		})
	}
}

export function index(args){
	return coreGET(args, 'Index');
}

export function show(args){
	return coreGET(args, 'Show');
}


export function destroy(reducer, tree, form){
	const content = getContent(form, reducer, tree);
	const treeWithId = List(tree).push(content.get('id'))
	return (dispatch, getState)=>{
		return des(urlPath(tree))
		.then((response)=>{
			console.log('resonse', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(indexErrorAction(reducer, tree, response));	
			}else{
				return dispatch(destroyAction(reducer, tree, response));
			}
		})
	}
}

export function getContent(content){
	const elements = content.childNodes;
	const contentMap = List(elements).reduce((object, element)=>{
			const nextObject = object.merge(getContent(element));
			if(element.getAttribute){
				const name = element.getAttribute('name');
				if(name){
					return nextObject.set(name, element.value);
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
