import {expect} from 'chai';
import {Map, OrderedMap} from 'immutable';
import {combineSwitches, generateRestSwitch} from './../mirrorRestReducers';


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
		const action = {
			  type: 'example'
			, tree: ['users']
			, content: {
				name: 'example'
				, id: 1
			}
			, verb: 'CREATE'

		}
		expect(restSwitch(state, action)).to.equal(
			Map({users: 
				OrderedMap({
					1: Map({
						name: 'example'
						, id: 1
					})
				})
			})
		);
	});
});