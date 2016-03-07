/*_ <!baseComponent=
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	},
!> */
/*_ lib/components.js */
import React, {Component} from 'react'
import ReactDOM, {findDOMNode} from 'react-dom';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import * as actionCreators from './creators';
import {triggerSubmit, checkIndex, checkShow} from './componentHelpers';
import inflect from 'i';
const i = inflect(true);

export function getTree(start){
	const fullUrl = List(window.location.href.split('/'))
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


var defaultSettings = {
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	}

}

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

export const StupidMRBreadCrumbs = React.createClass({
	@baseComponent@
  	tree: function(){
  		if(this.props.tree){
  			return List(this.props.tree)
  		}
  		if(this.props.instance){
  			return this.props.instance.get('tree');
  		}
  		return getTree(this.context.reducer);
  	},
  	instance: function(){
		if(this.page()){
			return this.page().getIn(this.tree());
		}
		return false;
  	},
  	getCurrentTree: function(start, currentValue){
		const fullUrl = List(window.location.href.split('/'))
		const index = fullUrl.indexOf(start);
		const currentIndex = fullUrl.indexOf(currentValue);
		const url = fullUrl.slice((index + 1), currentIndex + 1)
		return url;
  	},
  	convertCurrentValueToName: function(currentValue){
  		console.log('currentValueBeforeConvert',currentValue)
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
		console.log('currentValue', currentValue);
		const linkProps = this.props.map[currentValue];
		console.log('linkProps', linkProps);
		if(linkProps.return !== false){
			return <li><Link to={this.context.reducer +'/'+currentTree.join('/') + linkProps.return}>{this.convertCurrentValueToName(currentValue)}</Link></li>
		}
  	},
  	generateIdLink: function(currentValue, originTree, index){
  		const lastValue = originTree[index - 1];
		const currentTree = this.getCurrentTree(this.context.reducer, lastValue).push(currentValue);
		const linkProps = this.props.map[lastValue];

		if(linkProps.id !== false){
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
  		console.log('REDUCER NAME', this.context.reducer);
  		const tree = getTree(this.context.reducer).toArray();
  		console.log('TREE', tree);
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

/*
	render: function(){
		//console.log('generateLinks', this.checkArrayEmpty(this.generateLinks()));
		return (<ol className="breadcrumb">
		    {this.generateLinks()}
		</ol>
		)
	}
	*/
	///*
	render: function(){
		console.log('generateLinks', this.generateLinks()[0]);
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
	//*/
	
});

export const StupidTWRLink = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
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
  		return getTree(this.context.reducer);
  	},
  	instance: function(){
		if(this.page()){
			return this.page().getIn(this.tree());
		}
		return false;
  	},
  	rest: function(){
  		if(this.props.rest){
  			return '/' + this.props.rest;
  		}
  		return '';
  	},
	render: function(){
		console.log('HELLO FROM LINK', this.instance())
		if(this.instance()){
			return <Link to={this.context.reducer + '/' + this.tree().join('/')+this.rest()}>{this.props.children}</Link>
		}else{
			return <a></a>
		}	
	}
});

export const StupidMRIndex = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	},

	componentWillUpdate: function(){
		const booleanURL = this.url !== window.location.href;
		this.url = window.location.href;
		if(booleanURL){
			if(!this.page().getIn(checkIndex( this.tree() ))){
				return this.props.index(this.context.reducer, this.tree(), findDOMNode(this));	
			}
		}
  	},
	componentDidMount: function(){
		const booleanURL = this.url !== window.location.href;
		this.url = window.location.href;
		if(booleanURL){
			if(!this.page().getIn(checkIndex( this.tree() ))){
				return this.props.index(this.context.reducer, this.tree(), findDOMNode(this));	
			}
		}
  	},
  	tree: function(){
  		if(this.props.tree){
  			return List(this.props.tree)
  		}
  		if(this.props.instance){
  			return this.props.instance.get('tree');	
  		}
  		return getTree(this.context.reducer);
  	},
  	instance: function(){
		if(this.page()){
			return this.page().getIn(this.tree());
		}
		return false;
  	},
	render: function(){
		const DomTag = this.props.tag ? this.props.tag : 'div';
    	if(this.instance()){
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance(), instances: this.instance()});
	    	});
			return(
				<DomTag className={this.props.klass ? 'twr twr-index ' + this.props.klass : 'twr twr-index'}>
					{childrenWithProps}
				</DomTag>
			)
    	}
    	return(
				<DomTag>
				</DomTag>
			)
		
	}
});

export const StupidMRShow = React.createClass({
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
			if(this.page().getIn(this.tree().push('tree'))){
  				return this.page().getIn(this.tree());
			}
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
  		return getTree(this.context.reducer);
  	},
	componentWillUpdate: function(){
		const booleanURL = this.url !== window.location.href;
		if(booleanURL){
			if( !this.page().getIn( checkShow( this.tree() ) ) ){
				return this.props.show(this.context.reducer, this.tree(), findDOMNode(this));
			}
		}
  	},
  	componentDidMount: function(){
		const booleanURL = this.url !== window.location.href;
		this.url = window.location.href;
		if(booleanURL){
			if( !this.page().getIn( checkShow( this.tree() ) ) ){
				return this.props.show(this.context.reducer, this.tree(), findDOMNode(this));
			}
		}
  	},
	render: function(){
		const DomTag = this.props.tag ? this.props.tag : 'div';
    	if(this.instance()){
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance()});
	    	});
			return(
				<DomTag className={this.props.klass ? 'twr twr-show ' + this.props.klass : 'twr twr-show'}>
					{childrenWithProps}
				</DomTag>
			)
    	}
    	return(
				<DomTag>
				</DomTag>
			)
	}
})

export const StupidMRShowFront = React.createClass({
	 contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	instance: function(){
		if(this.page()){
			if(this.page().getIn(this.tree().push('tree'))){
  				return this.page().getIn(this.tree());
			}
		}
		return false;
  	},
  	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	},
  	tree: function(){
  		if(this.props.tree){
  			return List(this.props.tree)
  		}
  		return this.props.instance.get('tree');
  	},
	render: function(){
		const DomTag = this.props.tag ? this.props.tag : 'div';
    	if(this.instance()){
			const childrenWithProps = React.Children.map(this.props.children, (child) => {
	        	return React.cloneElement(child, {instance: this.instance()});
	    	});
			return(
				<DomTag className={this.props.klass ? 'twr twr-show ' + this.props.klass : 'twr twr-show'}>
					{childrenWithProps}
				</DomTag>
			)
    	}
    	return(
				<DomTag>
				</DomTag>
			)
	}
})

export const StupidTWRCreate = React.createClass({
	getInitialState: function() {
    	return {id: createId()};
	},
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	componentDidMount: function(){
    	this.props.substateCreate({
    		reducer: this.context.reducer, 
    		tree: List(this.props.tree).unshift('Substate').push(this.state.id),
    		form: findDOMNode(this)
    	})
  	},
  	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	},
	submitForm: function(event){
		event.preventDefault();
		this.props.create({
			reducer: this.context.reducer,
			tree: List(this.instance().get('tree')),
			form: event.target
		})
	},
	instance: function(){
		if(this.page()){
			if(this.page().getIn(this.tree().push('tree'))){
  				return this.page().getIn(this.tree());
			}
		}
		return false;
		
  	},
	instance: function(){
		return this.page().getIn(List(this.props.tree).unshift('Substate').push(this.state.id.toString()));
	},
	render: function(){	
		const childrenWithProps = React.Children.map(this.props.children, (child) => {
        	return React.cloneElement(child, {instance: this.instance()});
    	});
		return(
			<form onSubmit={this.submitForm}>
				{childrenWithProps}
				<input type='hidden' name='id' value={this.state.id}/>
			</form>
			)
	}
})

export const StupidTWRUpload = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	 tree: function(){
  		if(this.props.tree){
  			return List(this.props.tree)
  		}
  		return this.props.instance.get('tree');
  	},
	submitForm: function(event){
		event.preventDefault();
		this.props.upload({
			reducer: this.context.reducer,
			tree: this.tree(),
			form: event.target,
			path: this.props.path
		})
	},
	render: function(){	
		return(
			<form onSubmit={this.submitForm}>
				{this.props.children}
			</form>
			)
	}
})

export const StupidTWRCreateChild = React.createClass({
	page: function(){
		if(this.props.state){
			return this.props.state[this.context.reducer];	
		}
		return false;
	},
	getInitialState: function() {
    	return {id: createId()};
	},
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	},
	componentDidMount: function(){
    	this.props.substateCreate({
    		reducer: this.context.reducer, 
    		tree: this.tree(),
    		form: findDOMNode(this)
    	})
  	},
	submitForm: function(event){
		event.preventDefault();
		this.props.create({
			reducer: this.context.reducer,
			tree: this.tree(),
			form: event.target,
			callback: this.props.callback
		});
	},
	tree: function(){
		return List(this.props.instance.get('tree')).unshift('Substate').push(this.props.childName).push(this.state.id);
	},
	instance: function(){
		if(this.page()){
			if(this.page().getIn(this.tree().push('tree'))){
  				return this.page().getIn(this.tree());
			}
		}
		return false;
  	},
	render: function(){	
		const tree = this.props.instance.get('tree');
		const objectModelName = tree.pop().last();
		const childrenWithProps = React.Children.map(this.props.children, (child) => {
        	return React.cloneElement(child, {instance: this.instance()});
    	});
		return(
			<form onSubmit={this.submitForm}>
				{this.props.children}
				<input type='hidden' name='id' value={this.state.id} />
				<input type='hidden' name={objectModelName.singularize + '_id'} value={this.props.instance.get('id').toString()} />
			</form>
			)
	}
})

export const StupidTWRUpdate = React.createClass({
	contextTypes: {
	   reducer: React.PropTypes.string.isRequired
	 },
	submitForm: function(event){
		event.preventDefault();
		this.props.update({
			reducer: this.context.reducer,
			tree: this.props.instance.get('tree'), 
			form: event.target
		});
	},
	render: function(){
		const DomTag = this.props.tag ? this.props.tag : 'form';
		const childrenWithProps = React.Children.map(this.props.children, (child) => {
        	return React.cloneElement(child, {triggerSubmit: ()=>{triggerSubmit(this)}});
    	});
		return(
			<DomTag onSubmit={this.submitForm}>
					{childrenWithProps}
					<input type='hidden' name='id' value={this.props.instance.get('id')}/>
			</DomTag>
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

export const StupidTWRDestroy = React.createClass({
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
  return {
  	state: state
  };
}

export const MRBreadCrumbs = connect(
	mapStateToProps
	, actionCreators
)(StupidMRBreadCrumbs);

export const MRIndex = connect(
	mapStateToProps
	, actionCreators
)(StupidMRIndex);

export const MRShow = connect(
	mapStateToProps
	, actionCreators
)(StupidMRShow);

export const MRShowFront = connect(
	mapStateToProps
	, actionCreators
)(StupidMRShowFront);

export const TWRLink = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRLink);


export const TWRUpload = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRUpload);

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

export const MRXUpdate = connect(
	mapStateToProps
	, actionCreators
)(StupidMRXUpdate);

export const TWRDestroy = connect(
	mapStateToProps
	, actionCreators 
)(StupidTWRDestroy);