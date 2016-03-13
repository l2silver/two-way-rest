import {findDOMNode} from 'react-dom'
import {List} from 'immutable';
import { push } from 'react-router-redux'

export function triggerSubmit(form){
	findDOMNode(form).dispatchEvent(new Event('submit'));
}

export function mapIf(immutableObject, fn, False){
	if(immutableObject){
		return immutableObject.toSeq().map(fn);
	}
	return False
}

export function getTree(start, popNot){
	const fullUrl = List(window.location.href.split('/'))
	const index = fullUrl.indexOf(start);
	const url = fullUrl.slice(index)
	if(popNot){
		return url;	
	}
	return url.pop();	
}

export function getInstance(url, page){
	const Listurl = List(url)
	if(page.getIn(Listurl.push('tree'))){
		return page.getIn(List(url));	
	}
	return false;
}

export function checkIndex(tree){
	return tree.pop().push(tree.last()+'TWRIndex');
}

export function checkShow(tree){
	return tree.push('TWRShow');
}

export function goToAfter(args, rest){
	args.get('dispatch')(push(args.get('reducer')+args.get('path')+'/'+args.get('response').id+rest));
}
