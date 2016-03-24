import {expect} from 'chai';
import {List, Map, OrderedMap} from 'immutable';
import {combineSwitches, generateRestSwitch} from './../lib/reducers';


describe('mirrorRestReducers', ()=>{
	it('combineSwitches', ()=>{
		function simple(state, action){
			return state*2
		}
		const combinedSwitches = combineSwitches([simple, simple, simple]);
		expect(combinedSwitches(1)).to.equal(8);
	});
	it('generateRestSwitch', ()=>{
		const restSwitch = generateRestSwitch('example');
		const state = Map();
		const tree = List(['users', '1'])
		const action = {
			  type: 'example'
			, tree
			, response: {
				name: 'example'
				, id: 1
			}
			, verb: 'SHOW'

		}
		expect(restSwitch(state, action)).to.equal(
			Map({
				
					users: 
						Map({
						1: Map({
							name: 'example'
							, id: 1
						}).merge({tree})
					})
				
			})
		);
	});
});