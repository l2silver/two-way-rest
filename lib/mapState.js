import {Seq, fromJS, OrderedMap, List, Map, is} from 'immutable';

function gexTable(table){
		if(Array.isArray(table)){
			return table
		}
		return [table];
}
function gexFirstInstance(instance){
	if(instance){
		return instance
	}
	return 'none'
}

export function gex(state, table, instance){	
	const _table = gexTable(table);
	const _firstInstance = gexFirstInstance(instance);
	try{

		const _lastInstance = _table.reduce((_previousInstance, _entry, _index)=>{
			if(_previousInstance === 'none'){
				return state.get(_entry);
			}
			if(_previousInstance ){
				const _instanceTWR = _previousInstance.get(_entry+'TWR');
				
				if(_instanceTWR){
					const pluralEntry = _entry.pluralize.toString();
					if(List.isList(_instanceTWR)){
						const orderedMap = _instanceTWR.reduce(function(orderedMap, id){
							const _globeInstance = state.getIn([_entry.toString(), id.toString()]);
							if(_globeInstance && !_globeInstance.get('deleted_at')){
								return orderedMap.set(id.toString(), 
									_globeInstance
								);
							}
							return orderedMap;
						} , OrderedMap() )
						return orderedMap;
					}
					const _globeInstance = state.getIn([pluralEntry, _instanceTWR.toString()]);
					if(_globeInstance){
						return _globeInstance;
					}
					return undefined
				}
				const _nextInstance = _previousInstance.get(_entry.toString());
				return _nextInstance
			}
			return _previousInstance
		}, _firstInstance)
		return _lastInstance;
	}catch(e){
		console.log('GEX ERROR', e)
		throw e
	}
	
}

export function createTree(k){
	if(Array.isArray(k)){
		return List(k)
	}
	return List([k])
}

export function createOrderedMap(children){
			try{
				const orderedMap =  children.reduce((orderedMap, child)=>{
					return orderedMap.set(child.get('id').toString(), child);
				}, OrderedMap())
				return orderedMap;
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

export function mergeWithoutList(prev, next){
	if(prev && typeof prev == 'object'){
		if(List.isList(prev)){
			return next
		}else{
			return prev.mergeWith(mergeWithoutList, next)
		}
	}
	return next
}

export function wrapMapState(js, tree, globe = Map()){
	const startTime = new Date().getTime();
	const startGlobe = Map().asMutable();
	mapState(Map.isMap(js) || List.isList(js) ? js : fromJS(js), tree, startGlobe);
	//console.log('mapStateTime', new Date().getTime() - startTime);
	return globe.mergeWith(mergeWithoutList, startGlobe.asImmutable());
	//return globe.mergeDeep(startGlobe.asImmutable());
}

export function checklistWithId(js){
	return List.isList(js) && js.first() && js.first().get && js.first().get('id')
}

export function mapState(js, tree, globe = Map()){
	try{
		if(typeof js !== 'object' || js === null){
			return true
			return globe.setIn(tree, js);
		}
		if( checklistWithId(js) ){
			
			const orderedMap = createOrderedMap(js) 
			
			return addToGLobe(orderedMap, tree, globe);	
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
			if(!mapObject.skip){
				try{
					createInitialGlobe(globe, mapObject);
					createNextGlobe(globe, mapObject);
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
	try{
		if(k == 'tree'){
			return {
					skip: true		  
					}
		}
		if(js && typeof js === 'object'){
			if(checklistWithId(js)){
				return {
					  thisTree: tree.push(k+'TWR')
					, nextTree: List([k])
					, nextObject: createOrderedMap(js)
					, thisObject: idArray(js)
				}
			}
			if(js.get('id')){
				if(k != js.get('id')){
					return {
						  thisTree: tree.push(k + 'TWR')
						, nextTree: List([k.pluralize])
						, nextObject: createOrderedMap(List([js]))
						, thisObject: js.get('id').toString()
					}
				}
			}
		}
		const nextTree = tree.push(k)
		return {
					  thisTree: nextTree
					, thisObject: js
					, nextTree: nextTree
					, nextObject: js
				}
	}catch(e){
		console.log('mapOBJECT error', e)
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
		const initialGlobe = globes.setIn(mapObject.thisTree, mapObject.thisObject );
	}catch(e){
		console.log('create initialGlobe error', e, mapObject, globes.toJS() )
	}
	
}
export function createNextGlobe(globe, mapObject){
	try{
		
		if(mapObject.nextObject){
			if(mapObject.thisObject){
				if(globe){
					mapState(mapObject.nextObject, mapObject.nextTree, globe);
				}
			}	
		}
	}catch(e){
		console.log('Create Next Globe Error', e)
		console.log('Create Next Globe Error', mapObject)
		console.log('Create Next Globe Error', initialGlobe)
	}	
}