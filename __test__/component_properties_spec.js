import React from 'react';
import reactDom, {findDOMNode} from 'react-dom';
import {expect} from 'chai';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import {
	  setStore
	, getStore
	, urlPath
	, generateTree
	, getTree
	, createErrors
	, createArgs
	, defaultProperties
	} from './../lib/componentProperties'

function genMock(defaultProps, props){
	return Object.assign({}, defaultProps.toJS(), {props: props})
}

describe('components_properties', ()=>{
	describe('utility functions', ()=>{
		it('setGetStore', ()=>{
			setStore('TheStore');
			expect(getStore()).to.equal('TheStore');			
		})
		describe('generateTree', ()=>{
			it('generatesTree from array', ()=>{
				expect(generateTree(['tree'])).to.equal(List(['tree']));
			})
			it('generatesTree from location', ()=>{
				const MComponent = genMock(defaultProperties, {reducer: 'test'})
				expect(generateTree('tree', MComponent)).to.equal(List(['tree']));
			})
			it('generatesTree from complex location', ()=>{
				const MComponent = genMock(defaultProperties, {reducer: 'test'})
				expect(generateTree('tree/tree/tree', MComponent)).to.equal(List(['tree', 'tree', 'tree']));
			})
		})
		it('urlPath', ()=>{
			expect(urlPath(['test'])).to.equal('/test')
		})
		describe('getTree', ()=>{
			it('with start', ()=>{
				expect(getTree('test', 'http://remoteUrl.com/test/location')).to.equal(List(['location']))
			})
			it('without start', ()=>{
				expect(getTree('tester', 'http://remoteUrl.com/test/location', 'http://remoteUrl.com')).to.equal(List(['test','location']))
			})
		})
		describe('createErrors', ()=>{
			it('has not errors', ()=>{
				expect(createErrors()).to.equal('')	
			})
			it('has errors', ()=>{
				expect(createErrors(Map({errors: 'error'})).props.className).to.equal('default-errors')	
			})
		})
		describe('createArgs', ()=>{
			it('createArgs', ()=>{
				const MComponent = genMock(defaultProperties, {reducer: 'test', tree: 'tree'})
				expect(createArgs(MComponent, 'form').get('tree')).to.equal(List(['tree']))
			})
		})
	})
	describe('defaultProperties', ()=>{
		it('getTree', ()=>{
			const MComponent = genMock(defaultProperties ,{reducer: 'test'})
			expect(MComponent.getTree({tree:'tests'})).to.equal(List(['tests']))
		})
		describe('gex', ()=>{
			const instanceTest = fromJS({id: 1, fake_testsTWR: [1]})
			const instanceFakeTest = fromJS({id: 1})
			const state = {
				test:fromJS({
					tests: {1: instanceTest},
					fake_tests: {1: instanceFakeTest},	
				})
			
			}
			it('list instance example', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				expect(MComponent.gex('fake_tests', instanceTest)).to.equal(OrderedMap({1: instanceFakeTest.set('tree', List(['fake_tests', '1']))}))
			})
			it('single instance example', ()=>{
				const instanceSingle = fromJS({id: 1, fake_testsTWR: 1})
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				expect(MComponent.gex('fake_tests', instanceSingle)).to.equal(instanceFakeTest.set('tree', List(['fake_tests', '1'])))
			})
			it('two degrees single instance', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				expect(MComponent.gex(['fake_tests', '1'], instanceTest)).to.equal(instanceFakeTest.set('tree', List(['fake_tests', '1'])))
			})
			it('three degrees single instance', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				expect(MComponent.gex(['fake_tests', '1', 'id'], instanceTest)).to.equal(1)
			})
			it('no instance', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				expect(MComponent.gex(['fake_tests'])).to.equal(
					OrderedMap(
						{1: 
							instanceFakeTest.set('tree', List(['fake_tests', '1']) )
						})
					)
			})
			it('adds to list table', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				MComponent.gex(['fake_tests', '1', 'id'], instanceTest)
				expect(MComponent.getListTables()).to.equal(
					Map ({ 
						Live: Map({
							"tests": Map ({ "name": "tests", "reducer": "test" }),
							"fake_tests": Map ({ "name": "fake_tests", "reducer": "test" })
						})
					})
				)
			})
			it('adds to list table no instance', ()=>{
				var MComponent = genMock(defaultProperties ,{reducer: 'test', tree: 'tests', state})
				MComponent.componentWillMount()
				MComponent.gex(['fake_tests'])
				expect(MComponent.getListTables()).to.equal(
					Map ({ 
						Live: Map({
							"tests": Map ({ "name": "tests", "reducer": "test" }),
							"fake_tests": Map ({ "name": "fake_tests", "reducer": "test" })
						})
					})
				)
			})
		})
	})
})