import {expect} from 'chai';
import {setAddress} from './../lib/fetch';
setAddress('http://localhost:2000');
import {getContent, calls, corePOST, coreGET, arrayRegex, convertToArrayIf} from './../lib/creators';
import {fromJS, Map, OrderedMap, Is, List, Seq} from 'immutable';
import jsdom from 'jsdom';
import nock from 'nock';


const responseObject = {
                  id: 1,
                 }

describe('creators', ()=>{
	const document = jsdom.jsdom(`<form id="testForm">
		<input type="hidden" name="test" value="testValue" />
	</form>`);
	const form = document.getElementById('testForm');
	const reducer = 'test';
	const tree = List(['tests'])
	const args = Map({
		form,
		tree,
		reducer
	})
	describe('calls', ()=>{
		it('type exists', (done)=>{
			const nextArgs = args.set('callforward', (args)=>{return args.set('modified', 'true')})
			calls(nextArgs, 'callforward').then((returnedArgs)=>{
				expect(returnedArgs).to.equal(nextArgs.set('modified', 'true'));
				done()
			});
		})
		it('type does not exist', (done)=>{
			calls(args, 'callforward').then((returnedArgs)=>{
				expect(returnedArgs).to.equal(args);
				done()
			});
		})
	})
	describe.only('getContent', ()=>{
		it('simple', ()=>{
			expect(getContent(args.get('form'))).to.equal(Map({test: 'testValue'}))
		})
		it('complex', ()=>{
			const document = jsdom.jsdom(`<form id="testForm">
			<input type="hidden" name="test[]" value="testValue" />
		</form>`);
			const form = document.getElementById('testForm');
			const nextArgs = args.set('form', form);
			expect(getContent(nextArgs.get('form'))).to.equal(
				Map({test: 
					Map().set(0, 'testValue')
				})
			)
		})
		it('very complex', ()=>{
			const document = jsdom.jsdom(`<form id="testForm">
			<input type="hidden" name="test[1][weight]" value="testValue" />
			<input type="hidden" name="test[1][height]" value="testValue" />
		</form>`);
			const form = document.getElementById('testForm');
			const nextArgs = args.set('form', form);
			expect(getContent(nextArgs.get('form'))).to.equal(Map({test: 
					Map().set('1', Map().merge({weight: 'testValue', height: 'testValue'})
					)
				}))
		})
		it('less very complex', ()=>{
			const document = jsdom.jsdom(`<form id="testForm">
			<input type="hidden" name="test[weight]" value="testValue" />
			<input type="hidden" name="test[height]" value="testValue" />
		</form>`);
			const form = document.getElementById('testForm');
			const nextArgs = args.set('form', form);
			expect(getContent(nextArgs.get('form'))).to.equal(Map({test: 
					Map().merge({weight: 'testValue', height: 'testValue'})
				}))
		})
		it('regexArray', ()=>{
			expect('test[]'.match(arrayRegex)[0]).to.equal('[]');
		})
		it('convertToArrayIf', ()=>{
			expect(convertToArrayIf(Map(), 'test[]', 'testValue')).to.equal(Map({test: 
					Map().set(0, 'testValue')
				})
			)
		})
	})
	
	describe('corePost', ()=>{
		it('dispatches create', (done)=>{
			nock('http://localhost:2000')
                .post('/tests')
                .reply(200, responseObject);
			function dispatch(action){
				expect(action.verb).to.equal('CREATE');
				expect(action.type).to.equal('test');
				expect(action.content.test).to.equal('testValue');
				expect(action.response.id).to.equal(responseObject.id);
				expect(action.tree).to.equal(args.get('tree'));
				return done();
			}
			corePOST(args, 'create')(dispatch);
		});
		it('returns args', (done)=>{
			nock('http://localhost:2000')
                .post('/tests')
                .reply(200, responseObject);
			function dispatch(action){
				return action;
			}
			corePOST(args, 'create')(dispatch).then((nextArgs)=>{
				expect(nextArgs.delete('response')).to.equal(args);
				return done()
			});
		})
	})
	describe('coreGet', ()=>{
		it('dispatches Set Index', (done)=>{
			nock('http://localhost:2000')
                .get('/tests')
                .reply(200, [responseObject]);
			const state = {test: Map()}
			function getState(){
				return state;
			}
			function dispatch(action){
				if(action.verb == 'INDEX'){
					return true
				}
				expect(action.verb).to.equal('SET_INDEX');
				expect(action.type).to.equal('test');
				expect(action.tree).to.equal(args.get('tree'));
				return done();
			}
			coreGET(args, 'Index')(dispatch, getState);
		});
		it('dispatches Index', (done)=>{
			const state = {test: Map()}
			function getState(){
				return state;
			}
			nock('http://localhost:2000')
                .get('/tests')
                .reply(200, [responseObject]);
			function dispatch(action){
				if(action.verb == 'SET_INDEX'){
					return action;	
				}
				expect(action.verb).to.equal('INDEX');
				expect(action.type).to.equal('test');
				expect(action.tree).to.equal(args.get('tree'));
				return done();	
				
			}
			coreGET(args, 'Index')(dispatch, getState);
		});
		it('returns args', (done)=>{
			const state = {test: Map()}
			function getState(){
				return state;
			}
			nock('http://localhost:2000')
                .get('/tests')
                .reply(200, [responseObject]);
			function dispatch(action){
				return action;
			}
			coreGET(args, 'Index')(dispatch, getState).then((nextArgs)=>{
				return done()
			});
		})
		it('returns true if get already set', ()=>{

			const state = {test: Map({testsTWRIndex: 'true'})}
			function getState(){
				return state;
			}
			function dispatch(action){
				return action;
			}
			expect(coreGET(args, 'Index')(dispatch, getState)).to.be.truth;
		});
	})
});