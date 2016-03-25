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
	
} from './../lib/core';


/*


The NEXT PHASE: CELA

I need to figure out how the substate will work. What might make the most sense at this point is a another variable called 

globeType, live, substate

If we include the globeType, everything becomes simpler.

Base Set, Delete, Merge based off of tree.

How do we put things into the globe. We mapState the objects into the globe.

How can I get started? Piece by piece, I'll have to change everything.

But, what could be nice is a simpler structure.

Base create, update are almost identical, except for the rest action, and their ids.

Base delete is different.

Show and index are the same, and should be relegated to one line? It is one action.

Create, Update, Delete, Get

FrontCreate ...










*/

import {fromJS, Map, OrderedMap, List, Seq, is} from 'immutable';
import inflect from 'i';
inflect(true);

describe('core', ()=>{
	
/*
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
							, tree: List(['orange', '1', 'types', '1'])
							})
						]
					])
					, tree: tree.push('1')
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
	*/
/*
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
	*/
	describe('create', ()=>{
		describe('substate', ()=>{
			it('success', ()=>{
				const state = Map();
				const nextState = substateCreate(state, List(['users', '12345']), {id: 12345, looks: 'good'});
				expect(nextState).to.equal(
					Map({
						Substate: Map({
							users: Map({
								'12345': Map({id: 12345, looks: 'good', tree: List(['users', '12345'])})
							})
						})
					})
				);
			});
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
		it('success', ()=>{

			const tree = List(['users', '12345'])
			const response = {looks: 'good', id: 2}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content).merge({tree})
					})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']));
			console.log("What up")
			expect(nextState).to.equal(
				Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).merge({tree})
						})
					}),
					
						users: Map({
							2: Map(
								response
							).merge({tree: tree.pop().push('2')})
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
						'12345': Map(content).merge({tree})
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
							12345: Map({looks: '', id: '12345'}).merge({tree})
						})
					}),
					parents: OrderedMap({
						2: Map({id: 2, users: List([]), usersTWR: List(["2"])})
					}), 
					users: Map({
						2: Map(
							response
						).merge({tree: tree.pop().push('2')})
					}) 
				})
			);
		});
		it.only('success single child', ()=>{

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
						'12345': Map(content).merge({tree})
					})
				})
			})	
			const nextState = create(state, tree, content, response, List(['users', '2']));
			const expectedState = Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).merge({tree})
						})
					}),
					users: Map({
						2: Map({
							looks: 'good'
							, id: 2
							, childTWR: '1'
						}).merge({tree: tree.pop().push('2')})
					}),
					children: Map({
						1: Map({
							id: 1
							, tree: List(['children', '1'])
						})

					})
				});
			//console.log(nextState);
			//console.log(expectedState);
			expect(is(nextState,expectedState)).to.be.true;
		});
		it('success parent relations exist', ()=>{

			const tree = List(['users', '12345'])
			const response = {looks: 'good', id: 2}
			const content = Map({looks: 'good', id: '12345'})
			const state = Map({
				Substate: Map({
					users: OrderedMap({
						'12345': Map(content).merge({tree})
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
							12345: Map({looks: '', id: '12345'}).merge({tree})
						})
					}),
					parents: OrderedMap({
						2: Map({id: 2, usersTWR: List(['1','2'])})
					}), 
					users: Map({
						2: Map(
							response
						).merge({tree: tree.pop().push('2')})
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
						'1': Map({looks: 'alright', id: 1, tree})
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
						1: Map({id: 1, tree: tree.push('1')})
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
						1: Map({id: 1, tree})
					})
			})
		);
	});
	it('new Map Functions', ()=>{		
		const globe = Map({
					tests: Map({
						1: Map({
							id: 1
							, fake_testsTWR: List([1])
						})
					}),
					fake_tests: Map({
						1: Map({
							id: 1
							, fake_tests: List([1])
						})
					}),
				});

	    const instance = globe.getIn(['tests', '1']).set('_globeTWR', globe)
	    
	    expect(checkTWREntries(globe, instance, ['fake_tests', '1'])).to.equal(Map({
							id: 1
							, fake_tests: List([1])
							, _globeTWR: globe
						}));

	    expect(instance.gex(['fake_tests', '1'])).to.equal(Map({
							id: 1
							, fake_tests: List([1])
							, _globeTWR: globe
						}));

	    expect(Map({tiger: {cat: 'lilly'}}).getIn('x', 'cool')).to.equal('cool');
	});

	describe('mapState', ()=>{
		it('simple map', ()=>{
			const initialObject = Map({
				id: 1
				, fake_tests: [
					{
						  id: 1
					}
				]
			});
			const globe = Map({
				tests: Map({
					1: Map({
						id: 1
						, fake_testsTWR: List(['1'])
						, tree: List(['tests', '1'])
					})
				}),
				fake_tests: Map({
					1: Map({
						id: 1,
						tree: List(['fake_tests', '1'])
					})
				}),
			});

			expect(mapState(initialObject, List(['tests', '1']), Map())).to.equal(globe);	
		});

		it('simple', ()=>{
			const initialObject = {
				id: 1
				, fake_tests: [
					{id: 1}
				]
			};
			const globe = Map({
				tests: Map({
					1: Map({
						id: 1
						, fake_testsTWR: List(['1'])
						, tree: List(['tests', '1'])

					})
				}),
				fake_tests: Map({
					1: Map({
						id: 1
						, tree: List(['fake_tests', '1'])
					})
				}),
			});

			expect(mapState(initialObject, List(['tests', '1']), Map())).to.equal(globe);	
		});

		it('simple w/ single', ()=>{
			const initialObject = {
				id: 1
				, child: 
					{id: 1}
			};
			const globe = Map({
				tests: Map({
					1: Map({
						id: 1
						, childTWR: '1'
						, tree: List(['tests', '1'])

					})
				}),
				children: Map({
					1: Map({
						id: 1
						, tree: List(['children', '1'])
					})
				}),
			});

			expect(mapState(initialObject, List(['tests', '1']), Map())).to.equal(globe);	
		});

		it('deep relations', ()=>{
			const faker_tests = [{id: 1}];
			const fake_tests = [
					{
						id: 1
						, faker_tests
						, attributes: {eyes: 'blue'}
					}
				];
			const initialObject = {
				id: 1
				, fake_tests
			};
			const globe = Map({
				tests: Map({
					1: Map({
						id: 1
						, fake_testsTWR: List(['1'])
						,  tree: List(['tests', '1'])

					})
				}),
				fake_tests: Map({
					1: Map({
						id: 1
						, faker_tests
						, attributes: Map({eyes: 'blue'})
						, faker_testsTWR: List(['1'])
						,  tree: List(['fake_tests', '1'])

					})
				}),
				faker_tests: Map({
					1: Map({
						id: 1
						,  tree: List(['faker_tests', '1'])
					})
				}),
			});


			expect(mapState(initialObject, List(['tests', '1']), Map())).to.equal(globe);	
		});
		it('array', ()=>{
			const initialObject = [{
				id: 1
			}];
			const globe = Map({
				tests: Map({
						1: Map({
							id: 1
						,  tree: List(['tests', '1'])							
						})
					})
			});


			expect(mapState(initialObject, List(['tests']), Map())).to.equal(globe);	
		});
		it('array with relations', ()=>{
			const fake_tests = [{id: 1}];
			const initialObject = [{
				id: 1,
				fake_tests
			}];
			const globe = Map({
				tests: Map({
						1: Map({
							id: 1
							, fake_tests
							,  tree: List(['tests', '1'])
							, fake_testsTWR: List(['1'])
						})
					}),
				fake_tests: Map({
						1: Map({
							id: 1
						,  tree: List(['fake_tests', '1'])							
						})
					})
			});
			expect(mapState(initialObject, List(['tests']), Map())).to.equal(globe);
		});
		it('gex', ()=>{
			const fake_tests = [{id: 1}];
			const initialObject = [{
				id: 1,
				fake_tests
			}];
			const globe = mapState(initialObject, List(['tests']), Map());
			const instance = globe.getIn(['tests', '1']).set('_globeTWR', globe)
			expect(instance.gex(['fake_tests', '1'])).to.equal(globe.getIn(['fake_tests', '1']).set('_globeTWR', globe));
		});

	})
	
	it('idArray', ()=>{	
		expect(  is(idArray( [{id: 1}] ), List(['1']) )).to.be.truth
	});

	it('orderedMap', ()=>{	
		expect(  is(orderedMap( [{id: 1}] ), OrderedMap([['1', {id: 1}]]) ) ).to.be.truth
	});
		
	it('createMapObject', ()=>{
		expect(  is(
			createMapObject( 'fake_tests',  [{id: 1}], List(['tests', '1']))
			,   Map({
					thisTree: List(['tests', '1', 'fake_tests'])
					, nextTree: List(['fake_testsTWR'])
					, nextObject: OrderedMap([['1', {id: 1}]])
					, thisObject: List(['1'])
				})
			)).to.be.truth
	});
	
});