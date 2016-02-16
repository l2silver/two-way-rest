import * as twoWayReducers from './reducers';
import * as twoWayCreators from './creators';
import * as twoWayComponents from './components';
import * as twoWayComponentHelpers from './componentHelpers';
import * as twoWayFetch from './fetch';
import * as twoWayCore from './core';

export default Object.assign(twoWayCore
	, twoWayReducers
	, twoWayCreators
	, twoWayFetch
	, twoWayCore
	, twoWayComponents
	, twoWayComponentHelpers
);