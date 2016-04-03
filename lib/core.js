import {Seq, fromJS, OrderedMap, List, Map} from 'immutable';
import {checkIndex, checkShow} from './componentHelpers';

export function custom(state, fn){
	return fn(state);
}



export function createTree(k){
	if(Array.isArray(k)){
		return List(k)
	}
	return List([k])
}



export function checkTWREntries(_globe, _firstInstance, _tree){
	const startTime = new Date().getTime()
	try{
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
	}catch(e){
		console.log('Error in checkTWREntries', e)
	}
	
}

Map.prototype.gex = function(k, notSetValue) {
  try{  		
	  const _globe = this.get('_globeTWR');
	  const _tree = createTree(k);
	  if(_globe){
	  	return checkTWREntries(_globe, this, _tree);
	  }
	  const _firstInstance =  this.get(_tree.first());
	  if(_firstInstance && _firstInstance.get){
	  	const _foundGlobe = _firstInstance.get('_globeTWR');
	  	if( _foundGlobe ){
	  		return checkTWREntries(_foundGlobe, this, _tree);
	  	}	
	  }
	  if(this.getIn(k)){
	  	return this.getIn(k);
	  }
	  
	  throw '_globeTWR must be defined'
	}catch(e){
		console.log('Error in Gex', e)
	}
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
							, nextObject: orderedMap(js)
							, thisObject: idArray(js)
						})
					}
				}
				return Map({
					  thisTree: tree.push(k)
					, thisObject: List(js)
					, nextObject: false
				})
			}
			if(js.id){
				if(k != js.id){
					return Map({
						  thisTree: tree.push(k + 'TWR')
						, nextTree: List([k.pluralize])
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

export function wrapMapState(js, tree, globe = Map()){
	const startTime = new Date().getTime();

	const nextState = mapState(js.toJS(), tree, Map().asMutable());
	console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeDeep(nextState.asImmutable());
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
		if(List.isList(js)){
			return addToGLobe(js, tree, globe)
		}
		if(Map.isMap(js)){
			return addToGLobe(js.merge({tree}), tree, globe);
		}
		return addToGLobe(Map(js).merge({tree}), tree, globe);	
	}catch(e){
		console.log('in error')
		console.log('js', js, js.toJS ? js.toJS() : 'not immutable')
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
			if(globes && !mapObject.get('skip')){
				try{
					try{
						if(mapObject.get('tree')){
							if(mapObject.get('thisTree').size > 2){
								const objectToAddTree = globes.getIn(mapObject.get('thisTree').pop())
								if(objectToAddTree && objectToAddTree.get && objectToAddTree.get('id')){
									return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));		
								}
								
							}
							return globes
							
						}
					}catch(e){
						console.log('error add to globe top', e)
					}
					try{
						var initialGlobe
						try{
							initialGlobe = globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));	
						}catch(e){
							console.log('error while creating initialGlobe', e, mapObject.toJS(), globes.toJS())
						}
						if(mapObject.get('nextObject')){
							try{
								if(mapObject.get('thisObject')){
									const nextGlobe = addTreeToObject(mapObject, initialGlobe);
									if(nextGlobe){
										return nextGlobe.mergeDeep(mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), globes));
									}
								}	
							}catch(e){
								console.log('error add to bottom next globe', e)
							}	
						}
						return initialGlobe
					}catch(e){
						console.log('error add to globe bttom', mapObject.toJS(), e)
					}
					
				}catch(e){
					console.log('error in addToGLobe', e, e.lineNumber)
				}
			}
			return globes
			
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
	return wrapMapState(true, tree, state)
}

export function index(state, tree, response){
	return wrapMapState(response, tree, state);
	
}

export function show(state, tree, response){
	return wrapMapState(response, tree, state);
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
	const Substate = state.get('Substate').deleteIn(tree);
	return state.set('Substate', Substate);
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
		const nextState = wrapMapState(content.merge(Map(response)), outTree, liveGlobe)
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


