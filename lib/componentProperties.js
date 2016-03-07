import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import * as actionCreators from './creators';
import {triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
const i = inflect(true);

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
		if(this.page()){
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
  	}
});


export function createArgs(twr, form){
	return Map({
			reducer: twr.context.reducer,
			tree: twr.tree(),
			form: form,
			content: Map(twr.props.content),
			callforward: twr.props.callforward,
			callback: twr.props.callback,
			onSuccess: twr.props.onSuccess,
			onFailure: twr.props.onFailure,
			onSuccessCB: twr.props.onSuccessCB,
			onFailureCB: twr.props.onFailureCB
		})
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
				<DomTag className={this.props.klass ? 'twr ' + this.props.className : 'twr'} onSubmit={this.submitForm}>
					{childrenWithProps}
				</DomTag>
			)
		}		
    	return <div style={{display: 'none'}}/>
	}
}

export const defaultCreateSubstate = {
	componentDidMount: function(){
    	this.props.substateCreate(
    		createArgs(
    			this
    			, findDOMNode(this)
    		)
    	)
  	}
}

export const defaultFrontUpdateProperties = Map({
	getId: function(){
		return this.props.instance.get('id')
	},
	submitForm: function(event){
		event.preventDefault();
		this.props.updateFront(createArgs(this, findDOMNode(this)).update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		))
	}
	
}).merge(defaultPostRenderClickProperties);


export const defaultPostUpdateProperties = Map({
	getId: function(){
		return this.props.instance.get('id')
	},
	tree: function(){
		return List(this.props.instance.get('tree')).unshift('Substate');
	},
	submitForm: function(event){
		event.preventDefault();
		this.props.update(createArgs(this, findDOMNode(this)).update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		))
	}
	
}).merge(defaultCreateSubstate).merge(defaultPostRenderProperties);

export const defaultPostCreateProperties = Map({
	getId: function(){
		if(this.substateId){
			return substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	submitForm: function(event){
		event.preventDefault();
		this.props.create(createArgs(this, findDOMNode(this)).update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		))
	}
}).merge(defaultGetRenderProperties).merge(defaultCreateSubstate);

export const defaultPostSubstateProperties = Map({
	getId: function(){
		if(this.substateId){
			return substateId;
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
});

export const defaultGetRenderProperties = {
	render: function(){
		if(this.instance()){
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

export const defaultGetProperties = Map({
	componentWillUpdate: function(){
  		this.checkUpdate()
  	},
	componentDidMount: function(){
  		this.checkUpdate()
  	}
}).merge(defaultGetRenderProperties);