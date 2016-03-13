
import React from 'react';
import reactDom, {findDOMNode} from 'react-dom';
import {expect} from 'chai';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import {DeclareReducer, StupidTWRLink, StupidTWRIndex} from './../lib/components'
import {renderIntoDocument, scryRenderedDOMComponentsWithTag, findRenderedDOMComponentWithClass, createRenderer, shallowRenderer} from 'react-addons-test-utils';
import sd from 'skin-deep';
describe('components', ()=>{
	const instance = Map({
			tree: List(['tests', '1'])
			, id: 1
	})
	const state = {
		test: Map({
			tests: OrderedMap({
				'1': instance
			})
		})
	}
	describe('TWRLink', ()=>{
	  	it('has to address', ()=>{
			const tree = sd.shallowRender(function() {
	        	return <StupidTWRLink instance={instance} state={state}>TEST</StupidTWRLink>;
	      	}, { reducer: "test" });

			const ins = tree.getMountedInstance();
			const vdom = tree.getRenderOutput();
	  		expect(vdom.props.to).to.equal('test/tests/1');
		});
		it('has to address with rest', ()=>{
			const tree = sd.shallowRender(function() {
	        	return <StupidTWRLink instance={instance} state={state} rest='index'>TEST</StupidTWRLink>;
	      	}, { reducer: "test" });

			const ins = tree.getMountedInstance();
			const vdom = tree.getRenderOutput();
	  		expect(vdom.props.to).to.equal('test/tests/1/index');
		});
		it('has children', ()=>{
			const tree = sd.shallowRender(function() {
	        	return <StupidTWRLink instance={instance} state={state} rest='index'>TEST</StupidTWRLink>;
	      	}, { reducer: "test" });

			const ins = tree.getMountedInstance();
			const vdom = tree.getRenderOutput();
	  		expect(vdom.props.children).to.equal('TEST');
		});
	});
	describe('TWRIndex', ()=>{
		describe('default', ()=>{
			it('tree', ()=>{
				const tree = sd.shallowRender(function() {
		        	return <StupidTWRIndex tree={['tests']} state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.tree()).to.equal(List(['tests']));
			});
		  	it('page', ()=>{
				const tree = sd.shallowRender(function() {
		        	return <StupidTWRIndex tree={['tests']} state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.page()).to.equal(state.test);
			});
			it('instance', ()=>{
				const tree = sd.shallowRender(function() {
		        	return <StupidTWRIndex tree={['tests']} state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.instance()).to.equal(state.test.get('tests'));
			});
			describe('get', ()=>{
				function index(args){
						return args
				}
				it('url', ()=>{
					const tree = sd.shallowRender(function() {
			        	return <StupidTWRIndex tree={['tests']} state={state}>TEST</StupidTWRIndex>;
			      	}, { reducer: "test" });
					const ins = tree.getMountedInstance();
					const vdom = tree.getRenderOutput();
			  		expect(ins.url).to.equal(undefined);
				});
				it('fire index creator on mount', ()=>{
					function index(args){
						expect(args.get('reducer')).to.equal('test');
					}
					const renderedComponent = renderIntoDocument(
					  <DeclareReducer reducer='test'>
					  	<StupidTWRIndex tree={['tests']} state={state} index={index}></StupidTWRIndex>
					  </DeclareReducer>
					);
				});
				it('change oldTree state', ()=>{
					function index(args){
						expect(args.get('reducer')).to.equal('test');
					}
					const renderedComponent = renderIntoDocument(
					  <DeclareReducer reducer='test'>
					  	<StupidTWRIndex tree={['tests']} state={state} index={index}></StupidTWRIndex>
					  </DeclareReducer>
					);
					const indexComponent = findRenderedDOMComponentWithClass(
					  renderedComponent,
					  'twr'
					);
				});
				it('takes className prop', ()=>{
					const renderedComponent = renderIntoDocument(
					  <DeclareReducer reducer='test'>
					  	<StupidTWRIndex tree={['tests']} state={state} index={index} className='testName'></StupidTWRIndex>
					  </DeclareReducer>
					);
					const indexComponent = findRenderedDOMComponentWithClass(
					  renderedComponent,
					  'testName'
					);
				});
				it('takes replace prop', ()=>{
					const renderedComponent = renderIntoDocument(
					  <DeclareReducer reducer='test'>
					  	<StupidTWRIndex tree={['tests']} state={state} index={index} replace={()=>{return <div className='replaced'/>}}></StupidTWRIndex>
					  </DeclareReducer>
					);
					const indexComponent = findRenderedDOMComponentWithClass(
					  renderedComponent,
					  'replaced'
					);
				});
			})
		})
	  	
		
	});
});