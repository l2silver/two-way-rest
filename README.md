# Two-Way-Rest

A react-redux plugin that facilitates changes to the state and backend data sources.

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
We need to make certain the state is a immutable map object, so the twoWayRestSwitch should always be last. The immutable library is an integral component of two-way-rest.

### Usage

I’ll demonstrate how to use the system by building a simple site.

```
<DeclareReducer reducer=’main’>
	<TWRIndex tree=’users’>
		<DisplayUserNameInList>
	</TWRIndex>
</DeclareReducer>
```
The TWRIndex uses the tree information to send a get request to
```
http://remoteurl/users
```
Which returns an array of json objects
```
[
{
id: 1, 
name: ‘Carole’, 
pets:[{id: 1, type: ‘fish}]
}, 
{
id: 2, 
name: Jimmer, 
pets:[]
}
]
```
The TWR index then passes its children the instances prop.
```
class DisplayUserNameInList extends Component {
render(){
	return <ul>
	{
this.props.instances.map((user)=>{
return <li>{user.get(‘name’)}</li>
})
}
</ul>
}
}
```
All of this returns
```
<ul>
	<li>Carole</li>
	<li>Jimmer/li>
</ul>
```
So lets expand the functionality by changing the DisplayUserNameInList
```
class DisplayUserNameInList extends Component {
render(){
	return <ul>
	{
this.props.instances.map((user)=>{
return <li>
<TWRUpdate instance={user}>
	<input type=’text’ name=’name’ defaultValue={user.get(‘name’)} />
<input type=’submit’ value=’save’ />
<TWRUpdate>
```
or
```
<TWRXUpdate instance={userInstance}, xUpdate={{visible: true}}>
	<input type=’text’ name=’visible’ value=’true’ />
	<input type=’submit’ />
</TWRUpdate>
```
or 
```
<TWRXUpdate instance={userInstance} render={()=>{return <form><input type=’text’ name=’visible’ value=’true’ /><input type=’submit’ /></form>}}>
	<input type=’text’ name=’visible’ value=’true’ />
	<input type=’submit’ />}/>
</TWRUpdate>

</li>
})
}
</ul>
}
}
```
If a user changes Carole’s name to Cara and clicks the save button, the TWRUpdate sends a put request to 
```
http://remoteurl/users/1
```
And returns an object 
```
{
	id: 1, 
	name: ‘Cara’
}
```
We update the state with this object, which updates the DOM
```
<ul>
	<li>
<input ...Cara>
<input submit>
</li>
	<li>
<input ...Carole>
<input submit>
</li>
</ul>
```
There are two key points here. 

The first is that once we get an object from a database(or array of objects), those objects are ready to be used in any TWR form we have. All we need to do is pass the form the object in the instance prop.

The second is that when we send any kind of individual request (anything except index), we need the response to be an object. The returned object is merged with the same object in the state.

Suppose for example, there was an error when we tried to change Carole’s name.

The correct error response would be `{errors: ‘The user name must be at least 6 characters’}`

Not only is this an object, but TWR actually looks for the error property in the returned object to determine whether an error occurred or not.

Lastly, suppose we wanted to add a pet to the user.
```
class DisplayUserNameInList extends Component {
render(){
	return <ul>
	{
this.props.instances.map((user)=>{
return <li>
<TWRUpdate instance={user}>
	<input type=’text’ name=’name’ defaultValue={user.get(‘name’)} />
<input type=’submit’ value=’save’ />
<TWRUpdate
<TWRCreateChild instance={user} childName=’pets’>
	<input type=’text’ name=’name’ placeholder=’Pet Name’/>
<input type=’submit’ value=’Add’ />
</TWRCreateChild’>
</li>
})
}
</ul>
}
}
```
This would send a rest post request to `http://remoteurl/users/1/pets`, with the following post variables:
```
user_id: 1
name: ‘’
```