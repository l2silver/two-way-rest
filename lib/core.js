import {Seq, fromJS, OrderedMap, List, Map, is} from 'immutable';
import {checkIndex, checkShow} from './componentHelpers';
import {wrapMapState} from './mapState'

export function custom(state, fn){
	return fn(state);
}


export function setGet(state, tree){
	const nextState = wrapMapState({[tree.last()]: true}, tree.pop(), state)
	return nextState;
}

export function index(state, tree, response){
	return wrapMapState(response, tree, state);
	
}

export function show(state, tree, response){
	try{
		return wrapMapState(response, tree, state);	
	}catch(e){
		console.log('show error', e)
	}
	
}

export function substateCreate(state = Map(), tree, content = Map()){
	return state.set(
		'Substate'
		, wrapMapState(
			Map(content)
			, tree
			, state.get('Substate')
		)
	)
}

export function substateDelete(state = Map(), tree, content){
	return state.deleteIn(tree.unshift('Substate'))
}

export function createCleanCloneElement(cloneElement){
	if(cloneElement){
		return cloneElement.toSeq().mapEntries(([k,v])=>{
			if(k == 'tree' || k == 'id'){
				return [k, v];	
			}else{
				return [k, ''];
			}
		}).toMap();	
	}
	return Map();
	
}

export function cleanSubstate(state = Map(), tree, lastCreatedId){
	try{
		const cloneElement = state.getIn(tree)
		const cleanCloneElement = createCleanCloneElement(cloneElement);
		if(lastCreatedId){
			return state.setIn(tree, cleanCloneElement.set('lastCreatedId', lastCreatedId));	
		}
		return state.setIn(tree, cleanCloneElement);
	}catch(e){
		console.log('error in clean substate', e)
	}
	
}

export function create(state, tree, content = Map(), response = {}, outTree, parent){
	try{
		const precleanedSubstate = state.get('Substate');
		const Substate = cleanSubstate(precleanedSubstate, tree, response.id ? response.id : false);
		const liveGlobe = state.set('Substate', Substate);
		const nextState = wrapMapState(content.merge(fromJS(response)), outTree, liveGlobe)
		if(parent){
			const childName = tree.first() + 'TWR';
			const childId = outTree.last().toString();
			const parentRelations = nextState.getIn(parent).get(childName);
			if(parentRelations){
				return nextState.updateIn(parent.push(childName), children => children.push(childId))	
			}
			return nextState.setIn(parent.push(childName), List([childId]))

		}
		return nextState;
	}catch(e){
		console.log('CORE CREATE ERROR', e);
	}
		
	

	
}

export function update(state, tree, content = Map(), response = {}, outTree){
	const precleanedSubstate = state.get('Substate');
	const Substate = cleanSubstate(precleanedSubstate, tree);
	const liveGlobe = state.set('Substate', Substate);
	return wrapMapState(content.merge(response), outTree, liveGlobe)
}

export function destroy(state, tree, outTree){
	const precleanedSubstate = state.get('Substate');
	const Substate = cleanSubstate(precleanedSubstate, tree);
	return state.deleteIn(outTree).set('Substate', Substate)
}

export function createError(state, tree, content = Map(), response = {}){
	const Substate = state.get('Substate');
	const mergedContent = content.merge(response);
	return state.set('Substate', wrapMapState(mergedContent, tree, Substate))
}