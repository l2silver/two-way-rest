import {expect} from 'chai';
import {
	  create
	, createError
	, update
	, destroy
	, checkTreeExists
	, setMaps
	, convertNewJSON
} from './../lib/core';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';


describe('core', ()=>{

/*
	Why do we need to know the map?

	Can we not compile our own map based off of the properties.
	If object or array, etc.

	First, check if object is an array.
*/



	describe.only('convertNewJSON', ()=>{
		it('convertNewJSON object', ()=>{
			const json = {
				1: {id: 2}
				, 2: {id: 3}
				};
						
			expect(convertNewJSON(json)).to.equal(
				OrderedMap({
					2: OrderedMap({id: 2})
					, 3: OrderedMap({id: 3})
				})
			);
		});	
		it('convertNewJSON array', ()=>{

		});	
	});
	

	const state = Map({
		users: OrderedMap()
		, Substate: Map()
	})


	it('setMaps', ()=>{		
		const nextState = setMaps(state, ['users', '1', 'subusers', '2']);
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({
						subusers: OrderedMap({2: Map()
						})
					})
				})
				, Substate: Map()
			})
		);
	});
	it('setMaps Subtree', ()=>{		
		const nextState = setMaps(state, ['Substate', 'users', '1', 'subusers', '2']);
		expect(nextState).to.equal(
			Map({
				users: OrderedMap()
				, Substate: Map({
					users: OrderedMap({
						1: Map({
							subusers: OrderedMap({2: Map()
							})
						})
					})
				})
			})
		);
	});

	it('checkTreeExists', ()=>{		
		const nextState = checkTreeExists(state, ['users', '1'], '1');
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map()
				})
				, Substate: Map()
			})
		);
	});
	it('create', ()=>{		
		const nextState = create(state, ['users', '1', 'subusers'], {looks: 'good', id: 2});
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({
						subusers: OrderedMap({
							2: Map({
								looks: 'good'
								, 'id': 2 
							})
						})
					})
				}), 
				Substate: Map()
			})
		);
	});
	it('createError no id', ()=>{		
		const nextState = createError(state, ['users', '1', 'subusers'], {looks: 'good'}, [{name: 'required'}]);
		const newId = nextState.getIn(['Substate', 'users', '1', 'subusers']).first().get('id');
		expect(nextState).to.equal(
			Map({
				users: OrderedMap()
				, Substate: Map({
					users: OrderedMap({
						1: Map({
							subusers: OrderedMap().set(
								newId
								, Map({
									looks: 'good'								
									, id: newId
									, errors: List([ Map({ "name": "required" })])
								})
							)
						})
					})
				})
			})
		);
	});
	it('createError with id', ()=>{		
		const nextState = createError(state, ['users', '1', 'subusers'], {looks: 'good', id: 10}, [{name: 'required'}]);
		const newId = 10;
		expect(nextState).to.equal(
			Map({
				users: OrderedMap()
				, Substate: Map({
					users: OrderedMap({
						1: Map({
							subusers: OrderedMap().set(
								newId
								, Map({
									looks: 'good'
									, id: newId
									, errors: List([ Map({ "name": "required" })])
								})
							)
						})
					})
				})
			})
		);
	});
	it('update', ()=>{
		const nextState = update(state, ['users', '1', 'subusers', '2'], {looks: 'alright'});
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({
						subusers: OrderedMap({2: 
							Map({looks: 'alright'})
						})
					})
				})
				, Substate: Map()
			})
		);
	});
	it('destroy', ()=>{
		const nextState = destroy(state, ['users', '1', 'subusers', '2']);
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({
						subusers: OrderedMap({
						})
					})
				})
				, Substate: Map()
			})
		);
	});
});