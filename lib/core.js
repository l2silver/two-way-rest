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
	return setMaps(state, ListTree).mergeIn(ListTree, transformResponse(response));
}

export function show(state, tree, response){
	const ListTree = List(tree);
	return setMaps(state, ListTree).mergeIn(ListTree, transformResponse(response));
}

/* 

We have one general issue with create, and that's the nature of failure. If you try and create, and you fail, where does that lead you? Furthermore, how can someone get the error information from an instance they're not even sure was created.

So, the process has to be such.

When you create, you create a substate instance first. 

If that substate instance is successful, then we create a real instance, and destroy the substate instance.

So, suppose someone said they want to create a form here, to create items. If they were to click and it was a success, we would simply add that create to the page.

However, if there was a failure, how would the user register that failure. They could do so by implementing a map, and creating the fake instances before they ever truly exist. Sort of like we index the page, we could index the create.

Is that the only solution that makes sense. Again, what if there is an error when creating a child of a parent. 

We need to create and bind. All creates need to be bound to what they are creating.


A separate create for substate create.







*/




export function substateCreate(state, tree, content){
	const ListTreeWithId = List(tree).push(content.id.toString());
	return setMaps(state, ListTreeWithId)
	.setIn(ListTreeWithId
		, Map(content).merge({tree: List(tree)})
	);
}

export function create(state, tree, content, response){
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
	console.log('ListTreeWID', ListTreeWithId.toJS())
	return setMaps(state, ListTreeWithId)
	.mergeIn(ListTreeWithId, Map(content).merge(response));
	
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