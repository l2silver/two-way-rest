import {findDOMNode} from 'react-dom'
export function triggerSubmit(form){
	findDOMNode(form).dispatchEvent(new Event('submit'));
}