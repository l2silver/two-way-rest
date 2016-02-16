import {post, put} from './fetch';
import FormData from 'form-data';
import {List, Map} from 'immutable';
import $ from 'jquery'

String.prototype.toUnderscore = function(){
	return this.replace(/([A-Z])/g, function($1){
		return '_'+$1.toLowerCase();
	}).replace(/^_/, '');
};

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

export function create(reducer, tree, form, callback = false){
	return (dispatch, getState)=>{
		console.log('rdfcreate', reducer, tree, form);
		const treeWithoutSubstate = List(tree).shift();
		const formData = new FormData(form);
		post(
			  urlPath(treeWithoutSubstate)
			, formData
		).then((response)=>{
			console.log('response', response);			
			const content = getContent(form, reducer, tree);
			console.log('content3', content.toJS());
			console.log('callback', callback);
			if(response.hasOwnProperty('errors')){
				dispatch(createErrorAction(reducer, tree, content.toJS(), response));
			}else{
				
				dispatch(createAction(reducer, tree, content.toJS(), response));
				
			}
			if(callback){
				return dispatch(callback(reducer, tree, content.toJS(), response))
			}
		})
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

export function updateFront(reducer, tree, form){
	return (dispatch, getState)=>{
		console.log('updateFront');
		const content = getContent(form, reducer, tree);
		console.log('contentJS', content.toJS());
		return dispatch(updateAction(reducer, tree, content.toJS()));
	}
}

export function update(reducer, tree, form){
	return (dispatch, getState)=>{
		console.log('updateCreator')
		console.log('this should be firing')
		const content = getContent(form, reducer, tree);
		console.log('content1', content.toJS());
		const treeWithId = List(tree).push(content.get('id'))
		var formData = new FormData();
		

		$.ajax({
		    type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
		    dataType: 'json', // Set datatype - affects Accept header
		    url: 'http://localhost:8000/'+urlPath(treeWithId), // A valid URL
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

export function getContent(content, reducer, tree){
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
	console.log('tree before urlPath', tree);
	const backendSyntaxTree = tree.reduce((list, branch)=>{
		console.log('branch', branch)
		const underscored = branch.toUnderscore();
		return list.push(underscored);
	}, List());

	return '/'+backendSyntaxTree.join('/');
}