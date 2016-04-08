import {Seq, fromJS, OrderedMap, List, Map, is} from 'immutable';

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
					const pluralEntry = _entry.pluralize.toString();
					if(List.isList(_instanceTWR)){
						const orderedMap = _instanceTWR.reduce((orderedMap, id)=>{
							const _globeInstance = _globe.getIn([_entry.toString(), id.toString()]);
							if(_globeInstance && !_globeInstance.get('deleted_at')){
								return orderedMap.set(id.toString(), 
									_globeInstance.asMutable()
									.set('_globeTWR', _globe)
									.set('tree', List([pluralEntry, id.toString()])).asImmutable()
									);
							}
							return orderedMap;
						}, OrderedMap())
						return orderedMap;
					}
					const _globeInstance = _globe.getIn([pluralEntry, _instanceTWR.toString()]);
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
		throw e
	}
};

export function orderedMap(children){
			try{
				return children.reduce((orderedMap, child)=>{
					return orderedMap.set(child.get('id').toString(), child);
				}, OrderedMap())
			}catch(e){
				console.log('orderedMap error', e, children)
			}
			
		}

export function idArray(children){
	try{
		return children.reduce((list, child)=>{
			return list.push(child.get('id').toString());
		}, List())	
	}catch(e){
		console.log('idArray error', e, children)
	}
	
}



export function wrapMapState(js, tree, globe = Map()){
	const startTime = new Date().getTime();
	const nextState = mapState(Map.isMap(js) || List.isList(js) ? js : fromJS(js), tree, Map().asMutable());
	console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeDeep(nextState.asImmutable());
}

export function checklistWithId(js){
	return List.isList(js) && js.first() && js.first().get && js.first().get('id')
}


/*

What does the mapState function do.

It takes a regularJS object, converts it to an immutableObject, and changes relational data 

*/


export function mapState(js, tree, globe = Map()){
	try{
		if(typeof js !== 'object' || js === null){
			return globe.setIn(tree, js);
		}
		if( checklistWithId(js) ){
			return addToGLobe(orderedMap(js), tree, globe);	
		}	
		return addToGLobe(js, tree, globe);
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
					const initialGlobe = createInitialGlobe(globes, mapObject);
					return createNextGlobe(initialGlobe, mapObject);
				}catch(e){
					console.log('error in reduce addToGLobe', e, e.lineNumber)
				}
			}
			return globes
		}
		, globe);

	}catch(e){
		console.log('addToGLobe error', e)
	}	
}

export function createMapObject(k, js, tree){
	const random = Math.floor((Math.random() * 100) + 1);
	try{
		if(k == 'tree' || k == '_globeTWR'){
			return Map({
						skip: true		  
						})
		}
		if(js && typeof js === 'object'){
			if(checklistWithId(js)){
				return Map({
					  thisTree: tree.push(k+'TWR')
					, nextTree: List([k])
					, nextObject: orderedMap(js)
					, thisObject: idArray(js)
				})
			}
			if(js.get('id')){
				if(k != js.get('id')){
					return Map({
						  thisTree: tree.push(k + 'TWR')
						, nextTree: List([k.pluralize])
						, nextObject: orderedMap(List([js]))
						, thisObject: js.get('id').toString()
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

export function recursiveSetInitialObject(globe, mapObject){
	
		try{
			return globe.setIn(mapObject.get('thisTree'), mapObject.get('thisObject') );		
		}catch(e){
			return globe.mergeIn(mapObject.get('thisTree').pop(), {[mapObject.get('thisTree').last()]: mapObject.get('thisObject')})
		}
	
		
}

export function createInitialGlobe(globes, mapObject){
	try{
		if( is( globes.getIn( mapObject.get( 'thisTree' ) ), mapObject.get( 'thisObject' ) ) ){
			//console.log('equal?')
			return globes
		}
		const initialGlobe = recursiveSetInitialObject(globes, mapObject);
		//console.log('LOOKHERE', initialGlobe, mapObject);
		return initialGlobe;
		
		
	}catch(e){
		console.log('create initialGlobe error', e, mapObject.toJS(), globes.toJS(), globes.getIn( mapObject.get('thisTree') ) )
	}
	
}
export function createNextGlobe(initialGlobe, mapObject){
	try{
		//console.log('this fires last', mapObject)
		if(mapObject.get('nextObject')){
			if(mapObject.get('thisObject')){
				
				const nextGlobe = initialGlobe
				if(nextGlobe){
					const mergeWithGlobe = mapState(mapObject.get('nextObject'), mapObject.get('nextTree'), initialGlobe)
					if(mergeWithGlobe){
						try{
							return nextGlobe.mergeDeep(mergeWithGlobe);		
						}catch(e){
							return mergeWithGlobe.mergeDeep(nextGlobe);
						}
					}
				}
			}	
		}
		return initialGlobe
	}catch(e){
		console.log('Create Next Globe Error', e)
		console.log('Create Next Globe Error', mapObject)
		console.log('Create Next Globe Error', initialGlobe)
	}	
}

/*

export function mapState(js, tree, globe = Map()){
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
			return addToGLobe(js, tree, globe);
		}
		return addToGLobe(Map(js), tree, globe);	
	}catch(e){
		console.log('in error')
		console.log('js', js, js.toJS ? js.toJS() : 'not immutable')
		console.log('tree', tree.toJS())
		console.log(e)
		throw e
	}
	
}
*/

/*
export function treeObject(mapObject, globes){
	try{
		if(mapObject.get('thisTree').size > 2){
			const objectToAddTree = globes.getIn(mapObject.get('thisTree').pop())
			if(objectToAddTree && objectToAddTree.get && objectToAddTree.get('id')){
				return globes.setIn(mapObject.get('thisTree'), mapObject.get('thisObject'));		
			}
		}
		return globes
	}catch(e){
		console.log('treeObject error', e, mapObject.toJS())
	}
}
*/

/*
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

}*/