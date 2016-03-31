import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Map, List, is, OrderedMap} from 'immutable';
import * as actionCreators from './creators';
import {createId, mapIf, triggerSubmit, checkIndex, checkShow} from './componentHelpers';
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

export function convertTree(tree){
		if( Object.prototype.toString.call( tree ) === '[object Array]' ) {
		    return tree;
		}else{
			return tree.toList().toJS();
		}
}

export function createErrors(errors){
	if(errors){
		if(typeof errors == 'object'){
			return mapIf(errors, (error)=>{
				return <span className="label label-danger">{error}</span>
			})
		}
		return <span className="label label-danger">{errors}</span>
	}
	return '';
}

export function createArgs(twr, form){
	return Map({
			reducer: twr.reducer(),
			tree: twr.tree(),
			outTree: twr.outTree(),
			path: twr.path() + (twr.props.pathEnd ? twr.props.pathEnd : ''),
			form: form,
			content: twr.createContent(),
			callforward: twr.props.callforward,
			callback: twr.props.callback,
			onSuccess: twr.props.onSuccess,
			onFailure: twr.props.onFailure,
			onSuccessCB: twr.props.onSuccessCB,
			onFailureCB: twr.props.onFailureCB,
			upload: twr.props.upload,
			force: twr.props.force,
			outTrees: twr.props.outTrees,
			parent: twr.parent(),
			id: twr.props.id,
			twr: twr,
			response: twr.props.response ? twr.props.response : false

		})
}


export const defaultProperties = Map({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	createDisposableContent: function(content){
		this.disposableContent = content;
	},
	resetDisposableContent: function(){
		this.disposableContent = false
	},
	createContent: function(){
		const content = (this.disposableContent ? Map(Object.assign({}, this.disposableContent)) : Map(this.props.content));
		this.resetDisposableContent();
		return content;
	},
	submitContent: function(content){
		this.createDisposableContent(content);
		return this.submitForm({preventDefault: ()=>true});
	},
	globalResetFunction: function(){
		try{
			if(this.props.noReset){
				return true
			}
			console.log('should reset', findDOMNode(this).reset)
			return findDOMNode(this).reset ? findDOMNode(this).reset() : false;
		}catch(e){
			console.log('global reset function Error', e)
		}
	},
	parent: function(){
		return false;
	},
	unmount: function(){
		return true
	},
	mount: function(){
		return true
	},
	componentWillUpdate: function(){
		return this.checkTreeChange();
	},
	componentDidUpdate: function(){
		return this.resetFunction();
	},
	componentDidMount: function(){
		return this.checkTreeChange();
	},
	checkForDifferentPageRerender: function(oldTree, newTree){
		if(oldTree){
			if(oldTree.size != newTree.size){
				return true
			}
			if(oldTree.size <= 1){
				if(is(oldTree, newTree)){
					return false
				}
				return true;
			}



			
			const oldId = oldTree.last();
			const oldPrefix = oldTree.pop().join('/');
			
			const newId = newTree.last();
			const newPrefix = newTree.pop().join('/');
			
			if(isNaN(oldId)){
				if(oldId != newId ){
					return true;
				}
			}
			if(oldPrefix != newPrefix){
				return true;
			}
		}
		return false
	},
	checkTreeChange: function(){
		if(this.checkForDifferentPageRerender(this.oldTree, this.tree())){
			return false;
		}
		
		if(is(this.oldTree, this.tree())){
			return false;	
		}
			if(this.oldTree == undefined){
				this.mount();
				this.mountFunctions();
			}else{
				this.unmount();
				this.mount();
				this.mountFunctions();
			}
			this.oldTree = this.tree();
			return true
	},
	startFunction: function(){
		try{
			return this.props.startFunction ? this.props.startFunction(this) : false;	
		}catch(e){
			console.log('start function Error', e)
		}
		
	},
	resetFunction: function(){
		return true
	},
	mountFunctions: function(){
		this.globalResetFunction();
		this.startFunction();
	},
	reducer: function(){
		if(this.props.reducer){
			return this.props.reducer;
		}
		return this.context.reducer;
	},
	custom: function(fn){
		return this.props.customCreator(this.reducer(), fn);
	},
	customAction: function(fn){
		return this.props.customAction(this.reducer(), fn);		
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.reducer()].set('_globeTWR', this.props.state[this.reducer()]);
		}
		return false;
	},
	globeType: function(){
		return false
	},
	instance: function(){
		if(this.page() && this.tree()){
			if(this.globeType()){

				const State = this.page().get(this.globeType());
				
				if(State){
					return State.getIn(this.tree())
				}
				return Map();
			}
			const instance = this.page().getIn(this.tree());
			if(instance){
				if(instance.set){
					if(is(Map({TWRShow: true}), instance.delete('_globeTWR'))) {
						return false
					}
					const seqInstance = instance.toSeq()
					const _firstInstance = seqInstance.first();
					if(_firstInstance && _firstInstance.get){
						if(_firstInstance.get('id')){
							return seqInstance.map((_instance)=>{
								return _instance.set('_globeTWR', this.page())
							}).toOrderedMap();	
						}
					}
					return instance.set('_globeTWR', this.page())
				}
				return instance;
			}
			
		}
		return false;
  	},
  	instances: function(){
  		return this.instance()
  	},
	tree: function(){
  		if(this.props.tree){
  			return List(this.props.tree)
  		}
  		if(this.props.instance){
  		
  			return this.props.instance.get('tree');
  		}
  		if(this.props.location){
  		
  			return getTree(this.reducer(), this.props.location);
  		}
  		throw 'This instance has no tree instance, or location'
  		//return getTree(this.reducer());
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
  	},
  	childrenProps: function(){
  		return {
  			instance: this.instance(),
  			instances: this.instance(),
  			submitForm: this.submitForm,
  			submitContent: this.submitContent,
  			page: this.page(),
  			custom: this.custom,
  			customAction: this.customAction
  		};
  	}
});



export const defaultGetRenderProperties = {
	render: function(){
			const DomTag = this.props.tag ? this.props.tag : 'div';
			if(this.instance() && !is(this.instance(), Map({TWRShow: true}) ) ){
				try{
					if(this.props.replace){
						return this.props.replace(this);
					}
					
					const childrenWithProps = React.Children.map(this.props.children, (child) => {
			        	return React.cloneElement(child, this.childrenProps());
			    	});
					return(	<DomTag style={this.props.style} className={this.props.className ? 'twr ' + this.props.className : 'twr'}>
							{childrenWithProps}
							{createErrors(this.instance().get('errors'))}
						</DomTag>
					)

				}catch(e){
					console.log('RENDER ERROR', e)
				}
				
			}
	    	return <DomTag style={{display: 'none'}}/>
	}
}

export const defaultPostRenderClickProperties = {
	render: function(){	
		const DomTag = this.props.tag ? this.props.tag : 'div';
		if(this.instance()){
			try{
				if(this.props.replace){
					return this.props.replace(this);
				}
				
				const childrenWithProps = React.Children.map(this.props.children, (child) => {
		        	return React.cloneElement(child, this.childrenProps());
		    	});
				return(
					<DomTag style={this.props.style} className={this.props.className ? 'twr ' + this.props.className : 'twr'} onClick={this.submitForm}>
						{childrenWithProps}
						{createErrors(this.instance().get('errors'))}
					</DomTag>
				)
			}catch(e){
					console.log('RENDER ERROR',this.tree().toJS(), e)
			}
		}

    	return <DomTag style={{display: 'none'}}/>
	}
}

export const defaultPostRenderProperties = {
	render: function(){
		
		const DomTag = this.props.tag ? this.props.tag : 'form';
		
		if(this.instance()){
			try{
				if(this.props.replace){
					return this.props.replace(this);
				}
				
				const childrenWithProps = React.Children.map(this.props.children, (child) => {
		        	return React.cloneElement(child, this.childrenProps());
		    	});
		    	return(
					<DomTag style={this.props.style} className={this.props.className ? 'twr ' + this.props.className : 'twr'} onSubmit={this.submitForm}>
						{childrenWithProps}
						{createErrors(this.instance().get('errors'))}
					</DomTag>	)	
		    	
	    	}catch(e){
					console.log('RENDER ERROR',this.tree().toJS(), e)
			}
		}
    	return <DomTag style={{display: 'none'}}/>
	}
}

export const defaultCreateSubstate = {
	getId: function(){
		if(this.props.id){
			return this.props.id;
		}
		if(this.substateId){
			return this.substateId;
		}
		this.substateId = createId();
		return this.substateId;
	},
	mount: function(){
		this.props.substateCreateCreator(
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
		if(this.props.force && !this.forcedStart){
			this.forcedStart = true;
			this.submitForm({preventDefault: ()=>true});
		}
    	
  	},
  	unmount: function(){
    	this.props.substateDeleteCreator(
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
	globeType: function(){
		return 'Substate'
	},
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
		if(this.props.path){
			return this.props.path;
		}
		return urlPath(this.tree().pop());
	}
});


export const defaultPostUpdateProperties = Map({
	globeType: function(){
			return 'Substate'
	},
	tree: function(){
		const tree = this.props.instance.get('tree').pop().push(this.getId());
		return tree
	},
	outTree: function(){
		if(this.props.outTree){
  			return List(this.props.outTree)
  		}
  		return this.props.instance.get('tree');
	},
	submitForm: function(event){
		event.preventDefault();
		this.props.update(createArgs(this, findDOMNode(this)))
	},
	path: function(){
		return urlPath(this.props.instance.get('tree'));
	}
})

export const defaultPostCreateProperties = Map(defaultPostProperties)
.merge(defaultPostRenderProperties)
.merge(defaultCreateSubstate).merge({
	resetFunction: function(){
		try{
			if(this.props.noReset){
				return true
			}
			const instance = this.instance();
			if(instance && instance.get){
				const lastCreatedId = instance.get('lastCreatedId');
				if(lastCreatedId && lastCreatedId != this.lastCreatedId){
					this.lastCreatedId = lastCreatedId;
					return findDOMNode(this).reset ? findDOMNode(this).reset() : false;
				}
			}
		}catch(e){
			console.log('reset function Error', e)
		}
	},
	outTree: function(){
		if(this.props.outTree){
  			return List(this.props.outTree)
  		}
  		return this.tree().pop();
	}
});


export const defaultGetProperties = Map({
  	mapIf: function(instances, mapFn, instead){
  		if(instances === undefined){
  			return 
  		}
  	},
  	getIn: function(instance, tree, instead){
  		if(instance.getIn(tree) === undefined){
  			return this.triggerGet();
  		}
  	}
}).merge(defaultGetRenderProperties);