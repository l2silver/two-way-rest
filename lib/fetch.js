import 'isomorphic-fetch';
import methods from 'methods';

methods.forEach(function(method){
  exports[method] = function (path, body=false) {
    const url = 'http://localhost:8000';
    return fetch(
    	url + path, 
    	fetchObject(method, body))
    .then(
    	res => res.json()
    );
  }
});
export function fetchObject(method, body){
	switch(method){
    case 'get':
      return {method}
    case 'put':
      console.log('PUT REQUEST');
      return {method: 'POST', body, headers: {
        'X-HTTP-Method-Override': 'PUT'
      }}
  }
  console.log('POST');
  return {method, body}
}