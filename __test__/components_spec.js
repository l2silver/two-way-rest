
import React from 'react';
import reactDom, {findDOMNode} from 'react-dom';
import {expect} from 'chai';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import {setStore} from './../lib/componentProperties'
import {DeclareReducer, StupidTWRLink, StupidTWRIndex} from './../lib/components'
import {renderIntoDocument, scryRenderedDOMComponentsWithTag, findRenderedDOMComponentWithClass, createRenderer, shallowRenderer} from 'react-addons-test-utils';
import sd from 'skin-deep';
import nock from 'nock';


const responseObject = [{
                  id: 1
                 }]

nock('http://localhost:2000')
                .get('/get_tests_index')
                .reply(200, responseObject);

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
setStore( {dispatch: ()=>{}, getState: ()=>state })
describe.skip('components', ()=>{
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
		        	return <StupidTWRIndex tree='tests' state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.tree()).to.equal(List(['tests']));
			});
		  	it('page', ()=>{
				const tree = sd.shallowRender(function() {
		        	return <StupidTWRIndex tree='tests' state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.page().delete('_globeTWR')).to.equal(state.test);
			});
			it('instance', ()=>{
				const tree = sd.shallowRender(function() {
		        	return <StupidTWRIndex tree='tests' state={state}>TEST</StupidTWRIndex>;
		      	}, { reducer: "test" });
				const ins = tree.getMountedInstance();
				const vdom = tree.getRenderOutput();
		  		expect(ins.instance().delete('_globeTWR').deleteIn(['1', '_globeTWR'])).to.equal(state.test.get('tests'));
			});
			describe('get', ()=>{
				function index(args){
						return args
				}
				it('url', ()=>{
					const tree = sd.shallowRender(function() {
			        	return <StupidTWRIndex tree='tests' state={state}>TEST</StupidTWRIndex>;
			      	}, { reducer: "test" });
					const ins = tree.getMountedInstance();
					const vdom = tree.getRenderOutput();
			  		expect(ins.url).to.equal(undefined);
				});
				it('fire index creator on mount', ()=>{
					setStore( {dispatch: (action)=>{
						if(action.verb == 'SET_GET'){
							delete action.tree
							return expect(action).to.eql({ type: 'test', verb: 'SET_GET' });
						}
						delete action.tree
						delete action.response
						return expect(action).to.eql({ type: 'test', verb: 'INDEX' });
						
					}, getState: ()=>state })
					const renderedComponent = renderIntoDocument(
					  <DeclareReducer reducer='test'>
					  	<StupidTWRIndex tree='get_tests_index' state={state}></StupidTWRIndex>
					</DeclareReducer>

					);
				});
			})
		})
	  	
		
	});
});