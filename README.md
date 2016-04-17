# Two-Way-Rest

A lot of things, but more specifically a react-redux plugin that facilitates changes to the state and backend data sources.

Example:
```
<TWRCreate tree=‘users’>
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

*A user instance is simply an immutable user object with a special tree property:*  
Map {id: 1, name: ‘Joe’, **tree: List [‘users’, 1]**}

Suppose that instead of updating a user’s frontend and backend, you just wanted to update the frontend.

```
<TWRUpdateFront instance={userInstance}>
	<input type=’text’ name=’visible’ value=’true’ />
	<input type=’submit’ />
</TWRUpdateFront>
```
Now your frontend user has a new property(or updates an old property) called visible, and its value is true. 

## Motivation:
I'm from the trenches. I build relatively simple websites for small businesses, where the priority is stability and development speed. When I started working with redux, I loved the structure, but hated the steps. Something as simple as toggling a button meant changing the react component, the action creator and the reducer. I built two-way-rest to expedite this process.

## Fundamental Theory:
There are two fundamental theories that power two-way-rest. The first is the idea that public functions that manipulate a database should have the same relative location as their frontend equivalents. The second, and the more crucial, is that information transmission should always be packaged in a key-value object, as opposed to just a value. The reason is because keys in key-value objects inuitively tell us the location of where a message should go. When these key-value objects are placed in a database which powers all of the logic in an application, they can, in many cases, eliminate the need to write code for receiving messages.


## Setup:

##### Requirements: 
React  
Redux  
React-Redux
redux-batched-actions
two-way-rest 

Proper Setup Example.
```
import { enableBatching } from 'redux-batched-actions';
import { createStore, combineReducers} from 'redux';
import {setAddress, setStore} from 'two-way-rest';
import rootReducer from './reducers/index';

//We setup the address for backend ajax queries
setAddress('http://remoteurl.com');

const store = createStore(
	enableBatching(combineReducers(rootReducer))
);
//We send two-way-rest an exact copy of the store
setStore(store);

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

These functions are wrapped in bluebird's Promise.Method, so they accept promises. They take a single parameter, args, which is an immutable Map object (from immutableJS), and must return an args Map with the same properties. 

__The args Map:__  
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

### TWRComponent Optimization And Frontend Database use
TWRComponents are pure functional components that rely entirely on their props for their output. This is especially important because if a value is used in a TWR component that is not passed in from a prop, the component will fail to update on changes to that value, unless the forceUpdate prop is set to true.

The frontend relational database posed a problem to the pure functional component. Because the entire reducer state is connected to each component, every component should technically be updating whenever the state is changed. This is obviously a needless drag on the system, so instead each component looks for changes within specific tables in the state. Unfortunately, because we are using a frontend relational database, it's difficult to know exactly which parts of the database each component relies on. The solution to this issue was to provide a *gex* function to every TWRComponent. The gex function is a simple query function that registers which tables in a state are being called on. This information is used by the component, and all of the parent TWRComponents to know when to update.

```
<TWRShow tree='parent/q'>
	<TWRShow tree='users/1' replace={(user_1)=>{
		const childrenBelongingToUser_1 = user_1.gex(['children'], user_1.instance())
	}}

	or

	<TWRShow tree='users/1' replace={(user_1)=>{
		const returnASingleObjectIfHasOneRelationship = user_1.gex(['child', 'name'], user_1.instance())
	}}
	or
	<TWRShow tree='users/1' replace={(user_1)=>{
		const allChildrenInState = user_1.gex('children')
	}}
</TWRShow>
```
*In the above example, the TWRShow component would know to update when the users table or children changed. The parent TWRshow component would also know to update. 


# Usage
*For a working example, please checkout the two-way-rest-boilerplate*
http://github.com/l2silver/two-way-rest-boilerplate

# Component Properties
```
<TWR* properties...>
```
__tree__  
type: string  
purpose: the backend and frontend location of where a TWR component will act  
example_1: 
```
<TWRShow tree='users/1' > ==> used for updates/destructions of a specific instance  
== 'http://remoteurl/users/1' (backend) 
== reducerState.immutable = {users: {1: {id: 1, name: 'joe'}}} (frontend)
```

example_2: 
```
<TWRShow tree='users' > ==> used for create/index of a specific instance
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
type: immutable object with tree property  
purpose: the frontend representation of a backend object  
example_1: 
```
<TWRShow tree='users/1'> ==> sends its children an 
	instance prop of the get response to http://remoteUrl/users/1
<TWRUpdate instance={ this.props.instance} /> ==> uses the 
	instance prop's tree to set the tree of the component 
```

__outTree__  
type: string  
purpose: change the frontend location of where the results should be merged with.  
example_1: 
```
<TWRShow tree='users/1' outTree='users/2'> ==> Get the user 1 backend
instance and replace the user 2 frontend instance with it
```

__replace__
type: Function  
purpose: replace the component's DOM with a new DOM that has access to all of the component's functions  
example_1: 
```
<TWRShow tree='users/1' replace={(user_1)=>{
	console.log(user_1.instance(), 'returns the frontend instance')
	return <p>{user_1.instance().get('name')}</p>
}}
```

__custom__  
type: Function  
purpose: return a custom reducer function that takes the reducer state as an argument and returns a new reducer state  
example_1: 
```
<TWRShow tree='users/1' replace={(user_1)=>{
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
<TWRUpdate tree='users/1' callforward={(args)=>{
	args.get('dispatch')(
		args.get('twr').customAction(
			(state)=>state.set('name', 'Example')
	))
	return args
	
}} />
```
__forceRender__  
type: boolean  
purpose: by default, the index and show components will only render the children if their instances exist. When forceRender is true, those components will render their children no matter what.  
example_1: 
```
<TWRShow forceRender='true' tree='users/1' >
	<p>I show no matter what! </p>
</TWRShow>
```
__forceUpdate__  
type: boolean  
purpose: by default, components will only update if their props change, or if the state changes. If the force update property is set, TWRComponents will always update  
example_1: 
```
var x = 1
<TWRShow forceUpdate='true' tree='users/1' >
	<p>{x}</p>
</TWRShow>
x += 1
```

__force__  
type: boolean  
purpose: the index and show components will only fire a network request once per instance in the same reducer state. To fire everytime a component is mounted, set force to true.  
example_1: 
```
<TWRShow force='true' tree='users/1' >
	<p>A new network request everytime the component is mounted</p>
</TWRShow>
```

__tag__  
type: string  
purpose: change the element wrapping a TWR component to specific tag  
example_1: 
```
<TWRShow tag='div' tree='users/1' >
	</p>
</TWRShow> => <div><p /></div>
```