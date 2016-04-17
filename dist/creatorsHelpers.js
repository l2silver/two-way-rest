'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getType = exports.arrayRegexUnGreed = exports.arrayRegex = undefined;
exports.getId = getId;
exports.getBrackets = getBrackets;
exports.getMergeInList = getMergeInList;
exports.convertToArrayIf = convertToArrayIf;
exports.checkMulti = checkMulti;
exports.getContent = getContent;
exports.calls = calls;
exports.callforwardCreator = callforwardCreator;
exports.callbackCreator = callbackCreator;
exports.onSuccessCBCreator = onSuccessCBCreator;
exports.onFailureCBCreator = onFailureCBCreator;
exports.createEventTrain = createEventTrain;
exports.combineContent = combineContent;
exports.endPromises = endPromises;
exports.postRequestCreator = postRequestCreator;
exports.responseCreator = responseCreator;

var _fetch = require('./fetch');

var fetch = _interopRequireWildcard(_fetch);

var _componentHelpers = require('./componentHelpers');

var componentHelpers = _interopRequireWildcard(_componentHelpers);

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _immutable = require('immutable');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _reduxBatchedActions = require('redux-batched-actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var arrayRegex = exports.arrayRegex = /(\[.*\])/g;
var arrayRegexUnGreed = exports.arrayRegexUnGreed = /(\[.*?\])/;

function getId(args) {
	if (args.get('id')) {
		return args.get('id');
	}
	return componentHelpers.createId();
}

function getBrackets(name, list) {
	var bracketMatch = name.match(arrayRegexUnGreed);
	if (bracketMatch) {
		var nextList = list.push(bracketMatch[0]);
		return getBrackets(name.replace(arrayRegexUnGreed, ''), nextList);
	}
	return list;
}

function getMergeInList(nextObject, name, abbrName) {
	var rawBrackets = name.split(arrayRegex)[1];
	var brackets = getBrackets(rawBrackets, (0, _immutable.List)());
	return brackets.reduce(function (list, brackets) {
		var cleanBracket = brackets.replace(/(\[|\])/g, '');
		if (cleanBracket) {
			return list.push(cleanBracket);
		}
		var arrayExists = nextObject.getIn(list);
		if (arrayExists) {
			var newKey = arrayExist.toList.size();
			return list.push[newKey];
		}
		return list.push(0);
	}, (0, _immutable.List)([abbrName]));
}

function convertToArrayIf(nextObject, name, value) {
	if (name.match(arrayRegex)) {
		var abbrName = name.replace(arrayRegex, '');
		var mergeInList = getMergeInList(nextObject, name, abbrName);
		return nextObject.setIn(mergeInList, value);
	}
	return nextObject.set(name, value);
}

function checkMulti(element) {
	if (element.attributes['multiple']) {
		return (0, _immutable.List)(element.options).reduce(function (list, option) {
			if (option.selected) {
				return list.push(option.value);
			}
			return list;
		}, (0, _immutable.List)());
	}
	return element.value;
}

function getContent(content) {
	var elements = content.childNodes;
	var contentMap = (0, _immutable.List)(elements).reduce(function (object, element) {
		var nextObject = object.mergeDeep(getContent(element));
		if (element.getAttribute) {
			var name = element.getAttribute('name');
			if (name) {
				if (element.type === 'checkbox' || element.type === 'radio') {
					if (!element.checked) {
						return nextObject;
					}
				}
				return convertToArrayIf(nextObject, name, checkMulti(element));
			}
		}

		return nextObject;
	}, (0, _immutable.Map)());
	return contentMap;
}

function calls(args, type) {
	if (args.get(type)) {
		return _bluebird2.default.method(function (args) {
			try {
				return args.get(type)(args);
			} catch (e) {
				console.log(type, 'error', e);
			}
		})(args);
	} else {
		return _bluebird2.default.method(function () {
			return args;
		})();
	}
}

function callforwardCreator(args) {
	return calls(args, 'callforward');
}

function callbackCreator(args) {
	return calls(args, 'callback').then(function () {
		try {
			return args.get('batchDispatch')((0, _reduxBatchedActions.batchActions)(args.get('dispatchList')));
		} catch (e) {
			console.log('Error rendering after state change', e);
			throw e;
		}
	});
}

function onSuccessCBCreator(args) {
	return calls(args, 'onSuccessCB');
}

function onFailureCBCreator(args) {
	return calls(args, 'onFailureCB');
}

function createEventTrain(functions) {
	var combinedFunctions = functions.reduce(function (functions, fn) {
		return _bluebird2.default.method(function (args) {
			return functions(args).then(fn);
		});
	}, _bluebird2.default.method(function (args) {
		return args;
	}));
	return combinedFunctions;
}

function combineContent(args) {
	var formContent = getContent(args.get('form'));
	var combinedContent = formContent.mergeDeep(args.get('content').toJS());
	return args.merge({ formContent: formContent, combinedContent: combinedContent });
}

function endPromises(promise) {
	return promise.catch(function (args) {
		console.log('error', args.get('response'));
		args.get('dispatch')(actions[args.get('type') + 'ErrorAction'](args.get('reducer'), args.get('tree'), args.get('combinedContent').mergeDeep(args.get('onFailure')), args.get('response')));
		return onFailureCBCreator(args);
	}).then(function (args) {
		return callbackCreator(args);
	});
}

function postRequestCreator(args, fn) {
	if (args.get('upload')) {
		var formData = new _formData2.default(args.get('form'));
		var keys = args.get('content').keySeq().toArray();
		keys.forEach(function (key) {
			formData.append(key, args.getIn(['content', key]));
		});
		return (0, _fetch.up)(args.get('path'), formData);
	}
	return fn(args);
}

function responseCreator(response, args, successFn) {

	console.log('response', response);

	if (response.hasOwnProperty('errors')) {
		throw args.set('response', response);
	}
	try {
		if (args.get('outTrees')) {
			args.get('outTrees').map(function (outTree) {
				var nextArgs = successFn ? successFn(args) : args;
				var nextAction = actions[nextArgs.get('type') + 'Action'](nextArgs.get('reducer'), nextArgs.get('tree'), nextArgs.get('combinedContent').mergeDeep(nextArgs.get('onSuccess')), response, outTree, nextArgs.get('parent'));
				return args.get('dispatch')(nextAction);
			});
			return onSuccessCBCreator(nextArgs.set('response', response));
		} else {
			var _nextArgs = successFn ? successFn(args) : args;
			var nextAction = actions[_nextArgs.get('type') + 'Action'](_nextArgs.get('reducer'), _nextArgs.get('tree'), _nextArgs.get('combinedContent').mergeDeep(_nextArgs.get('onSuccess')), response, _nextArgs.get('outTree'), _nextArgs.get('parent'));

			_nextArgs.get('dispatch')(nextAction);
			return onSuccessCBCreator(_nextArgs.set('response', response));
		}
	} catch (e) {
		console.log('ERROR ON RENDER RESPONSE', e);
	}
}

var getType = exports.getType = _bluebird2.default.method(function (args) {
	if (args.get('response')) {
		return args.get('response');
	}
	return (0, _fetch.get)(args.get('path'));
});