'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.customAction = undefined;
exports.coreGET = coreGET;
exports.substateDeleteCreator = substateDeleteCreator;
exports.substateCreateCreator = substateCreateCreator;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.createFront = createFront;
exports.updateFront = updateFront;
exports.destroyFront = destroyFront;
exports.index = index;
exports.show = show;
exports.customCreator = customCreator;

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

var _creatorsHelpers = require('./creatorsHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var customAction = exports.customAction = actions.custom;

function coreGET(args, type) {
	if (args.get('getState')()[args.get('reducer')].getIn(componentHelpers[type + 'Check'](args.get('tree')))) {
		if (!args.get('force')) {
			return true;
		}
	}
	args.get('dispatch')(actions.setAction(args.get('reducer'), componentHelpers[type + 'Check'](args.get('tree'))));
	return (0, _creatorsHelpers.callforwardCreator)(args).then(function (args) {
		return (0, _creatorsHelpers.getType)(args).then(function (response) {
			console.log('response' + type, response);
			if (response.hasOwnProperty('errors')) {
				throw response;
			}
			args.get('dispatch')(actions[type + 'Action'](args.get('reducer'), args.get('tree'), response));
			return (0, _creatorsHelpers.onSuccessCBCreator)(args.set('response', response));
		}).catch(function (response) {
			console.log('errors', response);
			args.get('dispatch')(actions.createErrorAction(args.get('reducer'), args.get('tree'), args.get('content'), response, args.postContent));
			return (0, _creatorsHelpers.onFailureCBCreator)(args.set('response', response));
		}).then(function (args) {
			return (0, _creatorsHelpers.callbackCreator)(args);
		});
	});
}

function substateDeleteCreator(args) {
	var content = (0, _creatorsHelpers.getContent)(args.get('form'));
	return args.get('batchDispatch')(actions.substateDeleteAction(args.get('reducer'), args.get('tree'), content.toJS()));
}

function substateCreateCreator(args) {
	var content = (0, _creatorsHelpers.getContent)(args.get('form')).mergeDeep(args.get('content'));
	return args.get('batchDispatch')(actions.substateCreateAction(args.get('reducer'), args.get('tree'), content.toJS()));
}

function create(args) {

	function responsePromise(args) {
		return (0, _creatorsHelpers.postRequestCreator)(args, function (args) {
			return (0, _fetch.post)(args.get('path'), args.get('combinedContent').toJS());
		}).then(function (response) {
			return (0, _creatorsHelpers.responseCreator)(response, args, function (args) {
				return args.update('outTree', function (outTree) {
					return outTree.push(response.id.toString());
				});
			});
		});
	}
	var nextArgs = args.merge({ type: 'create' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function update(args) {
	function responsePromise(args) {
		return (0, _creatorsHelpers.postRequestCreator)(args, function (args) {
			return (0, _fetch.put)(args.get('path'), args.get('combinedContent').toJS());
		}).then(function (response) {
			return (0, _creatorsHelpers.responseCreator)(response, args);
		});
	}
	var nextArgs = args.merge({ type: 'update' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function destroy(args) {
	function responsePromise(args) {
		return (0, _creatorsHelpers.postRequestCreator)(args, function (args) {
			return (0, _fetch.del)(args.get('path'));
		}).then(function (response) {
			return (0, _creatorsHelpers.responseCreator)(response, args);
		});
	}
	var nextArgs = args.merge({ type: 'destroy' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function createFront(args) {
	function responsePromise(args) {
		var newId = (0, _creatorsHelpers.getId)(args);
		var response = { id: newId };
		return (0, _creatorsHelpers.responseCreator)(response, args, function (args) {
			return args.update('outTree', function (outTree) {
				return outTree.push(response.id.toString());
			});
		});
	}
	var nextArgs = args.merge({ type: 'create' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function updateFront(args) {
	function responsePromise(args) {
		return (0, _creatorsHelpers.responseCreator)({}, args);
	}
	var nextArgs = args.merge({ type: 'update' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function destroyFront(args) {
	function responsePromise(args) {
		return (0, _creatorsHelpers.responseCreator)({}, args);
	}
	var nextArgs = args.merge({ type: 'destroy' });
	return (0, _creatorsHelpers.endPromises)((0, _creatorsHelpers.createEventTrain)([_creatorsHelpers.combineContent, _creatorsHelpers.callforwardCreator, responsePromise])(nextArgs));
}

function index(args) {
	return coreGET(args, 'index');
}

function show(args) {
	return coreGET(args, 'show');
}

function customCreator(reducer, args) {
	return function (dispatch, getState) {
		return dispatch(customAction(reducer, args));
	};
}