'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.combineSwitches = combineSwitches;
exports.generateRestSwitch = generateRestSwitch;

var _core = require('./core');

var _immutable = require('immutable');

function combineSwitches(list) {
	if (list.length > 1) {
		return list.reduce(function (previousFunction, currentFunction) {
			return function (state, action) {
				return previousFunction(currentFunction(state, action), action);
			};
		});
	}
	if (list.length == 1) {
		return list[0];
	}
	throw 'combineSwitches requires atleast one switch function';
}

function generateRestSwitch(reducer) {
	return function () {
		var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _immutable.Map)() : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case reducer:
				switch (action.verb) {
					case 'INDEX':
						return (0, _core.index)(state, action.tree, action.response);
					case 'SET_GET':
						return (0, _core.setGet)(state, action.tree);
					case 'SET_INDEX':
						return (0, _core.setIndex)(state, action.tree);
					case 'SHOW':
						return (0, _core.show)(state, action.tree, action.response);
					case 'SET_SHOW':
						return (0, _core.setShow)(state, action.tree, action.response);
					case 'CREATE':
						return (0, _core.create)(state, action.tree, action.content, action.response, action.outTree, action.parent);
					case 'SUBSTATE_CREATE':
						return (0, _core.substateCreate)(state, action.tree, action.content);
					case 'SUBSTATE_DELETE':
						return (0, _core.substateDelete)(state, action.tree, action.content);
					case 'CREATE_ERROR':
						return (0, _core.createError)(state, action.tree, action.content, action.response);
					case 'UPDATE':
						return (0, _core.update)(state, action.tree, action.content, action.response, action.outTree);
					case 'UPDATE_ERROR':
						return (0, _core.update)(state, action.tree, action.content, action.response);
					case 'DESTROY':
						return (0, _core.destroy)(state, action.tree, action.outTree);
					case 'DESTROY_ERROR':
						return (0, _core.destroy)(state, action.tree);
				}
		}
		return state;
	};
}