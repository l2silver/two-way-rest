import {Seq, fromJS, OrderedMap, List, Map} from 'immutable';
import {checkIndex, checkShow} from './componentHelpers';


export function checkTWREntries(_globe, _firstInstance, _tree){
	const _lastInstance = _tree.reduce((_previousInstance, _entry, _index, array)=>{
		const _instanceTWR = _previousInstance.get(_entry+'TWR');
		if(_instanceTWR){
			if(List.isList(_instanceTWR)){
				const orderedMap = _instanceTWR.reduce((orderedMap, id)=>{
					const newOrderedMap = orderedMap.set(id.toString(), _globe.getIn([_entry.toString(), id.toString()]));
					return newOrderedMap;
				}, OrderedMap())
				return orderedMap;
			}
			return _globe.getIn([_entry.pluralize.toString(), _instanceTWR.toString()]);
		}
		return _previousInstance.get(_entry.toString());
	}, _firstInstance)
	if(Map.isMap(_lastInstance) || OrderedMap.isOrderedMap(_lastInstance)){
		return _lastInstance.set('_globeTWR', _globe);	
	}
	return _lastInstance;
}

Map.prototype.gex = function(k, notSetValue) {
  const _root = this._root;
  const _globe = _root.get(0, undefined, '_globeTWR', notSetValue)
  const _tree = List(k);
  

  if(_globe){
  	return checkTWREntries(_globe, this, k);
  }
  throw '_globeTWR must be defined'
};

export function orderedMap(children){
			return children.reduce((orderedMap, child)=>{
				return orderedMap.set(child.id.toString(), child);
			}, OrderedMap())
		}

export function idArray(children){
	return children.reduce((list, child)=>{
		return list.push(child.id.toString());
	}, List())
}

export function createMapObject(k, js, tree){
	if(k == 'tree'){
		return Map({
						  tree: true
						, thisTree: tree.push(k)
						, thisObject: js
					})
	}
	if(typeof js === 'object'){
		if(Array.isArray(js)){
			if(js[0]){
				if(js[0].id){
					return Map({
						  thisTree: tree.push(k+'TWR')
						, nextTree: List([k])
						, deleteTree: tree.push(k)
						, nextObject: orderedMap(js)
						, thisObject: idArray(js)
					})
				}
			}
		}
		if(js.id){
			if(k != js.id){
				return Map({
					  thisTree: tree.push(k + 'TWR')
					, nextTree: List([k.pluralize])
					, deleteTree: tree.push(k)
					, nextObject: orderedMap([js])
					, thisObject: js.id.toString()
				})
			}
		}
	}
	return Map({
				  thisTree: tree.push(k)
				, thisObject: js
				, nextTree: tree.push(k)
				, nextObject: js
			})
}
export function mapState(js, tree, globe = Map()){
	if(typeof js !== 'object' || js === null){
		return globe.setIn(tree, js);
	}
	if(Array.isArray(js)){
		if(js[0] && js[0].id){
			return addToGLobe(orderedMap(js), tree, globe);
		}
	}
	try{
		if(Map.isMap(js)){
			return addToGLobe(js.merge({tree}), tree, globe);
		}
		return addToGLobe(Map(js).merge({tree}), tree, globe);	
	}catch(e){
		console.log('in error', js, tree)
		throw e
	}
	
}

export function addToGLobe(js, tree, globe){
	return Seq(js).toKeyedSeq().mapEntries(([k, v]) => {
		return [k, 
		createMapObject(k, v, tree)
		]
	}).reduce((globes, mapObject)=>{
		if(mapObject.get('tree')){
			if(mapObject.get('thisTree').size > 2){
				const objectToAddTree = globes.getIn(mapObject.get('thisTree').pop())
				if(objectToAddTree && objectToAddTree.get('id')){
					return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));		
				}
				
			}
			return globes
			
		}
		const random = Math.floor((Math.random() * 100) + 1);
		const initialGlobe = globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));
		const nextGlobe = addTreeToObject(mapObject, initialGlobe);
		return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), globes));
	}
	, globe);
}

export function addTreeToObject(mapObject, globes){
	if(typeof mapObject.get('thisObject') == 'object' && !Array.isArray(mapObject.get('thisObject')) && !List.isList(mapObject.get('thisObject')) && !OrderedMap.isOrderedMap(mapObject.get('thisObject'))  ){

		if( Map.isMap(mapObject.get('thisObject')) ){
			if(mapObject.get('thisObject').get('id')){
				return globes.mergeIn(mapObject.get('thisTree'), {tree: mapObject.get('thisTree')});	
			}
		}else{
			if(mapObject.get('thisObject').id){
				return globes.setIn(mapObject.get('thisTree'), Map(mapObject.get('thisObject')).merge({tree: mapObject.get('thisTree')}));	
			}
			
		}
		
	}
	return globes
}

/*
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
		}).toMap().merge({tree: newTree});
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
*/

export function setGet(state, tree){
	return mapState(true, tree, state)
}

export function setShow(state, tree){
	const ListTree = List(tree);
	return setMaps(state, ListTree)
	.setIn(
		checkShow(
			ListTree
		)
		, true
	);
}

export function index(state, tree, response){
	return mapState(response, tree, state);
	
}

export function show(state, tree, response){
	return mapState(response, tree, state);
}

export function substateCreate(state, tree, content = Map()){
	return state.set(
		'Substate'
		, mapState(
			Map(content)
			, tree
			, state.get('Substate')
		)
	)
}

export function substateDelete(state, tree, content){
	const ListTreeWithId = tree;
	return setMaps(state, ListTreeWithId).deleteIn(ListTreeWithId);
}

export function cleanSubstate(state, tree){
	console.log('Cleantree', tree.toJS())
	const cloneElement = state.getIn(tree);
	const cleanCloneElement = cloneElement.toSeq().mapEntries(([k,v])=>{
		if(k == 'tree' || k == 'id'){
			return [k, v];	
		}else{
			return [k, ''];
		}
	}).toMap();
	return state.setIn(tree, cleanCloneElement);
}

export function create(state, tree, content = Map(), response = {}, outTree, parent){
	const precleanedSubstate = state.get('Substate');
	const Substate = cleanSubstate(precleanedSubstate, tree);
	const liveGlobe = state.set('Substate', Substate);
	const nextState = mapState(content.merge(response), outTree, liveGlobe)
	if(parent){
		const childName = tree.first() + 'TWR';
		const childId = outTree.last().toString()
		const parentRelations = nextState.getIn(parent).get(childName);
		if(parentRelations){
			return nextState.setIn(parent.push(childName), List([childId]))
		}
		return nextState.updateIn(parent.push(childName), children => children.push(childId))
	}
	return nextState;
}

export function update(state, tree, content = Map(), response = {}, outTree){
	const precleanedSubstate = state.get('Substate');
	const Substate = cleanSubstate(precleanedSubstate, tree);
	const liveGlobe = state.set('Substate', Substate);
	return mapState(content.merge(response), outTree, liveGlobe)
}

export function destroy(state, tree, outTree){
	const preDeleteLiveState = state.get('LiveState');
	const precleanedSubstate = state.get('Substate');
	const Substate = cleanSubstate(precleanedSubstate, tree);
	return state.deleteIn(outTree).set('Substate', Substate)
}

export function createError(state, tree, content = Map(), response = {}){
	const Substate = state.get('Substate');
	const mergedContent = content.merge(response);
	return state.set('Substate', mapState(mergedContent, tree, Substate))
}

export function updateFront(state, tree, content, response = {}){
	const ListTree = tree;
	return setMaps(state, ListTree)
	.mergeDeepIn(
		ListTree
		, Map(content)
		.merge(response)
	);	
}


