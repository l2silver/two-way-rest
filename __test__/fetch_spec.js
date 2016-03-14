import {expect} from 'chai';
import {setAddress} from './../lib/fetch';
setAddress('http://localhost:2000');
import {get, put, post, des, up} from './../lib/fetch';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import nock from 'nock';
import FormData from 'form-data'

const url = 'http://localhost:2000';
const user = {id: '1'}

nock(url)
  .get('/users')
  .reply(200, user);

nock(url)
  .put('/users/1')
  .reply(200, user);

nock(url)
  .delete('/users/1')
  .reply(200, user);

nock(url)
  .post('/users')
  .reply(200, user);

nock(url)
  .post('/users/upload')
  .reply(200, user);

describe('fetch', ()=>{
	it('get', (done)=>{
		get('/users').then((body)=>{
			expect(body.id).to.equal('1');
			return done();
		});
	});
	it('put', (done)=>{
		put('/users/1', {name: 'lyrist'}).then((body)=>{
			expect(body.id).to.equal('1');
			return done();
		});
	});
	it('destroy', (done)=>{
		des('/users/1').then((body)=>{
			expect(body.id).to.equal('1');
			return done();
		});
	});
	it('post', (done)=>{
		post('/users', {name: 'lyrist'}).then((body)=>{
			expect(body.id).to.equal('1');
			return done();
		});
	});
	it('up', (done)=>{
		up('/users/upload', new FormData()).then((body)=>{
			expect(body.id).to.equal('1');
			return done();
		});
	});
});