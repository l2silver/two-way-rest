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
Redux-Thunk

Proper Setup Example.
```
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index';
const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore);
const store = createStoreWithMiddleware(rootReducer);
ReactDOM.render(
  <Provider store={store}>
    <MyRootComponent />
  </Provider>,
  rootEl
)
```
*-redux-thunk and react-redux documentation*

We also have to setup the address for backend ajax queries, so we'll add this:
```
import {setAddress} from 'two-way-rest';
setAddress('http://remoteurl.com');
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

### State Format

Although the two-way-rest plugin does not need the combineReducers function from redux, it does require the same state reducer format:
```
fullState = {reducerName_1: reducerState_1, ...}
```

# Inner Workings
### Frontend Relational Immutable Database
Two-way-rest is powered by a frontend pseudo-relational database called the globe. Every reducer's state is its own globe. 

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

