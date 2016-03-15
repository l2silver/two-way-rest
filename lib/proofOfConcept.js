Clearly, two-way-rest is a project that can go on forever. Or maybe it’s almost done, but I need to be testing it in a much more fulfilling manner. I need another project.

So what’s my system?

I’m tempted to say Go, but how strong is the query language. It looks good.

Sooooo…………..

What do I want to achieve?

A smart frontend environment. 
Where relationships do not have to be defined. (That might be tricky).
I want automatic responses when I return certain results.
A new type of security.
A query language that.

Why is frontend querying so interesting or important?

Everything I have makes a lot of sense, but reverse query writing is difficult….

Where does custom code go? Suppose I had a heavy calculation.

Is this necessary? 

Querying makes sense, and adjusting queries on the fly makes sense. People take what they want out of the system.

These are all really good concepts. So what the problem is?

Two way rest is simple. Real speed opportunities are at my fingertips. If…

Suppose, we used a one way rest?

The query language took our inputs, and translated them to laravel, or node…

All I would need to do is create a security layer that stops people from throwing their own sql queries.


So how do we control queries. Self built user role system?


Why do I need to build everything from scratch? Why can’t I implement my ideas?

For example, what’s the problem with pagitter. Is it a bad idea, or did I just waste my effort on it? Both two way rest and pagitter are good ideas, that need closure.

Why do we need dynamic queries? If I change a query, I have to change the backend. But I don’t see how I’m saving changes. I’m either changing on the backend or the frontend, but the change have to be made…

Supose I want to run a differnet type of modification on a user/1/changeUserName might make sense. How would I update the dom with these changes. 

I would post the tree. But maybe I post the suffix. User/1/ suffix changeUserName

Or what about indexes

users/index/something might make sense, but indexes are typically diffcult because they have no id. We say multiple ind




I might even have to 




So, whats the new situation.

Suppose we have an object 
{
	Id: 1
	Tests: {
		Id: 1
}
}

So what do we do here. We no longer have our global object. Instead, we have an immutable object that is wrapped with additional features.

So, what are we looking to do?



Suppose we have the following object. Through the response, we get
{
	Name: ‘hello’
Id: 1,
	Tests: {
		Id: 1,
		Name: ‘goodbye’
}
}

This object in the globe looks like so:

Assemblies_categories: {
	1: {
Name: ‘hello’,
Id: 1,
Tests: [1]
}
}

tests: {
	1: {
Name: ‘hello’,
Id: 1
}
}


Assemblies_categories.getIn([1, tests])

Suppose we query the server now.

But what will actually happen is we 

function(fn, params){
	if(fn){
		if(fn == 'getIn'){

		}
		return instance[fn](params)
	}
	return instance;
}

