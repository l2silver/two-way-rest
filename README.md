# Two-Way-Rest

A lot of things, but more specifically a react-redux plugin that facilitates changes to the state and backend data sources.

Example:
```
<TWRCreate tree={[‘users’]}>
 <input type=’text’ name=’name’ />
 <input type=’submit’ />
</TWRCreate>
```
After submitting this magic ‘form’, if no errors are thrown, the state is updated with a new user, and the backend is updated with a new row (...or whatever).

Suppose that instead of creating a user, you wanted to update a user
```
<TWRUpdate instance={userInstance}>
	<input type=’text’ name=’name’ />
	<input type=’submit’ />
</TWRUpdate>
```
Again, if successful, the form updates both the frontend and the backend. 

*A user instance is simply a regular user object with a special tree property:*  
{id: 1, name: ‘Joe’, **tree: [‘users’, 1]**}

Suppose that instead of updating a user’s frontend and backend, you just wanted to update the frontend.

```
<TWRUpdateFront instance={userInstance}>
	<input type=’text’ name=’visible’ value=’true’ />
	<input type=’submit’ />
</TWRUpdateFront>
```
Now your frontend user has a new property(or updates an old property) called visible, and its value is true. 

## Motivation:

I'm from the trenches. I build relatively simple websites for small businesses, where the priority is stability and development speed. When I started working with redux, I loved the structure, but hated the steps. Something as simple as toggling a button meant changing the react component, the action creator and the reducer. This process also meant extracting the code away from the react components, which felt counter intuitive, since one of the advantages of react is the code being visible while constructing the DOM. I built two-way-rest to solve these issues.

## Setup:

##### Requirements: 
React  
Redux  
React-Redux  

Proper Setup Example.
```
import { createStore, combineReducers} from 'redux';
import rootReducer from './reducers/index';
const store = createStore(
	combineReducers(rootReducer)
);
ReactDOM.render(
  <Provider store={store}>
    <MyRootComponent />
  </Provider>,
  rootEl
)
```
*Although the two-way-rest plugin does not need the combineReducers function from redux, it does require the same state reducer format:*
```
fullState = {reducerName_1: reducerState_1, ...}
```


We also have to setup the address for backend ajax queries, and send it the store so we'll add this:
```
import {setAddress, setStore} from 'two-way-rest';
setAddress('http://remoteurl.com');
setStore(store);
```
#### Once the initial setup is complete, we’re free to do a little more setup…

In order for these special forms to work, we need to create a parent component to hold them.
```
<DeclareReducer reducer=’reducerName’>
{this.props.children}
</DeclareReducer>
```
DeclareReducer is setting up a reducer context property that all of its form children will have access to. Our magical forms need to know which reducer to use. (Although it’s perfectly alright to just use one reducer, as we’ll be using another tool to separate reduction code)

The last step is to merge our Two-Way-Rest reducer with any reducers that are going to invoke the Two-Way-Rest architecture.

*reducerName.js*
```
const normalReducerSwitch  = function(state, action){...};
const twoWayRestSwitch = generateRestSwitch('reducerName');
export default combineSwitches([normalReducerSwitch, twoWayRestSwitch]);

```
We need to make certain the state is an immutable map object, so the twoWayRestSwitch should always be last. The immutable library is an integral component of two-way-rest. 


# Inner Workings
### Frontend Relational Immutable Database
Two-way-rest is powered by a frontend pseudo-relational database called globe. Every reducer's state is a globe, and changes to the globe are generally made by passing it either an object, or an array of objects.

### Substate
Every globe has a Substate property which holds the intermittent state of an instance before it is either created, updated, or destroyed.

### Components
There are two types of two-way-rest components: Getters and Posters. Getters retrieve instances, and Posters mutate instances. Getters include index and show components, and Posters are creates, update, and destroy. Every component sends an instance of itself to the props.instance(s) of its children, however while Getters send the actual instance, Posters send a substate instance if it exists. (Substate instances are created on errors or successes )

### REST Expectations
Index: Returns an array
Everything else: Returns an object
Errors: Object with an errors property

### Component Actioncycle
All two-way-rest components have the same actioncycle that can be tapped into by declaring function using the prop of the appropriate name

callforward-->
defaultAction-->
onSuccessCB || onFailureCB-->
callback

These functions are wrapped in bluebird's Promise.Method, so they accept promises. 

They take a single parameter, args, which is an immutable Map object (from immutableJS), and must return an args Map with the same properties. 

The args Map:
reducer: <string> name of reducer
tree: <List:Immutable> frontend/backend location of instance
outTree: <List:Immutable> the frontend location for the response from the backend (defaults to tree)
path: <string> url starting from http://remoteurl.com/... (defaults to tree) + this.props.endPath <string> rest action like 'edit', 'show', etc.
form: <DOM:element> the entire component element
content: <Map:Immutable> this.props.content object
callforward: <function>
callback: <function>
onSuccessCB: <function>
onFailureCB: <function>
onSuccess: <object> passed to instance on success
onFailure: <object> passed to instance on failure
upload: <boolean> is one of the fields in the component a file field
force: <boolean> should a component refire its standard ajax call everytime it is updated
parent: <boolean> true for CreateChildComponents
id: <string> declared using this.props.id, forces a create component to use the declared id
twr: <Component> the component itself
response: <object | array> declared using this.props.response, skips ajax call and returns response
dispatch: <function> disptach function
getState: <getState> getState function


# Usage
*For a working example, please checkout the two-way-rest-boilerplate*

# Component Properties
```
<TWR* properties...>
```
__tree__  
type: Array  
purpose: the backend and frontend location of where a TWR component will act  
example_1: 
```
['users', '1'] (used for updates/destructions of a specific instance)  
== 'http://remoteurl/users/1' (backend) 
== reducerState.immutable = {users: {1: {id: 1, name: 'joe'}}} (frontend)
```

example_2: 
```
['users'] (used for create/index of a specific instance)  
== 'http://remoteurl/users' (backend) 
== reducerState.immutable = {users: {...the results of a create/index} (frontend)
```

__location__
type: string url
purpose: parsed to find the tree of an instance
example_1: 
```
<TWRShow location='/admin/users/1/edit' > ==> tree = ['users', '1'] 
(Starts parse at reducer name if reducer name is in url, 
removes rest words like index, edit, and create from the end of a url)
```


__instance__
type: immutable object with tree and _globeTWR property
purpose: the frontend representation of a backend object
example_1: 
```
<TWRShow tree={['users', '1']}> ==> sends its children an 
	instance prop of the get response to http://remoteUrl/users/1
<TWRUpdate instance={ this.props.instance} /> ==> uses the 
	instance prop's tree set the tree of the component 
```
example_2:  
```
this.props.instance.gex('children') ==> an array of child instances
```

example_3:  
```
this.props.instance.gex('child') ==> a child instance
```

__outTree__
type: Array
purpose: change the frontend location of where the results should be merged with.
example_1: 
```
<TWRShow tree={['users', '1']} outTree={{'users', '2'}}> ==> Get the user 1 backend
instance and replace the user 2 frontend instance with it
```

__replace__
type: Function
purpose: replace the component's DOM with a new DOM that has access to all of the component's functions
example_1: 
```
<TWRShow tree={['users', '1']} replace={(user_1)=>{
	console.log(user_1.instance(), 'returns the frontend instance')
	return <p>{user_1.instance().get('name')}</p>
}}
```

__custom__
type: Function
purpose: return a custom reducer function that takes the reducer state as an argument and returns a new reducer state
example_1: 
```
<TWRShow tree={['users', '1']} replace={(user_1)=>{
	return <TWRCreate onClick={()=>{
		user_1.custom((state)=>state.set('name', 'Example'))
	}} /> 
}} />==> 
```

__customAction__
type: Function
purpose: an action creator for custom functions
example_1: 
```
<TWRUpdate tree={['users', '1']} callforward={(args)=>{
	args.get('dispatch')(
		args.get('twr').customAction(
			(state)=>state.set('name', 'Example')
	))
	return args
	
}} />
```