import React from 'react';
import {Map} from 'immutable'
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import { setStore } from './../../lib';
import { StupidTWRIndex } from './../../lib/components';

function changeStore(state, dispatch = ()=>{}){
	setStore({
		getState: ()=>state,
		dispatch
	})
}

/* How should I test this? 


Proposed New Functions

1: Group Ajax Calls into one reducer
shareDispatch
count children
when the last batch has fired, fire all responses.
The end.


2: Reset All Children with reset props

2: reset is a table, with id names

reset function would be the name of the grouped resets
when you want to reset, just run reset editAssembly, and the function erases everything. 

What is it for? Receiver functions, so Show and Index

How does it work? On Mount, if props.reset, dispatch reset 

reset=assemblyEditPage

*/

describe.skip("A suite", function() {
	const state = {example: Map()}
	const context = {reducer: 'example', listTables: ()=>{}, parent: {}}

  it("contains spec with an expectation", function() {
  	changeStore(state)
    expect(shallow(<StupidTWRIndex state={state} tree='users'/>, {context}).is('div')).to.equal(true);
  });

  it("contains spec with an expectation", function() {
    expect(shallow(<Foo />).is('.foo')).to.equal(true);
  });

  it("contains spec with an expectation", function() {
    expect(mount(<Foo />).find('.foo').length).to.equal(1);
  });
});