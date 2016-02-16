import {Seq, fromJS, OrderedMap, List, Map} from 'immutable';

export function index(state, tree, response){
	const arraylessResponse = convertToArrayless(response, tree);
	const ListTree = List(tree);
	return setMaps(state, ListTree).setIn(ListTree, fromJSOrdered(response));
}

export function convertToArrayless(response){
	
}
function fromJSOrdered(js) {
  return typeof js !== 'object' || js === null ? js :
    Array.isArray(js) ? 
      Seq(js).map(fromJSOrdered).toOrderedMap() :
      Seq(js).map(fromJSOrdered).toOrderedMap();
}

export function create(state, tree, content, response){
	console.log('tree in create', tree, content, response);
	const ListTree = List(tree);
	const cleanedSubstate	= cleanSubstate(state, content, ListTree);
	const ListTreeWithoutSubstate = ListTree.shift();
	console.log('ListTreeWithoutSubstate', ListTreeWithoutSubstate.toJS());
	return setMaps(cleanedSubstate, ListTreeWithoutSubstate).setIn(
		ListTreeWithoutSubstate.push(response.id.toString())
		, Map(content).merge(response).merge({tree: ListTreeWithoutSubstate.toJS()})
	);
}

export function cleanSubstate(state, content, ListTree){
	if(content.id){
		const ListTreeWithSubstateId = ListTree.push(
			content.id.toString()
			);
		const newId = createId();
		const ListTreeWithNewSubstateId = ListTree.push(
			newId
			);
		const cloneElement = state.getIn(ListTreeWithSubstateId);
		const cloneElementBaseAttributes = Map({
			tree: cloneElement.get('tree')
			, reducer: cloneElement.get('reducer')
		})
		const stateWithCloneElement = state.setIn(
			ListTreeWithNewSubstateId, 
				Map()
				.merge(
					cloneElementBaseAttributes.set('id', newId)
				)
			)
		return stateWithCloneElement.deleteIn(ListTreeWithSubstateId);
	}
	return state;
}


export function createError(state, tree, content, response){
	const errorContent = createErrorContent(content, fromJS(response));
	const substateTree = List(tree).unshift('Substate').push(errorContent.get('id'));
	return setMaps(
		state
		, substateTree
	)
	.setIn(
		substateTree
		, errorContent
	);
}

export function createErrorContent(content, response){
	if(content.id){
		return Map(content).set('errors', response);
	}else{
		const id = createId();
		return Map(content).merge({
			id
			, errors: response
		});
	}
}

export function update(state, tree, content, response = {}){
	console.log('inUpdate');
	const ListTree = List(tree);
	const ListTreeWithId = ListTree.push(content.id);
	return setMaps(state, ListTreeWithId).mergeIn(ListTreeWithId, Map(content).merge(response));
}

export function destroy(state, tree, id){
	const ListTree = List(tree);
	const ListTreeWithId = ListTree.push(id);
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
}

export function setMaps(state, tree){
	const stateTree = tree.reduce((stateTree, tree)=>{
		const trees = stateTree.get('trees').push(tree);
		const state = stateTree.get('state');		
		const newState = checkTreeExists(state, trees, tree)
		return Map({
			  state: newState
			, trees
		})
		
	}, 
	Map({
		  state
		, trees: List()
		})
	);
	return stateTree.get('state');
}

export function checkTreeExists(state, trees, tree){
	if(state.hasIn(trees)){
			return state
	}else{
		if(isNaN(tree)){
			return state.setIn(trees, OrderedMap());
		}else{
			return state.setIn(trees, Map());
		}
	}
}

export function createId(){
	return Math.random().toString().slice(3);
}