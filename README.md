# Two-Way-Rest

A lot of things, but more specifically a react-redux plugin that facilitates changes to the state and backend data sources.

[![build status](https://travis-ci.org/l2silver/two-way-rest.svg?style=flat-square)](https://travis-ci.org/l2silver/two-way-rest)


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

Please checkout the full documentation at https://l2silver.gitbooks.io/two-way-rest/content/