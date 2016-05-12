import {findDOMNode} from 'react-dom'
import {List, Map} from 'immutable';
import { push } from 'react-router-redux'
import inflect from 'i';
inflect(true);


export function customAction(args, fn){
	args.get('dispatch')(args.get('twr').customAction(fn));
}

export function triggerEvent(form, event = 'submit'){
	findDOMNode(form).dispatchEvent(new Event(event));
}

export function triggerSubmit(form, event = 'submit'){
	triggerEvent(form);
}

export function createId(){
	return new Date().getTime() +''+ Math.random().toString().slice(3);
}
export function reverseTree(tree, changeLast){
	const mapTree = tree.reverse().reduce((object, branch)=>{
		if(isNaN(branch)){
			const processedBranch = checkBranch(branch, changeLast);
			return object.update('tree', tree=>tree.push(processedBranch.pluralize).push(object.get('lastId')))
		}
		return object.set('lastId', branch);
	}, Map({tree: List()}))
	return mapTree.get('tree');
}

export function checkBranch(branch, changeLast){
	if(branch == changeLast){
		return List(branch.split('_')).pop().join('_');
	}
	return branch;
}

export function mapIf(immutableObject, fn, False){
	try{
		if(immutableObject){
			if(immutableObject.get){
				const _globeTWR = immutableObject.get('_globeTWR');
				if(!_globeTWR){
					if(immutableObject.size > 0){
						return immutableObject.valueSeq().map(fn);
					}
					return False
				}
				return immutableObject.toSeq().filterNot((v, k) => k == '_globeTWR').map(v=>{
					if(v.get && v.get('id')){
						return v.set('_globeTWR', _globeTWR)
					}
					return v
				}).map(fn);
			}
			if(Array.isArray(immutableObject) && immutableObject.length > 0){
				return immutableObject.map(fn);
			}
		}
		return False	
	}catch(e){
		console.log('mapIF error', e)
	}
	
}

export function getTreeStart(start, popNot){
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

export function indexCheck(tree){
	return tree.pop().push(tree.last()+'TWRIndex');
}

export function showCheck(tree){
	return tree.push('TWRShow');
}

export function goToAfter(args, rest){
	args.get('dispatch')(push(args.get('reducer')+args.get('path')+'/'+args.get('response').id+(rest ? rest: '')));
}
export function goToParentAfter(args, rest){
	args.get('dispatch')(push(args.get('reducer')+List(args.get('path').split('/')).pop().pop().join('/')+(rest ? rest: '') ));
}



