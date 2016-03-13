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
	, urlPath
	, getTree
	, defaultProperties
	, defaultGetProperties
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
	.merge({
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
		},
		path: function(){
			return urlPath(this.tree().shift());
		}
	}
	).toJS());

export const StupidTWRXUpdate = React.createClass(defaultProperties
	.merge(defaultPostProperties)
	.merge(defaultPostRenderClickProperties)
	.merge({
	submitForm: function(event){
		event.preventDefault();
		this.props.updateFront(createArgs(this, findDOMNode(this)));
	},
})
.toJS()
);

export const StupidTWRDestroy = React.createClass(defaultProperties.merge(defaultPostProperties).merge(defaultPostRenderClickProperties).merge({
	submitForm: function(event){
		event.preventDefault();
		this.props.destroy(createArgs(this, findDOMNode(this)));
	}
}).toJS());



export const StupidTWRIndex = React.createClass(defaultProperties.merge(defaultGetProperties).merge({
	mount: function(){
		return this.props.index(createArgs(this, findDOMNode(this)));
	}
	}).toJS()
);
export const StupidTWRShow = React.createClass(defaultProperties.merge(defaultGetProperties).merge({
	mount: function(){
		return this.props.show(createArgs(this, findDOMNode(this)));
	}
}).toJS())

export const DeclareReducer = React.createClass({  
	childContextTypes: {
		reducer: React.PropTypes.string.isRequired
	},
	getChildContext: function() {
		return {
			reducer: this.props.reducer
		};
	},
	render: function(){
		return(
			<div className='DeclareReducer'>
				{this.props.children}
			</div>)
	}   
});




export const StupidTWRShowFront = React.createClass(defaultProperties.merge(defaultGetRenderProperties).toJS());

export const StupidTWRCreate = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	tree: function(){
		return List(this.props.tree).unshift('Substate').push(this.getId())
	}
}).toJS());

export const StupidTWRCreateChild = React.createClass(defaultProperties.merge(defaultPostCreateProperties).merge({
	tree: function(){
		return List(this.props.instance.get('tree')).unshift('Substate').push(this.props.childName).push(this.getId());
	},
	submitForm: function(event){
		event.preventDefault();
		const tree = this.props.instance.get('tree');
		const parentInstanceName = tree.pop().last();
		this.props.create(createArgs(this, event.target).update(
			'content'
			, content=>content.set(
				'id'
				, this.getId()
			).set(parentInstanceName.singularize + '_id', this.props.instance.get('id').toString())
		))
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
  		const currentTree = this.getCurrentTree(this.context.reducer, currentValue);
		const linkProps = this.props.map[currentValue];
		if(linkProps && linkProps.return !== false){
			return <li><Link to={this.context.reducer +'/'+currentTree.join('/') + linkProps.return}>{this.convertCurrentValueToName(currentValue)}</Link></li>
		}
  	},
  	generateIdLink: function(currentValue, originTree, index){
  		const lastValue = originTree[index - 1];
		const currentTree = this.getCurrentTree(this.context.reducer, lastValue).push(currentValue);
		const linkProps = this.props.map[lastValue];

		if(linkProps && linkProps.id !== false){
			return <li><Link to={this.context.reducer +'/'+currentTree.join('/') + linkProps.id}>{this.page().getIn(currentTree.push('name'))}</Link></li>
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
  		const tree = getTree(this.context.reducer).toArray();
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
  		return this.context.reducer + '/' + this.tree().join('/')+this.rest();
  	},
	render: function(){
		if(this.instance()){
			return <Link to={this.to()}>{this.props.children}</Link>
		}else{
			return <a />
		}	
	}
}).toJS());

function mapStateToProps(state) {
  return {
  	state: state
  };
}

export const TWRBreadCrumbs = connect(
	mapStateToProps
	, actionCreators
)(StupidTWRBreadCrumbs);

export const TWRIndex = connect(
	mapStateToProps
	, actionCreators
)(StupidTWRIndex);

export const TWRShow = connect(
	mapStateToProps
	, actionCreators
)(StupidTWRShow);

export const TWRShowFront = connect(
	mapStateToProps
	, actionCreators
)(StupidTWRShowFront);

export const TWRLink = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRLink);

export const TWRCreate = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRCreate);

export const TWRCreateChild = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRCreateChild);


export const TWRUpdate = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRUpdate);

export const TWRXUpdate = connect(
	mapStateToProps
	, actionCreators
)(StupidTWRXUpdate);

export const TWRDestroy = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRDestroy);