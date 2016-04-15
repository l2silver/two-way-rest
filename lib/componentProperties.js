import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Seq, Map, List, is, OrderedMap} from 'immutable';
import * as actionCreators from './creators';
import {createId, mapIf, triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
import {productionUrl} from './fetch'
const i = inflect(true);
var store;
export function setStore(newStore){
	store = newStore
}
export function urlPath(tree){
	return '/'+tree.join('/');
}
export function generateTree(tree, Comp){
	if(typeof tree == 'object'){
		return List(tree)	
	}
	if(tree.charAt(0) == '/'){
		return getTree(Comp.reducer(), tree)
	}
	return getTree(Comp.reducer(), tree)
}
export function getTree(start, location, remote){
	const fullUrl = List(location.split('/'))
	const index = getIndex(start, fullUrl, location, remote);
	const url = fullUrl.slice(index + 1);
	if(fullUrl.last() == 'edit' || fullUrl.last() == 'index' || fullUrl.last() == 'show'){
		return url.pop();
	}
	return url;
}

export function getIndex(start, fullUrl, location, url){
	const remote = url ? url : productionUrl 
	const index = fullUrl.indexOf(start);
	return index > 0 ? index : 
		location.match(remote) ? 
			(fullUrl.size - location.replace(remote, '').split('/').length) : -1;
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
	var holdBatchDispatch = new function(){
		this.dispatchList = [];
		this.addDispatch = (action)=>{
			this.dispatchList.push(action)
		};
		this.getDispatchList = ()=>{
			return this.dispatchList;
		};
	}
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
			response: twr.props.response ? twr.props.response : false,
			dispatch: holdBatchDispatch.addDispatch,
			getState: store.getState,
			batchDispatch: store.dispatch,
			dispatchList: holdBatchDispatch.getDispatchList()
		})
}


export const defaultProperties = Map({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired,
	   listTables: React.PropTypes.func.isRequired,
	   parent: React.PropTypes.object.isRequired
	},
	childContextTypes: {
		listTables: React.PropTypes.func.isRequired,
		parent: React.PropTypes.object.isRequired,
	},
	getChildContext: function() {
		return {
			listTables: this.addChildListTables,
			parent: this
		};
	},
	addChildListTables: function(childListTables){
		this.childListTables.merge(childListTables)
	},
	setListTables: function(table){
		this.listTables.set(table, Map({name: table, reducer: this.reducer()}))
	},
	getListTables: function(){
		return this.listTables.merge(this.childListTables)
	},
	gex: function(_table, instance){
		try{
			this.setListTables(_table);
			if(instance){
				const _ids = instance.get(_table + 'TWR');
				if(_ids){
					if(List.isList(_ids)){
						return _ids.reduce((orderedMap, id)=>{
							const _foundInstance = this.page().getIn([_table, id.toString()]);
							if(_foundInstance){
								const _id = id.toString()
								return orderedMap.set(_id, _foundInstance.set('tree', List([_table, _id])));
							}
							return orderedMap;
						}, OrderedMap())
					}
					const _tables = _table.pluralize;
					return this.page().getIn([_tables, _ids.toString()]).set('tree', List([_tables, _ids.toString()]))
				}
			}
			return false
		}catch(e){
			console.log('GEX ERROR', e)
			throw e
		}
		
	},
	createDisposableContent: function(content){
		this.disposableContent = content;
	},
	resetDisposableContent: function(){
		this.disposableContent = false
		this.additionalContent = false
	},
	createContentType: function(){
		if(this.additionalContent){
			return this.disposableContent ? Map(Object.assign({}, this.disposableContent)).merge(this.props.content) : Map(this.props.content);
		}
		return this.disposableContent ? Map(Object.assign({}, this.disposableContent)) : Map(this.props.content);
	},
	createContent: function(){
		const content = this.createContentType();
		this.resetDisposableContent();
		return content;
	},
	submitContent: function(content){
		this.combineContent = true;
		this.createDisposableContent(content);
		return this.submitForm({preventDefault: ()=>true});
	},
	submitAdditionalContent(content){
		this.additionalContent = true;
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
		const listTables = this.getListTables();
		const  bool = listTables.toSeq().reduce((bool, table)=>{
			if(bool){
				//console.log('bool', is(this.newPage().get(table), this.newPage(nextProps).get(table)), 
				//	this.newPage().get(table).toJS(), this.newPage(nextProps).get(table).toJS());
				return this.props.state[table.get('reducer')].get(table.get('name')) == nextProps.state[table.get('reducer')].get(table.get('name'))
				return is( this.props.state[table.get('reducer')].get(table.get('name')), nextProps.state[table.get('reducer')].get(table.get('name')) )
			}
			return false
		}, true)
		//console.log('bool', bool)
		return bool;
	},
	checkShouldComponentUpdate: function(nextProps){
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
			}
			if(nextProps[propName] == this.props[propName]){
				return false
			}
			return true
		}, false)

		if(newProps){
			return true
		}

		return !this.sameGlobe(nextProps);
	},
	shouldComponentUpdate: function(nextProps){
		if(this.checkShouldComponentUpdate(nextProps)){
			this.getInstance = undefined
			this.getPage = undefined
			return true
		}
		return false
	},
	componentDidUpdate: function(){
		this.context.listTables(this.getListTables())
		/*
		console.log('passback', 
			this.context.parent.tree ? this.context.parent.tree().toJS() : 'DeclareReducer', 
			this.context.parent.getListTables ? this.context.parent.getListTables().toJS() : 'DeclareReducer'
			)
		console.log('passbackThisTree', this.tree().toJS(), this.getListTables().toJS())
		*/
		/*
		return benchmark('componentDidUpdate', ()=>{this.resetFunction();
		if(this.checkTreeChangeStatus){
			this.globalResetFunction();
			this.checkTreeChangeStatus = false
		}})
		*/
	},
	componentWillMount: function(){
		this.listTables = Map({[this.tree().first()]: Map({name: this.tree().first(), reducer: this.reducer()})}).asMutable();
		this.childListTables = Map().asMutable();
	},
	componentWillUpdate: function(){
		return this.checkTreeChange();
	},
	componentDidMount: function(){
		this.context.listTables(this.getListTables())		
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
	generatePage: function(props){
		const State = this.newPage(props);
		if(State){
			return State;
		}
		return false
	},
	page: function(props){
		if(props || typeof this.getPage != undefined){
			this.getPage = this.generatePage(props);
		}
		return this.getPage;
	},
	generateInstance: function(props){
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
				return Map();
			}
			const instance = page.getIn(tree);
			if(instance){
				if(instance.set){
					if(is(Map({TWRShow: true}), instance)) {
						return false
					}
					if(this.index()){
						const seqInstance = instance.toSeq()
						const _firstInstance = seqInstance.first();

						if(_firstInstance && _firstInstance.get){
							if(_firstInstance.get('id')){
								return seqInstance.map((_instance)=>{
									return _instance.set('tree', List([tree.last(), _instance.get('id').toString()]))
								}).toOrderedMap();	
							}
						}
						return false;
					}
					
					return instance.set('tree', List(tree))
				}
				return instance;
			}
			
		}
		return false;
	},
	instance: function(props){
		if(props || typeof this.getInstance != undefined){
			this.getInstance = this.generateInstance(props);
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
			return generateTree(props.tree, this);
		}
  		if(props.location){
  			return getTree(this.reducer(), props.location);
  		}
  		if(props.instance){
  		
  			return props.instance.get('tree');
  		}
  		throw 'This instance has no tree instance, or location' + props.tree

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
  	},
  	index: function(){
		return false
	}

});

export const defaultIndexProperties =Map({
	index: function(){
		return true
	}
})


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
		actionCreators.update(createArgs(this, findDOMNode(this)))
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