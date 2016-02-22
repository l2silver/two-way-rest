import {expect} from 'chai';
import {get, put, post, destroy} from './../lib/fetch';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import nock from 'nock';

const url = 'http://localhost';
const user = {id: 'pgte'}

nock(url)
  .get('/users')
  .reply(200, user);

nock(url)
  .put('/users')
  .reply(200, user);

describe.only('fetch', ()=>{
	it('get', (done)=>{
		get('/users').then((body)=>{
			expect(body.id).to.equal('pgte');
			return done();
		});
	});
	it('put', (done)=>{
		put('/users').then((body)=>{
			expect(body.id).to.equal('pgte');
			return done();
		});
	});
});