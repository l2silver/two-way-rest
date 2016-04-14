import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import * as actionCreators from './creators';
import {triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
import {
	createArgs
	, getStore
	, urlPath
	, getTree
	, generateTree
	, defaultProperties
	, defaultGetProperties
	, defaultIndexProperties
	, defaultCreateSubstate
	, defaultPostCreateProperties
	, defaultPostUpdateProperties
	, defaultPostFrontProperties
	, defaultGetRenderProperties
	, defaultPostRenderProperties
	, defaultPostProperties
	, defaultPostSubstateProperties
	, defaultPostRenderClickProperties
} from './componentProperties';
const i = inflect(true);


export const StupidTWRUpdate = React.createClass(
	defaultProperties
	.merge(defaultCreateSubstate)
	.merge(defaultPostRenderProperties)
	.merge(defaultPostUpdateProperties)
	.toJS());

export const StupidTWRUpdateFront = React.createClass(
	defaultProperties
	.merge(defaultCreateSubstate)
	.merge(defaultPostRenderProperties)
	.merge(defaultPostUpdateProperties)
	.merge({
		submitForm: function(event){
			event.preventDefault();
			actionCreators.updateFront(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState)
		}
	}).toJS());

export const StupidTWRXUpdate = React.createClass(
	defaultProperties
	.merge(defaultCreateSubstate)
	.merge(defaultPostRenderClickProperties)
	.merge({
		getId: function(){
		return this.props.instance.get('id')
		},
		getTree: function(props){
			return List(props.instance.get('tree'));
		},
		outTree: function(){
			if(this.props.outTree){
	  			return List(this.props.outTree)
	  		}
	  		return this.tree().shift();
		},
		submitForm: function(event){
			event.preventDefault();
			actionCreators.updateFront(createArgs(this, findDOMNode(this)).update(
	    			'content'
	    			, content=>content.set(
	    				'id'
	    				, this.getId()
	    			)
	    		))(getStore().dispatch, getStore().getState)
		},
		path: function(){
			return urlPath(this.tree());
		}
	}).toJS()
);


export const StupidTWRDestroy = React.createClass(
	defaultProperties
	.merge(defaultPostProperties)
	.merge(defaultCreateSubstate)
	.merge(defaultPostRenderClickProperties)
	.merge({
	getTree: function(props){
		return List(props.instance.get('tree'));
	},
	outTree: function(){
		return this.tree();
	},
	submitForm: function(event){
		event.preventDefault();
		if(this.props.noPrompt){
			return actionCreators.destroy(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
		}
		const result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if(result){
			return actionCreators.destroy(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
		}
		
	},
	path: function(){
			return urlPath(this.tree());
		}

}).toJS());

export const StupidTWRDestroyFront = React.createClass(
	defaultProperties
	.merge(defaultPostProperties)
	.merge(defaultCreateSubstate)
	.merge(defaultPostRenderClickProperties)
	.merge({
	outTree: function(){
		return this.tree();
	},
	submitForm: function(event){
		event.preventDefault();
		if(this.props.noPrompt){
			return actionCreators.destroyFront(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
		}
		const result = confirm(this.props.prompt ? this.props.promp : 'Are you sure you want to delete?');
		if(result){
			return actionCreators.destroyFront(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
		}
		
	},
	path: function(){
			return urlPath(this.tree());
		}

}).toJS());




export const StupidTWRIndex = React.createClass(defaultProperties.merge(defaultGetProperties).merge(defaultIndexProperties).merge({
	mount: function(){
		return actionCreators.index(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
	}
	}).toJS()
);
export const StupidTWRShow = React.createClass(defaultProperties.merge(defaultGetProperties).merge({
	mount: function(){
		return actionCreators.show(createArgs(this, findDOMNode(this)))(getStore().dispatch, getStore().getState);
	}
}).toJS())

export const StupidTWRShowFront = React.createClass(defaultProperties.merge(defaultGetRenderProperties).toJS());

export const StupidTWRIndexFront = React.createClass(defaultProperties.merge(defaultGetRenderProperties).merge(defaultIndexProperties).toJS());

export const StupidTWRCreate = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	getTree: function(props){
		const listTree = generateTree(props.tree, this);
		return listTree.push(this.getId())
	}
}).toJS());

export const StupidTWRCreateFront = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	getTree: function(props){
		const listTree = generateTree(props.tree, this);
		return listTree.push(this.getId())
	},
	submitForm: function(event){
		event.preventDefault();
		const dom = findDOMNode(this)
		actionCreators.createFront(createArgs(this, dom).update(
		'content'
		, content=>content.set(
			'id'
			, this.getId()
		)
		))(getStore().dispatch, getStore().getState)
	}
}).toJS());

export const StupidTWRCreateChild = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	parent: function(){
		return List([
			this.props.instance.get('tree').first()
			, this.props.instance.get('tree').last()])
	},
	getTree: function(props){
		return List([props.childName, this.getId()]);
	},
	submitForm: function(event){
		event.preventDefault();
		const tree = this.props.instance.get('tree');
		const parentInstanceName = tree.pop().last();
		actionCreators.create(createArgs(this, findDOMNode(this)).update(
			'content'
			, content=>content.set(
				'id'
				, this.getId()
			).set(parentInstanceName.singularize + '_id', this.props.instance.get('id').toString())
		))(getStore().dispatch, getStore().getState)
	}
}).toJS())

export const StupidTWRCreateChildFront = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	parent: function(){
		return List([
			this.props.instance.get('tree').first()
			, this.props.instance.get('tree').last()])
	},
	getTree: function(props){
		return List([props.childName, this.getId()]);
	},
	submitForm: function(event){
		event.preventDefault();
		const tree = this.props.instance.get('tree');
		const parentInstanceName = tree.pop().last();
		actionCreators.createFront(createArgs(this, findDOMNode(this)).update(
			'content'
			, content=>content.set(
				'id'
				, this.getId()
			).set(parentInstanceName.singularize + '_id', this.props.instance.get('id').toString() )
		))(getStore().dispatch, getStore().getState)
	}
}).toJS())



export const StupidTWRBreadCrumbs = React.createClass(defaultProperties.merge({
  	getCurrentTree: function(start, currentValue){
		const fullUrl = List(window.location.href.split('/'))
		const index = fullUrl.indexOf(start);
		const currentIndex = fullUrl.indexOf(currentValue);
		const url = fullUrl.slice((index + 1), currentIndex + 1)
		return url;
  	},
  	convertCurrentValueToName: function(currentValue){
  		if(typeof currentValue.split('_') == 'object'){			
  			return List(currentValue.split('_'))
  			.toSeq()
  			.map(part=>part.titleize)
  			.toArray()
  			.join(' ');
  			return 
  		}else{
  			return currentValue.capitalize;
  		}
  	},
  	generateNameLink: function(currentValue, originTree, index){
  		const currentTree = this.getCurrentTree(this.reducer(), currentValue);
		const linkProps = this.props.map[currentValue];
		if(linkProps && linkProps.return !== false){
			return <li><Link to={this.reducer() +'/'+currentTree.join('/') + linkProps.return}>{this.convertCurrentValueToName(currentValue)}</Link></li>
		}
  	},
  	generateIdLink: function(currentValue, originTree, index){
  		const lastValue = originTree[index - 1];
		const currentTree = this.getCurrentTree(this.reducer(), lastValue).push(currentValue);
		const linkProps = this.props.map[lastValue];

		if(linkProps && linkProps.id !== false){
			return <li><Link to={this.reducer() +'/'+currentTree.join('/') + linkProps.id}>{this.page().getIn(currentTree.push('name'))}</Link></li>
		}
  	},
  	generateLink: function(currentValue, originTree, index){
  		if(isNaN(currentValue)){
			return this.generateNameLink(currentValue, originTree, index)
		}else{
			return this.generateIdLink(currentValue, originTree, index)
		}
  	},
  	generateLinks: function(){
  		const tree = getTree(this.reducer()).toArray();
  		return tree.map((currentValue, index, originTree)=>{
  			if(index + 1 != originTree.length){
	  			return this.generateLink(currentValue, originTree, index);
  			}

  		})
  	},
	checkArrayEmpty(array){
		return array.reduce((boolean, value)=>{
			if(!boolean){
				return value;
			}
			return true
		}, false)
	},
	render: function(){
		if(this.checkArrayEmpty(this.generateLinks())){
			return(
				<ol className="breadcrumb">
		    		{this.generateLinks()}
				</ol>
			)	
		}else{
			return <div style={{display: 'none'}}/>
		}	
	}	
}).toJS());

export const StupidTWRLink = React.createClass(defaultProperties.merge({
  	rest: function(){
  		if(this.props.rest){
  			return '/' + this.props.rest;
  		}
  		return '';
  	},
  	to: function(){
  		return this.reducer() + '/' + this.tree().join('/')+this.rest();
  	},
	render: function(){
		return <Link to={this.to()}>{this.props.children}</Link>
	}
}).toJS());

export const DeclareReducer = React.createClass({  
	shouldComponentUpdate: function(){
		return true
	},
	childContextTypes: {
		reducer: React.PropTypes.string.isRequired,
		listTables: React.PropTypes.func.isRequired,
		parent: React.PropTypes.object.isRequired
	},
	getChildContext: function() {
		return {
			reducer: this.props.reducer,
			listTables: ()=>{},
			parent: this
		};
	},
	render: function(){
		return(
			<div className='DeclareReducer'>
				{this.props.children}
			</div>)
	}   
});



function mapStateToProps(state) {
  return {
  	state: state
  };
}

export const TWRBreadCrumbs = connect(
	mapStateToProps
)(StupidTWRBreadCrumbs);

export const TWRIndex = connect(
	mapStateToProps
	
)(StupidTWRIndex);

export const TWRShow = connect(
	mapStateToProps
	
)(StupidTWRShow);

export const TWRShowFront = connect(
	mapStateToProps
	
)(StupidTWRShowFront);

export const TWRIndexFront = connect(
	mapStateToProps
	
)(StupidTWRIndexFront);

export const TWRLink = connect(
	mapStateToProps
	
)(StupidTWRLink);

export const TWRCreate = connect(
	mapStateToProps
	
)(StupidTWRCreate);

export const TWRCreateFront = connect(
	mapStateToProps
	
)(StupidTWRCreateFront);

export const TWRCreateChild = connect(
	mapStateToProps
	
)(StupidTWRCreateChild);

export const TWRCreateChildFront = connect(
	mapStateToProps
	
)(StupidTWRCreateChildFront);

export const TWRUpdate = connect(
	mapStateToProps
	
)(StupidTWRUpdate);

export const TWRUpdateFront = connect(
	mapStateToProps
	
)(StupidTWRUpdateFront);

export const TWRXUpdate = connect(
	mapStateToProps
	
)(StupidTWRXUpdate);

export const TWRDestroy = connect(
	mapStateToProps
	
)(StupidTWRDestroy);

export const TWRDestroyFront = connect(
	mapStateToProps
	
)(StupidTWRDestroyFront);