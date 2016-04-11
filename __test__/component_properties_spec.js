import React from 'react';
import reactDom, {findDOMNode} from 'react-dom';
import {expect} from 'chai';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import {
	  setStore
	, defaultProperties
	} from './../lib/componentProperties'


//setStore({dispatch: ()=>{}, getState: ()=>{}})
/*
createMockComponent(args){
	var newComponent = {}
	args.toSeq().map((v,k)=>{
		if(typeof v === 'function'){
			return newComponent	
		}
	})
}
*/

describe.only('components_properties', ()=>{
	describe('defaultProperties', ()=>{
		it('getTree', ()=>{
			const MComponent = Object.assign({}, defaultProperties.toJS(), {props: {reducer: 'test'}})
			expect(MComponent.getTree({tree:'tests'})).to.equal(List(['tests']))
		})
		it('tests apple', ()=>{

		})
	})
})