'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.arrayRegexUnGreed = exports.arrayRegex = undefined;
exports.changeFetchType = changeFetchType;
exports.corePOST = corePOST;
exports.coreGET = coreGET;
exports.substateDelete = substateDelete;
exports.substateCreate = substateCreate;
exports.create = create;
exports.calls = calls;
exports.createFront = createFront;
exports.updateFront = updateFront;
exports.update = update;
exports.index = index;
exports.show = show;
exports.destroy = destroy;
exports.getBrackets = getBrackets;
exports.getMergeInList = getMergeInList;
exports.convertToArrayIf = convertToArrayIf;
exports.getContent = getContent;
exports.urlPath = urlPath;
exports.callforwardCreator = callforwardCreator;
exports.callbackCreator = callbackCreator;
exports.onSuccessCBCreator = onSuccessCBCreator;
exports.onFailureCBCreator = onFailureCBCreator;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function changeFetchType(type, args) {
	if (args.get('upload')) {
		var formData = new _formData2.default(args.get('form'));
		var keys = args.get('content').keySeq().toArray();
		keys.forEach(function (key) {
			formData.append(key, args.getIn(['content', key]));
		});
		return (0, _fetch.up)(args.get('path'), formData);
	}
	switch (type) {
		case 'create':
			return (0, _fetch.post)(args.get('path'), args.get('combinedContent').toJS());
	}
	return (0, _fetch.put)(args.get('path'), args.get('combinedContent').toJS());
}

function corePOST(args, type) {
	return function (dispatch, getState) {
		var content = getContent(args.get('form')).merge(args.get('content'));
		var nextArgs = args.set('formContent', getContent(args.get('form')));
		var combinedContent = nextArgs.get('content').merge(nextArgs.get('formContent'));
		return callforwardCreator(nextArgs.mergeDeep({ combinedContent: combinedContent, dispatch: dispatch, getState: getState })).then(function (args) {
			return changeFetchType(type, args).then(function (response) {
				if (response.hasOwnProperty('errors')) {
					throw response;
				}
				console.log('response', response);
				dispatch(actions[type + 'Action'](args.get('reducer'), args.get('tree'), args.get('combinedContent').mergeDeep(args.get('onSuccess')), response));
				return onSuccessCBCreator(args.set('response', response));
			}).catch(function (response) {
				console.log('error', response);
				dispatch(actions[type + 'ErrorAction'](args.get('reducer'), args.get('tree'), args.get('combinedContent').mergeDeep(args.get('onFailure')), response));
				return onFailureCBCreator(args.set('response', response));
			}).then(function (args) {
				return callbackCreator(args);
			});
		});
	};
}

function coreGET(args, type) {
	var lowerType = type.toLowerCase();
	return function (dispatch, getState) {
		if (getState()[args.get('reducer')].getIn(componentHelpers['check' + type](args.get('tree')))) {
			return true;
		}
		dispatch(actions['set' + type + 'Action'](args.get('reducer'), args.get('tree')));
		return callforwardCreator(args.mergeDeep({ dispatch: dispatch, getState: getState })).then(function (args) {
			return (0, _fetch.get)(args.get('path')).then(function (response) {
				console.log('get response' + type, response);
				if (response.hasOwnProperty('errors')) {
					throw response;
				}
				dispatch(actions[lowerType + 'Action'](args.get('reducer'), args.get('tree'), response));
				return onSuccessCBCreator(args.set('response', response));
			}).catch(function (response) {
				console.log('errors', response);
				dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
				return onFailureCBCreator(args.set('response', response));
			}).then(function (args) {
				return callbackCreator(args);
			});
		});
	};
}

function substateDelete(args) {
	return function (dispatch, getState) {
		var content = getContent(args.get('form'));
		return callforwardCreator(args).then(function (args) {
			return dispatch(actions.substateDeleteAction(args.get('reducer'), args.get('tree'), content.toJS()));
		}).catch(function (response) {
			return dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), content.toJS(), response, args.get('postContent')));
		});
	};
}

function substateCreate(args) {
	return function (dispatch, getState) {
		var content = getContent(args.get('form'));
		return callforwardCreator(args).then(function (args) {
			return dispatch(actions.substateCreateAction(args.get('reducer'), args.get('tree'), content.toJS()));
		}).catch(function (response) {
			return dispatch(actions.createErrorAction(args.get('reducer'), args.get('tree'), content.toJS(), response, args.get('postContent')));
		});
	};
}

function create(args) {
	return corePOST(args, 'create');
}

function calls(args, type) {
	if (args.get(type)) {
		return _bluebird2.default.method(args.get(type))(args);
	} else {
		return _bluebird2.default.method(function () {
			return args;
		})();
	}
}

function createFront(reducer, tree, form) {
	return function (dispatch, getState) {
		var formData = new _formData2.default(form);
		(0, _fetch.post)(urlPath(tree), formData).then(function (response) {
			var content = getContent(form, reducer, tree);
			if (response.hasOwnProperty('errors')) {
				return dispatch(createErrorAction(reducer, tree, content.toJS(), response));
			} else {
				return dispatch(createAction(reducer, tree, content.toJS(), response));
			}
		});
	};
}

function updateFront(args) {
	//reducer, tree, form, update){
	return function (dispatch, getState) {
		var content = getContent(args.get('form'));
		var contentWithUpdate = content.merge(args.get('content'));
		return dispatch(actions.updateFrontAction(args.get('reducer'), args.get('tree'), contentWithUpdate.toJS()));
	};
}

function update(args) {
	return corePOST(args, 'update');
}

function index(args) {
	return coreGET(args, 'Index');
}

function show(args) {
	return coreGET(args, 'Show');
}

function destroy(args) {
	var content = getContent(args.get('form'), args.get('reducer'), args.get('tree'));
	var treeWithId = args.get('tree').push(content.get('id'));
	return function (dispatch, getState) {
		return (0, _fetch.des)(urlPath(args.get('tree'))).then(function (response) {
			console.log('resonse', response);
			if (response.hasOwnProperty('errors')) {
				console.log('errors');
				return dispatch(indexErrorAction(args.get('reducer'), args.get('tree'), response));
			} else {
				return dispatch(actions.destroyAction(args.get('reducer'), args.get('tree'), response));
			}
		});
	};
}
var arrayRegex = exports.arrayRegex = /(\[.*\])/g;
var arrayRegexUnGreed = exports.arrayRegexUnGreed = /(\[.*?\])/;

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

function getContent(content) {
	var elements = content.childNodes;
	var contentMap = (0, _immutable.List)(elements).reduce(function (object, element) {
		var nextObject = object.mergeDeep(getContent(element));
		if (element.getAttribute) {
			var name = element.getAttribute('name');
			if (name) {
				return convertToArrayIf(nextObject, name, element.value);
			}
		}

		return nextObject;
	}, (0, _immutable.Map)());
	return contentMap;
}

function urlPath(tree) {
	return '/' + tree.join('/');
}

function callforwardCreator(args) {
	return calls(args, 'callforward');
}

function callbackCreator(args) {
	return calls(args, 'callback');
}

function onSuccessCBCreator(args) {
	return calls(args, 'onSuccessCB');
}

function onFailureCBCreator(args) {
	return calls(args, 'onSuccessCB');
}