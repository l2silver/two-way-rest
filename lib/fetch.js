import Promise from 'promise';
const request = require('superagent-promise')(require('superagent'), Promise);
import methods from 'methods';
import {promisifyAll} from 'bluebird';

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


export function setAddress(url){
  methods.map((method)=>{
    if(method == 'delete'){
      exports['del'] = function (path, body=false) {
        if(body){
          return request['del']((url+path))
          .send(body)
          .withCredentials()
          .then(
            (res) =>{
              if(res.statusCode == 200){
                return res.body;
              }
              throw res;
            }
          );  
        }else{
          return request['del']((url+path))
          .withCredentials()
          .then(
            (res) =>{
              if(res.statusCode == 200){
                return res.body;
              }
              throw res;
            }
          );  
        }
      }
    }else{
       exports[method] = function (path, body=false) {
        if(body){
          return request[method]((url+path))
          .withCredentials()
          .send(body)
          .then(
            (res) =>{
              if(res.statusCode == 200){
                return res.body;
              }
              throw res;
            }
          );  
        }else{
          return request[method]((url+path))
          .withCredentials()
          .then(
            (res) =>{
              if(res.statusCode == 200){
                return res.body;
              }
              throw res;
            }
          );  
        }
      } 
    }
  });
  exports['up'] =  function(address, formData, twr){
    return request
    .post((url+address))
    .send(formData)
    .withCredentials()
    .on('progress', function(e) {
      twr.setState( Object.assign({}, twr.state, {uploadProgress: e.percent}) );
      twr.forceUpdate();
      console.log('Percentage done: ', e.percent, twr.state);
    })
    .then((res) =>{
              if(res.statusCode == 200){
                return res.body;
              }
              throw res;
            }

    );
  }
  exports['productionUrl'] = url
}

