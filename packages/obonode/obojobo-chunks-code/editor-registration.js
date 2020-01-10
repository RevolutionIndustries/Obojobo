import { getEventTransfer } from 'slate-react'
import { Block, Editor } from 'slate'

import Converter from './converter'
import Icon from './icon'
import KeyDownUtil from 'obojobo-document-engine/src/scripts/oboeditor/util/keydown-util'
import Line from './components/line/editor-component'
import Node from './editor-component'
import React from 'react'
import Schema from './schema'
import decreaseIndent from './changes/decrease-indent'
import emptyNode from './empty-node.json'
import increaseIndent from './changes/increase-indent'

const CODE_NODE = 'ObojoboDraft.Chunks.Code'
const CODE_LINE_NODE = 'ObojoboDraft.Chunks.Code.CodeLine'

const isType = editor => {
	return editor.value.blocks.some(block => {
		return !!editor.value.document.getClosest(block.key, parent => {
			return parent.type === CODE_NODE
		})
	})
}

const plugins = {
	// onPaste(event, editor, next) {
	// 	const isCode = isType(editor)
	// 	const transfer = getEventTransfer(event)
	// 	if (transfer.type === 'fragment' || !isCode) return next()

	// 	const saveBlocks = editor.value.blocks

	// 	editor
	// 		.createCodeLinesFromText(transfer.text.split('\n'))
	// 		.forEach(line => editor.insertBlock(line))

	// 	saveBlocks.forEach(node => {
	// 		if (node.text === '') {
	// 			editor.removeNodeByKey(node.key)
	// 		}
	// 	})
	// },
	onKeyDown(event, editor, next) {
		const [match] = Editor.nodes(editor, {
			match: n => n.type === CODE_NODE,
		})
		console.log(match)
		if (!match) return next(event)

		switch (event.key) {
			case 'Backspace':
			case 'Delete':
				KeyDownUtil.deleteEmptyParent(event, editor, next, match)
				return

			case 'Tab':
				// TAB+SHIFT
				if (event.shiftKey) return decreaseIndent(event, editor, next)

				// TAB
				return increaseIndent(event, editor, next)

			default:
				return next(event)
		}
	},
	renderNode(props) {
		switch (props.element.subtype) {
			case CODE_LINE_NODE:
				return <Line {...props} {...props.attributes} />
			default:
				return <Node {...props} {...props.attributes} />
		}
	},
}

const Code = {
	name: CODE_NODE,
	icon: Icon,
	menuLabel: 'Code',
	isInsertable: true,
	helpers: Converter,
	json: {
		emptyNode
	},
	plugins
}

export default Code
