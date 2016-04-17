import {expect} from 'chai';
import {setAddress} from './../lib/fetch';
setAddress('http://localhost:2000');

import {
	getContent
	, calls
	, corePOST
	, coreGET
	, arrayRegex
	, convertToArrayIf
	, create
	, update
	, createEventTrain
	, combineContent
	, endPromises
	, customCreator
	, customAction

} from './../lib/creators';
import {fromJS, Map, OrderedMap, Is, List, Seq} from 'immutable';
import Promise from 'bluebird';
import jsdom from 'jsdom';
import nock from 'nock';

const responseObject = {
                  id: 1
                 }

nock('http://localhost:2000')
                .post('/tests')
                .reply(200, responseObject);

nock('http://localhost:2000')
                .post('/tests_error')
                .reply(200, {errors: 'Something went wrong'});


const dispatchList = []
const batchDispatch = ()=>{}

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
	it('customAction', ()=>{
		function fn(){
			return false
		}
		expect(customAction('reducer', fn)).to.eql({
			fn,
			type: 'reducer',
			verb: 'CUSTOM'
		})
	})
	it('customCreator', ()=>{
		function fn(){
			return false
		}
		function dispatch(action){
			return action
		}
		expect(customCreator('reducer', fn)(dispatch)).to.eql({
			fn,
			type: 'reducer',
			verb: 'CUSTOM'
		})
	})
	
	describe('create', ()=>{
		
		it('success', (done)=>{
			const content = Map({test: 'testValue'});
			const path = '/tests'
			function dispatch(action){
				expect(action.verb).to.equal('CREATE');
				expect(action.type).to.equal('test');
				expect(action.content.get('test')).to.equal('testValue');
				expect(action.response.id).to.equal(responseObject.id);
				expect(action.tree).to.equal(args.get('tree'));
				return done();
			}
			
			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				outTree: tree,
				dispatch,
				dispatchList,
				batchDispatch
			})
			
			create(args);
		});
		it('success parent', (done)=>{
			const content = Map({test: 'testValue'});
			const path = '/tests'
			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				outTree: tree,
				parent: tree.shift().unshift('parents'),
				dispatch,
				dispatchList,
				batchDispatch
			})
			function dispatch(action){
				expect(action.verb).to.equal('CREATE');
				expect(action.type).to.equal('test');
				expect(action.content.get('test')).to.equal('testValue');
				expect(action.response.id).to.equal(responseObject.id);
				expect(action.tree).to.equal(args.get('tree'));
				expect(action.parent).to.equal(args.get('tree').shift().unshift('parents'));
				return done();
			}
			create(args);
		});
		
		it('dispatches createError', (done)=>{
			const content = Map({test: 'testValue'});
			const path = '/tests_error'
			function dispatch(action){
				expect(action.verb).to.equal('CREATE_ERROR');
				expect(action.type).to.equal('test');
				expect(action.content.get('test')).to.equal('testValue');
				expect(action.response.errors).to.equal('Something went wrong');
				return done();
			}
			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				outTree: tree,
				dispatch,
				dispatchList,
				batchDispatch
			})
			
			create(args);
		});
	})
	describe('coreGet', ()=>{
		
        beforeEach(()=>{
        	nock('http://localhost:2000')
                .get('/tests_error')
                .reply(200, {errors: 'Something went wrong'});
        
        	nock('http://localhost:2000')
                .get('/tests')
                .reply(200, [responseObject]);
        })
        

		it('dispatches Set Index', (done)=>{			
			const state = {test: Map()}
			function getState(){
				return state;
			}
			function dispatch(action){
				if(action.verb == 'INDEX'){
					return true
				}
				expect(action.verb).to.equal('SET_GET');
				expect(action.type).to.equal('test');
				expect(action.tree).to.equal(List(['testsTWRIndex']));
			}
			const path = '/tests'
			const args = Map({
				form,
				tree,
				reducer,
				path,
				getState,
				dispatch,
				batchDispatch,
				dispatchList
			})
			
			coreGET(args, 'index').then(()=>{
				return done();
			});
		});
		it('dispatches error', (done)=>{

			const content = Map({test: 'testValue'});
			const path = '/tests_error'
			const state = {test: Map()}
			function getState(){
				return state;
			}
			
			function dispatch(action){
				if(action.verb == 'SET_GET'){
					return action;	
				}
				expect(action.verb).to.equal('CREATE_ERROR');
				expect(action.type).to.equal('test');
				expect(action.tree).to.equal(args.get('tree'));
				expect(action.content).to.equal(content);
			}

			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				getState,
				dispatch,
				batchDispatch,
				dispatchList
			})
			
			coreGET(args, 'index').then(()=>{
				return done();
			});
		});
		it('dispatches Index', (done)=>{
			const state = {test: Map()}
			function getState(){
				return state;
			}
			
			function dispatch(action){
				if(action.verb == 'SET_GET'){
					return action;	
				}
				expect(action.verb).to.equal('INDEX');
				expect(action.type).to.equal('test');
				expect(action.tree).to.equal(args.get('tree'));
			}
			const content = Map({test: 'testValue'});
			const path = '/tests'
			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				getState,
				dispatch,
				batchDispatch,
				dispatchList
			})
			
			coreGET(args, 'index').then(()=>{
				return done();
			});
		});
		it('returns true if get already set', ()=>{

			const state = {test: Map({testsTWRIndex: 'true'})}
			function getState(){
				return state;
			}
			function dispatch(action){
				return action;
			}
			const content = Map({test: 'testValue'});
			const path = '/tests'
			const args = Map({
				form,
				tree,
				reducer,
				content,
				path,
				getState,
				dispatch,
				batchDispatch,
				dispatchList
			})

			expect(coreGET(args, 'index')).to.be.truth;
		});
	})
});