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
	it.only('proofOfConceot', ()=>{
		function checkParam(state, param){
			console.log('state', state);
			if(state.has(param+'TWR')){
				const getInstance = state.getX(param+'TWR');
				if(List.isList(getInstance)){
					return getInstance.reduce((orderedMap, id)=>{
						const newInstance = state.page.getIn(['globe', 'livestateGlobe', param, id]);
						if(newInstance){
							newInstance.page = state.page;
							return orderedMap.set(id, newInstance);
						}
						return orderedMap;
					}, OrderedMap())
				}
				const nextInstance = state.page.getIn(['globe', 'livestateGlobe', param, getInstance]);
				if(nextInstance){
					nextInstance.page = state.page
					return 	nextInstance;
				}
			}
			return state.getX(param);
		}
		const page = fromJS({
			globe: {
				livestateGlobe: {
					tests: {
						1: {
							id: 1
							, fake_tests: [1]
						}
					},
					fake_tests: {
						1: {
							id: 1
							, fake_tests: [1]
						}
					},
				},
				substateGlobe: {

				}
			}
		});

		/*
		function changeFn(setName, oldFn, newFn){
			if(newFn){
				const newInstance = Object.assign({}, this, {[setName]: newFn.bind(this)});
				return mutableMap(newInstance);		
			}
			const nextInstance = Object.assign({}, this, {[setName]: this[oldFn]});
			return mutableMap(nextInstance);
		}
		function mutableMap(instance){
			return Object.assign({}, instance, {changeFn: changeFn.bind(instance)});
		}

		expect(Map({test: 'one'})).to.equal(1);

		const instance = page.getIn(['globe', 'livestateGlobe', 'tests', '1']);
		const newInstance = mutableMap(instance);
		const nextInstance = newInstance
		.changeFn('getX', 'get')
		.changeFn('getInX', 'getIn');
		
		expect(nextInstance.getX('id')).to.equal(1);
		const lastInstance = nextInstance.changeFn('getIn','',function(params){
			return params.reduce((instance, param)=>{
				return checkParam(instance, param);
			}, this)
		}).changeFn('get','',function(param){
			return checkParam(this, param);
		});
		console.log('map', Map())
		expect(lastInstance.get('id')).to.equal(1);
		*/
	});
});