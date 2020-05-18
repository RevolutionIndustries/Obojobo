import React from 'react'
import { Node, Element, Transforms, Text, Editor } from 'slate'
import Common from 'obojobo-document-engine/src/scripts/common'
import NormalizeUtil from 'obojobo-document-engine/src/scripts/oboeditor/util/normalize-util'

import EditorComponent from './editor-component'
import Converter from './converter'

const CHOICE_NODE = 'ObojoboDraft.Chunks.AbstractAssessment.Choice'
const FEEDBACK_NODE = 'ObojoboDraft.Chunks.AbstractAssessment.Feedback'
const TEXT_NODE = 'ObojoboDraft.Chunks.Text'

const Feedback = {
	name: FEEDBACK_NODE,
	menuLabel: 'Feedback',
	isInsertable: false,
	supportsChildren: true,
	helpers: Converter,
	plugins: {
		// Editor Plugins - These get attached to the editor object and override it's default functions
		// They may affect multiple nodes simultaneously
		normalizeNode(entry, editor, next) {
			const [node, path] = entry

			// If the element is a Feedback, only allow Content children
			if (Element.isElement(node) && node.type === FEEDBACK_NODE) {
				for (const [child, childPath] of Node.children(editor, path)) {
					if (Element.isElement(child) && !Common.Registry.contentTypes.includes(child.type)) {
						Transforms.removeNodes(editor, { at: childPath })
						console.log('removing nodes')
						return
					}

					// Wrap loose text children in a Text Node
					if (Text.isText(child)) {
						console.log('wrapping in text')
						Transforms.wrapNodes(
							editor, 
							{
								type: TEXT_NODE,
								content: { indent: 0 }
							},
							{ at: childPath }
						)
						return
					}
				}

				// Feedback parent normalization
				// Note - collect up an adjacent Answer (of any type), if it exists
				const [parent] = Editor.parent(editor, path)
				if(!Element.isElement(parent) || !parent.type.includes('Choice')) {
					NormalizeUtil.wrapOrphanedSiblings(
						editor, 
						entry, 
						{ 
							type: CHOICE_NODE, 
							content: {},
							children: []
						}, 
						node => node.type.includes('Answer')
					)
					return
				}
			}

			console.log('onward')

			next(entry, editor)
		},
		// Editable Plugins - These are used by the PageEditor component to augment React functions
		// They affect individual nodes independently of one another
		renderNode(props) {
			return <EditorComponent {...props} {...props.attributes} />
		}
	}
}

export default Feedback
