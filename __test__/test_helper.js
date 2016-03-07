import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import jsdom from 'jsdom';
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = {userAgent: 'node.js'};
chai.use(chaiImmutable);

