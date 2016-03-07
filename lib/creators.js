import {post, put, get, des, up} from './fetch';
import {checkShow, checkIndex} from './componentHelpers';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import Promise from 'bluebird';
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

export function corePOST(args){
	return (dispatch, getState)=>{
		const content = getContent(args.form).merge(args.content);
		return callforwardCreator(args)
		.then((args)=>{
			console.log('hen should fire?');
			console.log(args.tree.toJS());
			post(urlPath(args.tree), content.toJS())
			.then((response)=>{
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				console.log('response', response);
				dispatch(createAction(args.reducer, args.tree, content.toJS(), response));
				return response;
			}).then((response)=>{
				console.log('resonse after');
				return Object.assign({}, args, {response: response})
			})
			.then((args)=>{
					console.log('argsAfter');
				return callbackCreator(args);
			})
		})
		.catch((response)=>{
			dispatch(createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
		})
	}	
}

export function coreGET(){
}

export function upload(args){
	console.log('args', args);
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
				dispatch(updateAction(args.reducer, args.tree, content.toJS(), response));
				return response;
			})
			.then((response)=>{
				return callback(args, response);
			})
		})
		.catch((response)=>{
			console.log('what happened');
			dispatch(createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
		})
	}
}


export function substateCreate(args){
	return (dispatch, getState)=>{
		const content = getContent(args.form);
		return callforwardCreator(args)
		.then((args)=>{
			dispatch(substateCreateAction(args.reducer, args.tree, content.toJS()))
		})
		.catch((response)=>{
			dispatch(createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
		})
	}
}

export function create(args){
	return corePOST(args)
}

export function calls(args, type){
	if(args[type]){
		return Promise.method(args[type])(args);
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
	return calls(args, 'onSuccessCB');
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

		put(urlPath(args.tree), data.toJS()).then((response)=>{
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

export function index(reducer, tree, form){
	return (dispatch, getState)=>{
		console.log('reducer', reducer, 'tree', tree.toJS(), 'checkIndexTree', checkIndex(tree).toJS());
		if(getState()[reducer].getIn(checkIndex(tree))){
			return true;
		}
		dispatch(setIndexAction(reducer, List(tree)));
		return get(urlPath(tree))
		.then((response)=>{
			console.log('index resonse', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(indexErrorAction(reducer, tree, response));	
			}else{
				return dispatch(indexAction(reducer, tree, response));
			}
		})
	}
}

export function show(reducer, tree, form, update){
	return (dispatch, getState)=>{
		console.log('reducer', reducer, 'tree', tree.toJS(), 'checkShowTree', checkShow(tree).toJS());

		if(getState()[reducer].getIn(checkShow(tree))){
			return true;
		}
		dispatch(setShowAction(reducer, List(tree)));
		return get(urlPath(tree))
		.then((response)=>{
			console.log('show response', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(showErrorAction(reducer, tree, response));	
			}else{
				return dispatch(showAction(reducer, tree, response));
			}
		})
	}
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