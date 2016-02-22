import {expect} from 'chai';
import {getContent} from './../lib/creators';
import {fromJS, Map, OrderedMap, List, Seq} from 'immutable';
import cheerio from 'cheerio';

const $ = cheerio.load('<form><input type="text" name="example" value="value" /><input type="text" name="example2" value="value" /></form>');

describe.only('creators', ()=>{
	it('getContent', ()=>{
		expect($('form').serializeArray()[1]).to.equal({example: 'value'});
	});
});