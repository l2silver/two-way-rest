import React, {Component} from 'react'
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import * as actionCreators from './mirrorRestCreators';
import inflect from 'i';
const i = inflect(true);

/*

Why do we send an immutable object? It's not neccessary. We just need the toJS version. Right? 

*/


export function convertTree(tree){
		if( Object.prototype.toString.call( tree ) === '[object Array]' ) {
		    return tree;
		}else{
			return tree.toList().toJS();
		}
}

export const DeclareReducer = React.createClass({  
	childContextTypes: {
		reducer: React.PropTypes.string.isRequired
	},
	getChildContext: function() {
		return {reducer: this.props.reducer};
	},
	render: function(){
		return(
			<div className='DeclareReducer'>
				{this.props.children}
			</div>)
	}   
});

export const StupidMRIndex = React.createClass({
	 contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	componentDidMount: function(){
    	this.props.index(this.context.reducer, this.props.tree, findDOMNode(this));
  	},
	render: function(){
		return(
				<form>
					{this.props.children}
				</form>
			)
	}
})

export const StupidMRShow = React.createClass({
	 contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	componentDidMount: function(){
		if(this.props.instance){
			const tree = List(convertTree(this.props.instance.get('tree'))).push(this.props.instance.get('id').toString()).toJS();
			return this.props.show(this.context.reducer, tree, findDOMNode(this));
		}
    	return this.props.show(this.context.reducer, this.props.tree, findDOMNode(this));
  	},
	render: function(){
		return(
				<form>
					{this.props.children}
				</form>
			)
	}
})


export const StupidMRFormCreate = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		this.props.create(this.context.reducer, this.props.instance.get('tree'), event.target);
	},
	render: function(){
		return(
			<RestForm instance={this.props.instance} children={this.props.children} submitForm={this.submitForm}/>
			)
	}
})

export const StupidMRFormCreateChild = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		const tree = List(convertTree(this.props.instance.get('tree'))).unshift('Substate');
		const treeWithId = tree.concat([this.props.instance.get('id').toString(), this.props.childName]).toArray();
		this.props.create(this.context.reducer
			, treeWithId
			, event.target, this.props.callback
		);
	},
	render: function(){	
		const tree = List(convertTree(this.props.instance.get('tree')));
		const objectModelName = tree.last();
		return(
			<form onSubmit={this.submitForm}>
				{this.props.children}
				<input type='hidden' name='id' value='' />
				<input type='hidden' name={objectModelName.singularize + '_id'} value={this.props.instance.get('id').toString()} />
			</form>
			)
	}
})

export const StupidMRFormUpdate = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		this.props.update(this.context.reducer, convertTree(this.props.instance.get('tree')), event.target);
	},
	render: function(){
		 convertTree(this.props.instance.get('tree'))
		return(
			<RestForm {...this.props} submitForm={this.submitForm}/>
			)
	}
})

export const StupidMRXUpdate = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		this.props.updateFront(this.context.reducer, convertTree(this.props.instance.get('tree')), findDOMNode(this), this.props.xUpdate);
	},
	render: function(){
		return(
			<RestXForm {...this.props} submitForm={this.submitForm}/>
			)
	}
})

export class RestXForm extends Component {
	render(){
		return(
				<div className='X' onClick={this.props.submitForm}>
					{this.props.children}
					<input type='hidden' name='id' value={this.props.instance.get('id')}/>
				</div>
			)
	}
}

export const StupidMRFormDestroy = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		this.props.destroy(this.context.reducer, convertTree(this.props.instance.get('tree')), findDOMNode(this));
	},
	render: function(){
		return(
			<RestXForm {...this.props} submitForm={this.submitForm}/>
			)
	}
})


export class RestForm extends Component {
	render(){
		return(
				<form onSubmit={this.props.submitForm}>
					{this.props.children}
					<input type='hidden' name='id' value={this.props.instance.get('id')}/>
				</form>
			)
	}
}



function mapStateToProps(state) {
  return {};
}

export const MRIndex = connect(
	mapStateToProps
	, actionCreators
)(StupidMRIndex);

export const MRShow = connect(
	mapStateToProps
	, actionCreators
)(StupidMRShow);


export const MRFormCreate = connect(
	mapStateToProps
	, actionCreators 
)(StupidMRFormCreate);

export const MRFormCreateChild = connect(
	mapStateToProps
	, actionCreators 
)(StupidMRFormCreateChild);


export const MRFormUpdate = connect(
	mapStateToProps
	, actionCreators 
)(StupidMRFormUpdate);

export const MRXUpdate = connect(
	mapStateToProps
	, actionCreators
)(StupidMRXUpdate);

export const MRFormDestroy = connect(
	mapStateToProps
	, actionCreators 
)(StupidMRFormDestroy);