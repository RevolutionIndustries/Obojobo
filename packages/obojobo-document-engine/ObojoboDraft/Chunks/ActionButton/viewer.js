import adapter from './adapter'
import ViewerComponent from './viewer-component'
import Common from 'Common'
//import EditorStore from '../../../src/scripts/oboeditor'

const SelectionHandler = Common.chunk.textChunk.TextGroupSelectionHandler

Common.Store.registerModel('ObojoboDraft.Chunks.ActionButton', {
	type: 'chunk',
	adapter: adapter,
	componentClass: ViewerComponent,
	selectionHandler: new SelectionHandler()
})

//console.log(EditorStore)
