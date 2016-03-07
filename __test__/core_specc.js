import {expect} from 'chai';
import {
	create
	, index
	, show
	, createError
	, substateCreate
	, cleanSubstate
	, update
	, destroy
	, checkTreeExists
	, setMaps
	, convertArrayToOrderedMap
	, fromJSOrdered
	, transformResponse
	
} from './../lib/core';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';


describe('core', ()=>{

/*
	Why do we need to know the map?

	Can we not compile our own map based off of the properties.
	If object or array, etc.

	First, check if object is an array.
*/
	

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
					 		['1', Map({id: 1})]
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
		describe('substate', ()=>{
			it('success', ()=>{
				const state = Map({

				});
	
				const nextState = substateCreate(state, ['users', '1', 'subusers'], {looks: 'good', id: 2});
				expect(nextState).to.equal(
					Map({
							Substate: OrderedMap({
								users: OrderedMap({
								1: Map({
									subusers: OrderedMap({
										2: Map({
											  looks: 'good'
											, id: 2
											, tree: List(['users', '1', 'subusers'])
										})
									})
								})
							})
						})
					})
				);
			});
		});
		it('cleanSubstate', ()=>{
			const tree = List(['users']);
			const content = {id: 1, content: 'content', tree}
			const state = Map({
				Substate: OrderedMap({
					users: OrderedMap({
						1: Map(content)
					})
				})
			})
			const nextState = cleanSubstate(state, content, tree)
			expect(nextState).to.equal(
				Map({
					Substate: OrderedMap({
						users: OrderedMap({
							1: Map({id: 1, content: '', tree})
						})
					})
				})
			)
		})
		it('success', ()=>{

			const tree = List(['users'])
			const response = {looks: 'good', id: 2}
			const content = {looks: 'good', id: 1}
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						1: Map(content).merge({tree})
					})
				})
			})	
			const nextState = create(state, tree, content, response);
			expect(nextState).to.equal(
				Map({
					users: OrderedMap({
						2: Map(
							response
						).merge({tree})
					}), 
					Substate: Map({
						users: OrderedMap({
							1: Map({id: 1, looks: ''}).merge({tree})
						})
					})
				})
			);
		});
		it('createError', ()=>{		
			const tree = List(['users']);
			const response = {errors: 'error'};
			const content = {id: 1};
			const state = Map({
				Substate: OrderedMap({
					users: OrderedMap({
						1: Map({id: 1, tree})
					})
				})
			})
			const nextState = createError(state, tree, content, response);
			expect(nextState).to.equal(
				Map({
					Substate: OrderedMap({
						users: OrderedMap({
							1: Map({id: 1, tree}).merge(response)
						})
					})
				})
			)
		});
	});
	
	it('update', ()=>{
		const state = Map({
			users: OrderedMap()
			, Substate: Map()
		})

		const nextState = update(state, ['users', '1', 'subusers'], {looks: 'alright', id: 2});
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					'1': Map({
						subusers: OrderedMap({'2': 
							Map({looks: 'alright', id: 2})
						})
					})
				})
				, Substate: Map()
			})
		);
	});
	it('destroy', ()=>{
		const nextState = destroy(state, ['users', '1', 'subusers'], 2);
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
	it('index', ()=>{
		const state = Map();
		const tree = List(['users']);
		const response = [{id: 1}]
		const nextState = index(state, tree, response);
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({id: 1, tree})
				})
			})
		);
	});
	it('show', ()=>{
		const state = Map();
		const tree = List(['users', '1']);
		const response = {id: 1}
		const nextState = show(state, tree, response);
		expect(nextState).to.equal(
			Map({
				users: OrderedMap({
					1: Map({id: 1, tree})
				})
			})
		);
	});
});