'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.combineSwitches = combineSwitches;
exports.generateRestSwitch = generateRestSwitch;

var _core = require('./core');

function combineSwitches(list) {
	return list.reduce(function (previousFunction, currentFunction) {
		return function (state, action) {
			return previousFunction(currentFunction(state, action), action);
		};
	});
}

function generateRestSwitch(reducer) {
	return function (state, action) {
		switch (action.type) {
			case reducer:
				switch (action.verb) {
					case 'INDEX':
						return (0, _core.index)(state, action.tree, action.response);
					case 'SET_INDEX':
						return (0, _core.setIndex)(state, action.tree);
					case 'SHOW':
						return (0, _core.show)(state, action.tree, action.response);
					case 'SET_SHOW':
						return (0, _core.setShow)(state, action.tree, action.response);
					case 'CREATE':
						return (0, _core.create)(state, action.tree, action.content, action.response);
					case 'SUBSTATE_CREATE':
						return (0, _core.substateCreate)(state, action.tree, action.content);
					case 'SUBSTATE_DELETE':
						return (0, _core.substateDelete)(state, action.tree, action.content);
					case 'CREATE_ERROR':
						return (0, _core.createError)(state, action.tree, action.content, action.response);
					case 'UPDATE':
						return (0, _core.update)(state, action.tree, action.content, action.response);
					case 'UPDATE_FRONT':
						return (0, _core.updateFront)(state, action.tree, action.content, action.response);
					case 'UPDATE_ERROR':
						return (0, _core.update)(state, action.tree, action.content, action.response);
					case 'DESTROY':
						return (0, _core.destroy)(state, action.tree, action.id);
					case 'DESTROY_ERROR':
						return (0, _core.destroy)(state, action.tree);
				}
		}
		return state;
	};
}