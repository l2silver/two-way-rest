import {expect} from 'chai';
import {create, createError, update, destroy, checkTreeExists, setMaps
	, convertArrayToOrderedMap
	, fromJSOrdered
	, transformResponse
} from './../lib/core';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';


describe('mirrorRestCore', ()=>{

	describe('transformResponse', ()=>{
		it('two degrees', ()=>{
			const tree = List(['orange']);
			const orderedArray = { id: 1, types: [{ id: 1}] };
			const result = transformResponse(orderedArray, tree);
			expect(result).to.equal(
				Map({
					  id: 1
					, types: OrderedMap([
						['1'
						, Map({
							  id: 1
							, tree: List(['orange', '1', 'types'])
							})
						]
					])
					, tree: List(['orange'])
				})
			)
		})
	});

	it('convertArrayToOrderedMap', ()=>{
		const instanceOne = {id:4};
		const instanceTwo = {id:1};
		const orderedArray = [
								  instanceOne
								, instanceTwo
							];
		const fn = (v, tree)=>{return v};
		expect(convertArrayToOrderedMap(orderedArray, fn, 0)).to.equal(
			OrderedMap(
				[
					   ['4', instanceOne]
					 , ['1', instanceTwo]
				]
			)
		);
	});
	describe('fromJSOrdered', ()=>{
		it('simple', ()=>{
			const orderedArray = [{id:4}, {id:1}];
			expect(fromJSOrdered(orderedArray)).to.equal(
				OrderedMap(
					[
					 ['4', Map({id:4})]
					,['1', Map({id:1})]
					]
				)
			);
		});
		it('complex', ()=>{
			const orderedArray = [{id:4, types: [{id: 1}]}];
			expect(fromJSOrdered(orderedArray)).to.equal(
				OrderedMap(
					[
					 ['4', Map({
					 	  id:4
					 	, types: OrderedMap([
					 		[1, Map({id: 1})]
					 	])
					})]
					]
				)
			);
		});
		it('with non id array', ()=>{
			const orderedArray = [{id:4, types: ['shoes', 'socks']}];
			expect(fromJSOrdered(orderedArray)).to.equal(
				OrderedMap(
					[
					 ['4', Map({
					 	  id:4
					 	, types: OrderedMap([
					 		['shoes', 'shoes']
					 		,['socks', 'socks']
					 	])
					})]
					]
				)
			);
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
	describe('create', ()=>{
		it.only('success', ()=>{		
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