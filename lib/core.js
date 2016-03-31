import {Seq, fromJS, OrderedMap, List, Map} from 'immutable';
import {checkIndex, checkShow} from './componentHelpers';

export function createTree(k){
	if(Array.isArray(k)){
		return List(k)
	}
	return List([k])
}

export function checkTWREntries(_globe, _firstInstance, _tree){
	
	const _lastInstance = _tree.reduce((_previousInstance, _entry, _index, array)=>{
		if(_previousInstance){
			const _instanceTWR = _previousInstance.get(_entry+'TWR');
			if(_instanceTWR){
				if(List.isList(_instanceTWR)){
					const orderedMap = _instanceTWR.reduce((orderedMap, id)=>{
						const _globeInstance = _globe.getIn([_entry.toString(), id.toString()]);
						if(_globeInstance){
							return orderedMap.set(id.toString(), _globeInstance.set('_globeTWR', _globe));	
						}
						return orderedMap;
					}, OrderedMap())
					return orderedMap;
				}
				const _globeInstance = _globe.getIn([_entry.pluralize.toString(), _instanceTWR.toString()]);
				if(_globeInstance){
					return _globeInstance.set('_globeTWR', _globe);	
				}
				return undefined
			}
			return _previousInstance.get(_entry.toString());
		}
		return _previousInstance
	}, _firstInstance)
	return _lastInstance;
}

Map.prototype.gex = function(k, notSetValue) {
  const _root = this._root;
  const _globe = _root.get(0, undefined, '_globeTWR', notSetValue)
  const _tree = createTree(k);
  if(_globe){
  	return checkTWREntries(_globe, this, _tree);
  }
  const _firstInstance =  _root.get(0, undefined, _tree.first(), notSetValue);
  if(_firstInstance && _firstInstance.get){
  	const _foundGlobe = _firstInstance.get('_globeTWR');
  	if( _foundGlobe ){
  		return checkTWREntries(_foundGlobe, this, _tree);
  	}	
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
	const random = Math.floor((Math.random() * 100) + 1);
	try{
		if(k == 'tree'){
			return Map({
							  tree: true
							, thisTree: tree.push(k)
							, thisObject: js
						})
		}
		if(js && typeof js === 'object'){
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
	}catch(e){
		console.log(random, 'mapOBJECT error', e)
		console.log('mapOBJECT js', js)
		console.log('mapOBJECT k', k)
	}
	
}
export function mapState(js, tree, globe = Map()){
	
	//console.log('mapState js', js)
	if(typeof js !== 'object' || js === null){
		return globe.setIn(tree, js);
	}
	if(Array.isArray(js)){
		if(js[0]){
			if(js[0].id){
				return addToGLobe(orderedMap(js), tree, globe);
			}
		}
		return addToGLobe(js, tree, globe);	
	}
	try{
		if(Map.isMap(js)){
			return addToGLobe(js.merge({tree}), tree, globe);
		}
		return addToGLobe(Map(js).merge({tree}), tree, globe);	
	}catch(e){
		console.log('in error')
		console.log('js', js)
		console.log('tree', tree.toJS())
		console.log(e)
		throw e
	}
	
}

export function addToGLobe(js, tree, globe){
	try{

		return Seq(js).toKeyedSeq().mapEntries(([k, v]) => {
			return [k, 
			createMapObject(k, v, tree)
			]
		}).reduce((globes, mapObject)=>{
			try{
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
				if(mapObject.get('thisObject')){
					const nextGlobe = addTreeToObject(mapObject, initialGlobe);
					return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), globes));	
				}
				return initialGlobe
			}catch(e){
				console.log('error in addToGLobe', e, e.lineNumber)
			}
			
		}
		, globe);

	}catch(e){
		console.log('addToGLobeFull', e)
	}
	
}

export function addTreeToObject(mapObject, globes){
	try{
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

	}catch(e){
		console.log("ERROR IN addTreeToObject", e)
	}

}

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
		const nextState = mapState(content.merge(Map(response)), outTree, liveGlobe)
		if(parent){
			const childName = tree.first() + 'TWR';
			const childId = outTree.last().toString();
			console.log('parent', parent.toJS(), state.toJS())
			const parentRelations = nextState.getIn(parent).get(childName);
			if(parentRelations){
				return nextState.updateIn(parent.push(childName), children => children.push(childId))	
			}
			return nextState.setIn(parent.push(childName), List([childId]))

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
	console.log('outTree', outTree.toJS())
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


