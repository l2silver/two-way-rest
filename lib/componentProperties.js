import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Seq, Map, List, is, OrderedMap} from 'immutable';
import * as actionCreators from './creators';
import {createId, mapIf, triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
import {productionUrl} from './fetch'
var store;
export function setStore(newStore){
	store = newStore
}
export function getStore(){
	return store;	
}

const i = inflect(true);

export function urlPath(tree){
	return '/'+tree.join('/');
}

export function getTree(start, location){
	const fullUrl = List(location.split('/'))
	const index = getIndex(start, fullUrl);
	const url = fullUrl.slice(index + 1);
	if(fullUrl.last() == 'edit' || fullUrl.last() == 'index' || fullUrl.last() == 'show'){
		return url.pop();
	}
	return url;
}

export function getIndex(start, fullUrl){
	const index = fullUrl.indexOf(start);
	return index ? index : 
		fullUrl.indexOf(productionUrl) ? 
			fullUrl.indexOf(productionUrl) : -1;
}

export function convertTree(tree){
		if( Object.prototype.toString.call( tree ) === '[object Array]' ) {
		    return tree;
		}else{
			return tree.toList().toJS();
		}
}

export function createErrors(instance){
	if(instance && instance.get && instance.get('errors')){
		const errors = instance.get('errors');
		if(errors){
			return <div className='default-errors'>{
				typeof errors == 'object' ? mapIf(Seq(errors), (error)=>{
					return <span className="label label-danger">{error}</span>
				}) : <span className="label label-danger">{errors}</span>
			}
			</div>
		}	
	}
	return '';
}
const benchmarkStatus = false


const ignoreProps = {
	state: true,
	instance: true,
	instances: true,
	replace: true,
	children: true
}

export function benchmark(name, fn){
	if(benchmarkStatus){
		const startTime = new Date().getTime();
		const result = fn()
		console.log(name, new Date().getTime() - startTime);
		return result
	}
	return fn();
		
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
	submitFormNE: function(){
		return this.submitForm({preventDefault: ()=>true});
	},
	globalResetFunction: function(){
		try{
			if(this.props.noReset){
				return true
			}
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
	sameGlobe: function(nextProps){
		return is(this.newPage(), this.newPage(nextProps))
	},
	shouldComponentUpdate: function(nextProps){
		if(this.props.forceUpdate){
			return true
		}
		if(window.location.href != this.oldWindow){
			this.oldWindow = window.location.href;
			return true
		}
		const propNames = Object.keys(nextProps);
		const newProps = propNames.reduce((bool, propName)=>{
			if(bool){
				return bool
			}
			switch(propName){
				case 'state':
					return bool
				case 'instance':
					return bool
			}
			if( nextProps[propName] == this.props[propName]){
				return false
			}
			return true
		}, false)

		if(newProps){
			return true
		}

		return !this.sameGlobe(nextProps);

	},
	componentDidUpdate: function(){
		return benchmark('componentDidUpdate', ()=>{this.resetFunction();
		if(this.checkTreeChangeStatus){
			this.globalResetFunction();
			this.checkTreeChangeStatus = false
		}})
		
	},
	componentWillUpdate: function(){
		return this.checkTreeChange();
	},
	componentDidMount: function(){
		return this.checkTreeChange();
	},
	checkTreeChange: function(){
		const tree = this.tree();
		if(is(this.oldTree, tree)){
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
			this.oldTree = tree;
			this.checkTreeChangeStatus = true
			return true
	},
	startFunction: function(){
		try{
			return this.props.startFunction ? this.props.startFunction(this) : false;	
		}catch(e){
			console.log('start function Error', e)
		}
		
	},
	whichProps: function(props){
		if(props){
			return props;
		}
		return this.props;
	},
	tree: function(props){
		const useProps = this.whichProps(props);
		return this.getTree(useProps);
	},
	getState: function(props){
		const useProps = this.whichProps(props);
		return useProps.state;
	},
	newPage: function(props){
		const State = this.getState(props)
		if(State){
			const reducer = this.reducer();
			return State[reducer];
		}
		return false;
	},
	page: function(props){
		if(props || typeof this.getPage !== undefined){
			const State = this.newPage(props);
			if(State){
				this.getPage = State.set('_globeTWR', State);
			}
			this.getPage = false
		}
		return this.getPage
	},
	instance: function(props){
		if(props || typeof this.getInstance !== undefined){
			const useProps = this.whichProps(props);
			const tree = this.tree(useProps);
			const page = this.page(useProps);
			if(page && tree){
				const globeType = this.globeType();
				if(globeType){
					const State = page.get(globeType);
					if(State){
						return State.getIn(tree)
					}
					const seqInstance = instance.toSeq()
					const _firstInstance = seqInstance.first();
					if(_firstInstance && _firstInstance.get){
						if(_firstInstance.get('id')){
							return seqInstance.map((_instance)=>{
								return _instance.set('tree', List([tree.last(), _instance.get('id').toString()])).set('_globeTWR', page)
							}).toOrderedMap();	
						}
					}
					return instance.set('tree', List(tree)).set('_globeTWR', page)
				}
			}
			this.getInstance = false;
		}
		return this.getInstance;
		
		
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
		return actionCreators.customCreator(this.reducer(), fn)(store.dispatch, store.getState);
	},
	customAction: function(fn){
		return actionCreators.customAction(this.reducer(), fn);		
	},
	globeType: function(){
		return false
	},
  	instances: function(){
  		return this.instance()
  	},
	getTree: function(props){
  		if(props.tree){
  			return List(props.tree)
  		}
  		if(props.location){
  			return getTree(this.reducer(), props.location);
  		}
  		if(props.instance){
  		
  			return props.instance.get('tree');
  		}
  		throw 'This instance has no tree instance, or location'
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

			if(this.props.forceRender || (this.instance() && !is(this.instance(), Map({TWRShow: true}) ) ) ){
				try{
					if(this.props.replace){
						return this.props.replace(this);
					}
					const childrenWithProps = React.Children.map(this.props.children, (child) => {
			        	if(child){
			        		return React.cloneElement(child, this.childrenProps());
			        	}
			        	
			    	});
					return(	<DomTag style={this.props.style} className={this.props.className ? 'twr ' + this.props.className : 'twr'}>
							{childrenWithProps}
							{createErrors(this.instance())}
						</DomTag>
					)

				}catch(e){
					console.log('RENDER ERROR GET',this.tree().toJS(), e)
				}
				
			}
	    	return <DomTag style={{display: 'none'}}/>
	}
}

export const defaultPostRenderClickProperties = {
	render: function(){	
		const DomTag = this.props.tag ? this.props.tag : 'div';
		
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
					{createErrors(this.instance())}
				</DomTag>
			)
		}catch(e){
				console.log('RENDER ERROR POST CLICK',this.tree().toJS(), e)
		}
		

    	return <DomTag style={{display: 'none'}}/>
	}
}

export const defaultPostRenderProperties = {
	render: function(){
		
		const DomTag = this.props.tag ? this.props.tag : 'form';
		
		
		try{
			if(this.props.replace){
				return this.props.replace(this);
			}
			
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, this.childrenProps());
	    	});
	    	return(
				<DomTag style={this.props.style} className={this.props.className ? 'twr ' + this.props.className : 'twr'} onClick={this.props.click ? this.submitForm : ()=>{}} onSubmit={this.submitForm}>
					{childrenWithProps}
					{createErrors(this.instance())}
				</DomTag>	)	
	    	
    	}catch(e){
				console.log('RENDER ERROR POST',this.tree().toJS(), e)
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
  	unmount: function(){
    	actionCreators.substateDeleteCreator(
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
    	)(store.dispatch, store.getState)
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
		actionCreators
		.create(
			createArgs(this, findDOMNode(this))
			.update(
    			'content'
    			, content=>content.set(
    				'id'
    				, this.getId()
    			)
    		)
    	)(store.dispatch, store.getState)
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
	getTree: function(props){
		const tree = props.instance.get('tree').pop().push(this.getId());
		return tree;
	},
	outTree: function(){
		if(this.props.outTree){
  			return List(this.props.outTree)
  		}
  		return this.props.instance.get('tree');
	},
	submitForm: function(event){
		event.preventDefault();
		actionCreators.update(createArgs(this, findDOMNode(this)))(store.dispatch, store.getState)
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