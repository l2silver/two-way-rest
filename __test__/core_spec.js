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
	, mapState
	, checkTWREntries
	, idArray
	, orderedMap
	, createMapObject
	, custom
	
} from './../lib/core';


import {fromJS, Map, OrderedMap, List, Seq, is} from 'immutable';
import inflect from 'i';
inflect(true);

describe('core', ()=>{
	it('custom', ()=>{
		const state = Map();
		function fn(state){
			return state.set('users', true)
		}
		const nextState = custom(state, fn)
		expect(nextState).to.equal(Map({users: true}))
	})
	describe('create', ()=>{
		describe('substate', ()=>{
			it('success', ()=>{
				const state = Map();
				const nextState = substateCreate(state, List(['users', '12345']), {id: 12345, looks: 'good'});
				expect(nextState).to.equal(
					Map({
						Substate: Map({
							users: Map({
								'12345': Map({id: 12345, looks: 'good'})
							})
						})
					})
				);
			});
			it('cleanSubstate', ()=>{
				const tree = List(['users', '12345']);
				const content = {id: '12345', content: 'content', tree}
				const state = Map({
					users: OrderedMap({
						12345: Map(content)
					})
				})
				const nextState = cleanSubstate(state, tree)
				expect(nextState).to.equal(
					Map({
						users: OrderedMap({
							12345: Map({id: '12345', content: '', tree})
						})
					})
				)
			})
		});
		
		it('success', ()=>{

			const tree = List(['users', '12345'])
			const response = {looks: 'good', id: 2}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content)
					})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']));
			expect(nextState).to.equal(
				Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).set('lastCreatedId', 2)
						})
					}),
					
						users: Map({
							2: Map(
								response
							)
						}) 
				})
			);
		});
		it('success parent no relations', ()=>{

			const tree = List(['users', '12345'])
			const response = {looks: 'good', id: 2}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content)
					})
				}),
				parents: OrderedMap({
					2: Map({id: 2, users: List([])})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']), List(['parents', '2']));
			expect(nextState).to.equal(
				Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).set('lastCreatedId', 2)
						})
					}),
					parents: OrderedMap({
						2: Map({id: 2, users: List([]), usersTWR: List(["2"])})
					}), 
					users: Map({
						2: Map(
							response
						)
					}) 
				})
			);
		});
		it('success single child', ()=>{

			const tree = List(['users', '12345'])
			const response = {
				looks: 'good'
				, id: 2
				, child: {id: 1}
			}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content)
					})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']));
			const expectedState = Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).set('lastCreatedId', 2)
						})
					}),
					users: Map({
						2: Map({
							looks: 'good'
							, id: 2
							, childTWR: '1'
						})
					}),
					children: Map({
						1: Map({
							id: 1
						})

					})
				});
			expect(nextState).to.equal(expectedState);
		});
		it('success parent relations exist', ()=>{

			const tree = List(['users', '12345'])
			const response = {looks: 'good', id: 2}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content)
					})
				}),
				parents: OrderedMap({
					2: Map({id: 2, usersTWR: List(['1'])})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']), List(['parents', '2']));
			expect(nextState).to.equal(
				Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).set('lastCreatedId', 2)
						})
					}),
					parents: OrderedMap({
						2: Map({id: 2, usersTWR: List(['1','2'])})
					}), 
					users: Map({
						2: Map(
							response
						)
					}) 
				})
			);
		});
		it('createError', ()=>{		
			const tree = List(['users', '1']);
			const response = {errors: 'error'};
			const content = Map({id: 1});
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
			, Substate: Map({
				users: OrderedMap({
					1: Map({id: 1, looks: 'not great'})
				})
			})
		})
		const tree = List(['users', '1'])

		const nextState = update(state, tree, Map({looks: 'alright', id: 1}), {}, List(['users', '1']));
		expect(nextState).to.equal(
			Map({
				
					users: OrderedMap({
						'1': Map({looks: 'alright', id: 1})
					})
				
				, Substate: Map({
					users: OrderedMap({
						1: Map({id: 1, looks: ''})
					})
				})
			})
		);
	});
	it('destroy', ()=>{
		const state = Map({
				users: OrderedMap()

			, Substate: Map({
				users: OrderedMap({
					1: Map({id: 1, looks: 'not great'})
				})
			})
		})
		const nextState = destroy(state, List(['users', '1']), List(['users', '1']));
		expect(nextState).to.equal(
			Map({

					users: OrderedMap({})

				, Substate: Map({
					users: OrderedMap({
						1: Map({id: 1, looks: ''})
					})
				})
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
					users: Map({
						1: Map({id: 1})
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
					users: Map({
						1: Map({id: 1})
					})
			})
		);
	});
});