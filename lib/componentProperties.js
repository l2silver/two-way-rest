import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Map, List, is} from 'immutable';
import * as actionCreators from './creators';
import {triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
const i = inflect(true);

export function urlPath(tree){
	return '/'+tree.join('/');
}

export function getTree(start, location = false){
	const checkLocation = location ? location : window.location.href;
	const fullUrl = List(checkLocation.split('/'))
	const index = fullUrl.indexOf(start);
	const url = fullUrl.slice(index + 1)
	if(fullUrl.last() == 'edit' || fullUrl.last() == 'index'){
		return url.pop();
	}
	return url;
}

export function createId(){
	return Math.random().toString().slice(3);
}

export function convertTree(tree){
		if( Object.prototype.toString.call( tree ) === '[object Array]' ) {
		    return tree;
		}else{
			return tree.toList().toJS();
		}
}

export function createArgs(twr, form){
	return Map({
			reducer: twr.context.reducer,
			tree: twr.tree(),
			outTree: twr.outTree(),
			path: twr.path(),
			form: form,
			content: Map(twr.props.content),
			callforward: twr.props.callforward,
			callback: twr.props.callback,
			onSuccess: twr.props.onSuccess,
			onFailure: twr.props.onFailure,
			onSuccessCB: twr.props.onSuccessCB,
			onFailureCB: twr.props.onFailureCB,
			upload: twr.props.upload
		})
}


export const defaultProperties = Map({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];
		}
		return false;
	},
	instance: function(){

		//console.log('tree', this.tree().toJS())
		//console.log('page', this.page().toJS())
		if(this.page() && this.tree()){
			return this.page().getIn(this.tree());
		}
		return false;
  	},
	tree: function(){
  		if(this.props.tree){
  		
  			return List(this.props.tree)
  		}
  		if(this.props.instance){
  		
  			return this.props.instance.get('tree');
  		}
  		if(this.props.location){
  		
  			return getTree(this.context.reducer, this.props.location);
  		}
  		return getTree(this.context.reducer);
  	},
  	outTree: function(){
  		if(this.props.outTree){
  			return List(this.props.outTree)
  		}
  		return this.tree();
  	},
  	path: function(){
  		if(this.props.path){
  			return this.props.path
  		}
  		return urlPath(this.tree());
  	}

});

export const defaultGetRenderProperties = {
	render: function(){
		if(this.instance() && !is(this.instance(), Map({TWRShow: true}) ) ){
			if(this.props.replace){
				return this.props.replace(this);
			}
			const DomTag = this.props.tag ? this.props.tag : 'div';
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance(), instances: this.instance()});
	    	});
			
	    	
			return(	<DomTag className={this.props.className ? 'twr ' + this.props.className : 'twr'}>
					{childrenWithProps}
				</DomTag>
			)
		}
    	return <div style={{display: 'none'}}/>
	}
}

export const defaultPostRenderClickProperties = {
	render: function(){	
		if(this.instance()){
			if(this.props.replace){
				return this.props.replace(this);
			}
			const DomTag = this.props.tag ? this.props.tag : 'div';
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance(), submitForm: this.submitForm});
	    	});
			return(
				<DomTag className={this.props.className ? 'twr ' + this.props.className : 'twr'} onClick={this.submitForm}>
					{childrenWithProps}
				</DomTag>
			)
		}		
    	return <div style={{display: 'none'}}/>
	}
}

export const defaultPostRenderProperties = {
	render: function(){
		if(this.instance()){
			if(this.props.replace){
				return this.props.replace(this);
			}
			const DomTag = this.props.tag ? this.props.tag : 'form';
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance(), submitForm: this.submitForm});
	    	});
			return(
				<DomTag className={this.props.className ? 'twr ' + this.props.className : 'twr'} onSubmit={this.submitForm}>
					{childrenWithProps}
				</DomTag>
			)
		}
    	return <div style={{display: 'none'}}/>
	}
}

export const defaultCreateSubstate = {
	getId: function(){
		if(this.substateId){
			return this.substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	componentDidMount: function(){
    	this.props.substateCreate(
    		createArgs(
    			this
    			, findDOMNode(this)
    		)
    		.update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		)
    	)
  	}
}

export const defaultPostProperties = Map({
	getId: function(){
		if(this.substateId){
			return substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	submitForm: function(event){
		event.preventDefault();
		this.props
		.create(
			createArgs(this, findDOMNode(this))
			.update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		)
    	)
	},
	path: function(){
		return urlPath(this.tree().shift().pop());
	}
});


export const defaultPostCreateProperties = Map(defaultPostProperties)
.merge(defaultPostRenderProperties)
.merge(defaultCreateSubstate);


export const defaultGetProperties = Map({
	componentWillUpdate: function(){
  		this.checkUpdate()
  	},
	componentDidMount: function(){
  		this.checkUpdate()
  	}
}).merge(defaultGetRenderProperties);