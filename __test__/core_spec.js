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
	
				const nextState = substateCreate(state, ['Substate','users', '12345'], {looks: 'good'});
				expect(nextState).to.equal(
					Map({
							Substate: OrderedMap({
								users: OrderedMap({
								12345: Map({
											  looks: 'good'
											, tree: List(['Substate','users', '12345'])
								})
							})
						})
					})
				);
			});
		});
		it('cleanSubstate', ()=>{
			const tree = List(['Substate','users', '12345']);
			const content = {id: '12345', content: 'content', tree}
			const state = Map({
				Substate: OrderedMap({
					users: OrderedMap({
						12345: Map(content)
					})
				})
			})
			const nextState = cleanSubstate(state, tree)
			expect(nextState).to.equal(
				Map({
					Substate: OrderedMap({
						users: OrderedMap({
							12345: Map({id: '12345', content: '', tree})
						})
					})
				})
			)
		})
		it('success', ()=>{

			const tree = List(['Substate', 'users', '12345'])
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
			expect(nextState).to.equal(
				Map({
					Substate: Map({
						users: OrderedMap({
							12345: Map({looks: '', id: '12345'}).merge({tree})
						})
					}),
					users: OrderedMap({
						2: Map(
							response
						).merge({tree: tree.shift().pop().push('2')})
					}) 
				})
			);
		});
		it('createError', ()=>{		
			const tree = List(['Substate','users', '1']);
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

		const nextState = update(state, List(['Substate','users', '1']), Map({looks: 'alright', id: 1}), {}, List(['users', '1']));
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
		const nextState = destroy(state, ['Substate','users', '1'], ['users', '1']);
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
				users: OrderedMap({
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
				users: OrderedMap({
					1: Map({id: 1, tree})
				})
			})
		);
	});
	it('new Map Functions', ()=>{		
		function checkTWREntries(_globe, _firstInstance, _tree){
			const _lastInstance = _tree.reduce((_previousInstance, _entry, _index, array)=>{
				const _instanceTWR = _previousInstance.get(_entry+'TWR');
				if(_instanceTWR){
					if(List.isList(_instanceTWR)){
						const orderedMap = _instanceTWR.reduce((orderedMap, id)=>{
							const newOrderedMap = orderedMap.set(id.toString(), _globe.getIn([_entry.toString(), id.toString()]));
							return newOrderedMap;
						}, OrderedMap())
						return orderedMap;
					}
					return _globe.getIn([_entry.toString(), _instanceTWR.toString()]);
				}
				return _previousInstance.get(_entry.toString());
			}, _firstInstance)
			if(Map.isMap(_lastInstance) || OrderedMap.isOrderedMap(_lastInstance)){
				return _lastInstance.set('_globeTWR', _globe);	
			}
			return _lastInstance;
		}

		Map.prototype.gex = function(k, notSetValue) {
	      const _root = this._root;
	      const _globe = _root.get(0, undefined, '_globeTWR', notSetValue)
	      const _tree = List(k);
	      

	      if(_globe){
	      	return checkTWREntries(_globe, this, k);
	      }
	      throw 'globeTWR must be defined'
	    };




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

		console.log('globe', globe.getIn(['tests']))
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

	it.only('new globe functions', ()=>{
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


		const initialObject = {
				id: 1
				, fake_tests: [
					{id: 1}
				]
			};


/*

	How does one return a root?
	Each returns the globe, merged with itself. 



*/


		function mapState(js, globe){
			if(typeof js !== 'object' || js === null){
				return globe;
			}else{
				return mapObject(js, globe);
			}
		}

		function mapObject(js, globe){
			if(js.get('tree')){
				const newGlobe = globe.mergeDeepIn(js.get('tree'), js);
				return js.toSeq().reduce((combinedGlobes, newJS)=>{
					return mapState(newJS, combinedGlobes);
				}, newGlobe)
			}else{
				return js.toSeq().reduce((combinedGlobes, newJS)=>{
					return mapState(newJS, combinedGlobes);
				}, globe)
			}
		}

		function addToGlobe(js, tree, globe){
			if(typeof js === 'object'){
				return globe.mergeDeepIn(tree, transformToGlobe(js, tree));
			}
		}

		function transformToGlobe(js, tree){
			return Seq(js).mapEntries(([k, v]) => {
				return [k, transformResponse(v, newTree.push(k))]
			})
		}

		expect(addToGlobe(initialObject, ['tests', '1'], Map())).to.equal(globe);	

		expect(initialObject).to.equal(globe);
	});
});