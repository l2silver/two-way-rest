import {post, put, get, destroy} from './fetch';
import FormData from 'form-data';
import {List, Map} from 'immutable';

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

export function createErrorAction(reducer, tree, content, response){
	return({
		type: reducer,
		tree,
		content,
		response,
		verb: 'CREATE_ERROR'
	})
}

export function updateAction(reducer, tree, response){
	return({
		type: reducer,
		tree,
		content: response,
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

/* 

What we need to do is figureout how people are going to interact with these rest actions, 
and perhaps most importantly, give them a way to go outside of standard rest.

Problem One: How are people going to want to pass custom variables and functions to these rest actions.

Problem Two: How are people going to pass their own rest actions? Simple, they pass the instance, and the address.

So what we need to start building is a library of actions to include as props.

What we always expect to do is process the results.

Theoretical Call Forward:
	
	I need to check if the content is valid before the rest call is made. If it is valid, continue on, otherwise
	, escape to error

	So, we have a simple process. If error, skip to error. Otherwise, go  as usual.

	The callback happens after the events, which means everything has to be 

	Likewise, the post content is content that is added on success.

	So, I will wrap the function in a promise. They can pass either a promise or a regular function.

	Callback function is promisified.

	What do we do on an error?






*/

export function create(args){
	return (dispatch, getState)=>{
		const content = getContent(args.form);
		callForward(args)
		.then((args)=>{
			post(urlPath(args.tree), content)
			.then((response)=>{
				if(response.hasOwnProperty('errors')){
					throw response;
				}
				dispatch(createAction(reducer, tree, content.toJS(), response));
				return response;
			})
			.then((response)=>{
				return callback(args, response);
			})
		})
		.catch((response)=>{
			dispatch(createErrorAction(args.reducer, args.tree, content.toJS(), response, args.postContent));
		})
	}
}

export function callback(args, response){
	if(args.callback){
		return Promise.method(callback)(args, response);
	}else{
		return Promise.method(()=>args)();
	}
}

export function callForward(args){
	if(args.callforward){
		return Promise.method(callforward)(args);
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
			console.log('content2', content.toJS());
			if(response.hasOwnProperty('errors')){
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));	
			}else{
				return dispatch(createAction(reducer, tree, content.toJS(), response));
			}
		})
	}
}

export function updateFront(reducer, tree, form, update){
	console.log('update', update);
	return (dispatch, getState)=>{
		console.log('updateFront');
		const content = getContent(form, reducer, tree);
		const contentWithUpdate = content.merge(update);
		console.log('contentJS', contentWithUpdate.toJS());
		return dispatch(updateAction(reducer, tree, contentWithUpdate.toJS()));
	}
}

export function update(reducer, tree, form){
	return (dispatch, getState)=>{
		const content = getContent(form, reducer, tree);
		const treeWithId = List(tree).push(content.get('id'))
		var formData = new FormData();
		

		$.ajax({
		    type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
		    dataType: 'json', // Set datatype - affects Accept header
		    url: 'http://localhost:8000'+urlPath(treeWithId), // A valid URL
		    headers: {'X-HTTP-Method-Override': 'PUT'}, // X-HTTP-Method-Override set to PUT.
		    data: $(form).serialize() // Some data e.g. Valid JSON as a string
		}).done((response)=>{
			console.log('resonse', response);
			if(response.hasOwnProperty('errors')){
				console.log('errors');
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));	
			}else{
				return dispatch(updateAction(reducer, tree, content.toJS(), response));
			}
		})
	}
}

export function index(reducer, tree, form){
	return (dispatch, getState)=>{
		$.ajax({
		    type: 'GET', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
		    dataType: 'json', // Set datatype - affects Accept header
		    url: 'http://localhost:8000'+urlPath(tree), // A valid URL
		    data: $(form).serialize() // Some data e.g. Valid JSON as a string
		}).done((response)=>{
			console.log('resonse', response);
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

		$.ajax({
		    type: 'GET', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
		    dataType: 'json', // Set datatype - affects Accept header
		    url: 'http://localhost:8000'+urlPath(tree), // A valid URL
		    data: $(form).serialize() // Some data e.g. Valid JSON as a string
		}).done((response)=>{
			console.log('resonse', response);
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
		$.ajax({
		    type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
		    dataType: 'json', // Set datatype - affects Accept header
		    headers: {'X-HTTP-Method-Override': 'DELETE'}, // X-HTTP-Method-Override set to DELETE.
		    url: 'http://localhost:8000'+urlPath(treeWithId), // A valid URL
		    data: $(form).serialize() // Some data e.g. Valid JSON as a string
		}).done((response)=>{
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
			const name = element.getAttribute('name');
			if(name){
				return object.set(name, element.value);
			}
			return object;
		}, Map());
	return contentMap.merge({reducer, tree});
} 

export function urlPath(tree){
	return '/'+tree.join('/');
}