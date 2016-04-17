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

} from './../lib/creatorsHelpers';
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


describe('creatorsHelpers', ()=>{
	const document = jsdom.jsdom(`<form id="testForm">
		<input type="hidden" name="test" value="testValue" />
	</form>`);
	const dispatchList = []
	const batchDispatch = ()=>{}
	const form = document.getElementById('testForm');
	const reducer = 'test';
	const tree = List(['tests'])
	const content = Map({})
	const args = Map({
		form,
		tree,
		reducer,
		content,
		dispatchList,
		batchDispatch
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
	describe('getContent', ()=>{
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
	
	
	it('createsPromise', (done)=>{
		const args = Map();
		createEventTrain([args=>args])(args).then((args)=>{
			expect(args).to.equal(Map());
			return done();
		})
		
	})
	
	it('combineContent', ()=>{
		expect(combineContent(args)).to.equal(args.merge({
			formContent: Map({test: 'testValue'})
			, combinedContent: Map({test: 'testValue'})
			})
		)
	})

	describe('endPromises', ()=>{
		it('catches error', (done)=>{
			const combinedContent = Map();
			const nextArgs = args.merge({dispatch, combinedContent, type: 'create'})

			function dispatch(errorArgs){
				expect(errorArgs.verb).to.equal('CREATE_ERROR');
				return done();
			}
			endPromises(Promise.method((args)=>{
				throw args.set('response', {})
			})(nextArgs));
		})
		it('fire onFailureCB', (done)=>{
			const combinedContent = Map();
			function onErrorFn(errorArgs){
				expect(errorArgs.get('type')).to.equal('create');
				return errorArgs;
			}
			const nextArgs = args.merge({dispatch, combinedContent, type: 'create', onFailureCB: onErrorFn})

			function dispatch(errorArgs){
				return errorArgs;
			}
			endPromises(Promise.method((args)=>{
				throw args.set('response', {})
			})(nextArgs)).then(()=>{
				return done()
			});
		})
		it('fire callback', (done)=>{
			const combinedContent = Map();
			function callbackFn(cbargs){
				expect(cbargs.get('type')).to.equal('create');
				return cbargs;
			}
			const nextArgs = args.merge({dispatch, combinedContent, type: 'create', callback: callbackFn})

			function dispatch(errorArgs){
				return errorArgs;
			}
			endPromises(Promise.method((args)=>{
				throw args.set('response', {})
			})(nextArgs)).then(()=>{
				return done()
			});
		})	
	})
});