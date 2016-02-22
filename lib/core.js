import {Seq, fromJS, OrderedMap, List, Map} from 'immutable';

export function transformResponse(js, tree){
	if(typeof js !== 'object' || js === null){
		return js;
	}else{
		if(Array.isArray(js)){
			return convertArrayToOrderedMap(js, transformResponse, tree);
		}else{
			return transformObject(js, tree);
		}
	}
}

export function transformObject(js, tree){
	if(js.id){
		const newTree = List(tree).push(js.id.toString());
		return Seq(js).mapEntries(([k, v]) => {
			return [k, transformResponse(v, newTree.push(k))]
		}).toMap().merge({tree});
	}else{
		return Map(js);
	}
}

export function convertArrayToOrderedMap(array, fn, tree){
	return Seq(array).toKeyedSeq().mapEntries(([k, v]) =>
	 {
	 	if(v.id){
	 		return [v.id.toString(), fn(v, tree)]	
	 	}else{
	 		return [v, fn(v, tree)]	
	 	}
	 	
	 }).toOrderedMap();
}


export function fromJSOrdered(js) {
	return typeof js !== 'object' || js === null ? js : 
	Array.isArray(js) ? convertArrayToOrderedMap(js, fromJSOrdered): 
	Seq(js).map(fromJSOrdered).toMap();
}

export function index(state, tree, response){
	const ListTree = List(tree);
	return setMaps(state, ListTree).mergeIn(ListTree, transformResponse(response, tree));
}

export function show(state, tree, response){
	const ListTree = List(tree);
	return setMaps(state, ListTree).mergeIn(ListTree, transformResponse(response, tree));
}


export function substateCreate(state, tree, content){
	const ListTreeWithId = List(tree).unshift('Substate').push(content.id.toString());
	return setMaps(state, ListTreeWithId)
	.setIn(ListTreeWithId
		, Map(content).merge({tree: List(tree)})
	);
}

export function create(state, tree, content, response, postContent){
	const cleanedSubstate = cleanSubstate(state, content, tree);
	const ListTreeWithId = tree.push(response.id.toString());
	return setMaps(cleanedSubstate, ListTreeWithId)
	.setIn(ListTreeWithId, transformResponse(response, tree).merge(postContent));
}

export function cleanSubstate(state, content, ListTree, postContent){
	const SubstateListTree = ListTree.unshift('Substate').push(
		content.id.toString()
	);
	const cloneElement = state.getIn(SubstateListTree);
	const cleanCloneElement = cloneElement.toSeq().mapEntries(([k,v])=>{
		if(k == 'tree' || k == 'id'){
			return [k, v];	
		}else{
			return [k, ''];
		}
	}).toMap();
	return state.setIn(SubstateListTree, cleanCloneElement.merge(postContent));
}


export function createError(state, tree, content, response, postContent){
	return state.mergeIn(tree.unshift('Substate').push(content.id.toString()), response);
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
	const ListTree = List(tree);
	const ListTreeWithId = ListTree.push(content.id.toString());
	return setMaps(state, ListTreeWithId)
	.mergeIn(ListTreeWithId, Map(content).merge(response));
	
}

export function destroy(state, tree, id){
	const ListTree = List(tree);
	const ListTreeWithId = ListTree.push(id.toString());
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