/*
import requestCB from 'request';
import methods from 'methods';
import {promisifyAll} from 'bluebird';
const request = promisifyAll(requestCB);
import {address} from './index';
import index from './index';

const url = address ? address : 'http://localhost';

methods.map((method)=>{
  exports[method] = function (path, body=false) {
    return request[method+'Async'](
      requestObject(method, body, (url+path)))
    .then(
      (res, body) =>{
        if(res.statusCode == 200){
          return JSON.parse(res.body);
        }
        throw res;
      }
    );
  }
});

export function requestObject(method, body, url){
  switch(method){
    case 'get':
      return {url}
    case 'index':
      return {url}
    case 'destroy':
      return {url}
  }
  return {url, form: body}
}
*/