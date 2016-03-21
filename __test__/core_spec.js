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
import {fromJS, Map, OrderedMap, List, Seq, is} from 'immutable';
import inflect from 'i';
inflect(true);

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

	
		
		function orderedMap(children){
			return children.reduce((orderedMap, child)=>{
				return orderedMap.set(child.id.toString(), child);
			}, OrderedMap())
		}

		function idArray(children){
			return children.reduce((list, child)=>{
				return list.push(child.id.toString());
			}, List())
		}

		function createMapObject(k, js, tree){
			//console.log('js', js)
			if(k == 'tree'){
				return Map({
								  tree: true
								, thisTree: tree.push(k)
								, thisObject: js
							})
			}
			if(typeof js === 'object'){
				if(Array.isArray(js)){
					if(js[0]){
						if(js[0].id){
							return Map({
								  thisTree: tree.push(k+'TWR')
								, nextTree: List([k])
								, nextObject: orderedMap(js)
								, thisObject: idArray(js)
							})
						}
					}
				}
				if(js.id){
					if(k != js.id){
						return Map({
							  thisTree: tree.push(k)
							, nextTree: List([k.pluralize+'TWR'])
							, nextObject: orderedMap([js])
							, thisObject: js.id.toString()
						})
					}
				}
			}
			return Map({
						  thisTree: tree.push(k)
						, thisObject: js
						, nextTree: tree.push(k)
						, nextObject: js
					})
		}
		function mapState(js, tree, globe){
			if(typeof js !== 'object' || js === null){
				return globe.setIn(tree, js);
			}
			if(Array.isArray(js)){
				if(js[0] && js[0].id){
					return addToGLobe(orderedMap(js), tree, globe);
				}
				
			}
			try{
				if(Map.isMap(js)){
					return addToGLobe(js.merge({tree}), tree, globe);
				}
				return addToGLobe(Map(js).merge({tree}), tree, globe);	
			}catch(e){
				console.log('in error', js, tree)
				throw e
			}
			
		}

		function addToGLobe(js, tree, globe){
			return Seq(js).toKeyedSeq().mapEntries(([k, v]) => {
				return [k, 
				createMapObject(k, v, tree)
				]
			}).reduce((globes, mapObject)=>{
				console.log('tree', mapObject.get('thisTree'))
				if(mapObject.get('tree')){
					return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
				}
				const random = Math.floor((Math.random() * 100) + 1);
				console.log(random, 'tree', mapObject.get('thisTree'))
				const initialGlobe = globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
				const nextGlobe = addTreeToObject(mapObject, initialGlobe);
				console.log(random, 'nextGlobe', nextGlobe)
				return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), globes));
			}
			, globe);
		}

		function addTreeToObject(mapObject, globes){
			if(typeof mapObject.get('thisObject') == 'object' && !Array.isArray(mapObject.get('thisObject')) && !List.isList(mapObject.get('thisObject'))  ){
				if( Map.isMap(mapObject.get('thisObject')) ){
					return globes.mergeIn(mapObject.get('thisTree'), {tree: mapObject.get('thisTree')});
				}
				return globes.setIn(mapObject.get('thisTree'), Map(mapObject.get('thisObject')).merge({tree: mapObject.get('thisTree')}));
			}
			return globes
		}


	describe('mapState', ()=>{
		it.only('simple map', ()=>{
			const initialObject = Map({
				id: 1
				, fake_tests: [
					{id: 1}
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
					})
				}),
				fake_tests: Map({
					1: Map({
						id: 1
					})
				}),
			});

			expect(mapState(initialObject, List(['tests', '1']), Map())).to.equal(globe);	
		});

		it('deep relations', ()=>{
			const initialObject = {
				id: 1
				, fake_tests: [
					{
						id: 1
						, faker_tests: [{id: 1}]
						, attributes: {eyes: 'blue'}
					}
				]
			};
			const globe = Map({
				tests: Map({
					1: Map({
						id: 1
						, fake_testsTWR: List(['1'])
					})
				}),
				fake_tests: Map({
					1: Map({
						id: 1
						, faker_testsTWR: List(['1'])
						, attributes: Map({eyes: 'blue'})
					})
				}),
				faker_tests: Map({
					1: Map({
						id: 1
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
							
						})
					})
			});


			expect(mapState(initialObject, List(['tests']), Map())).to.equal(globe);	
		});
		it('array with relations', ()=>{
			const initialObject = [{
				id: 1,
				fake_tests: [{id: 1}]
			}];
			const globe = Map({
				tests: Map({
						1: Map({
							id: 1
							, fake_testsTWR: List(['1'])
						})
					}),
				fake_tests: Map({
						1: Map({
							id: 1
						})
					})
			});


			expect(mapState(initialObject, List(['tests']), Map())).to.equal(globe);	
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