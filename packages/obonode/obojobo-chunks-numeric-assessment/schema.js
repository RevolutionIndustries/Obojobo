import { Block } from 'slate'

import SchemaViolations from 'obojobo-document-engine/src/scripts/oboeditor/util/schema-violations'
import { NUMERIC_ASSESSMENT_NODE, SCORE_RULE_NODE, NUMERIC_FEEDBACK_NODE } from './constant'
const { CHILD_TYPE_INVALID, CHILD_MIN_INVALID } = SchemaViolations

const schema = {
	blocks: {
		[NUMERIC_ASSESSMENT_NODE]: {
			nodes: [{ match: [{ type: SCORE_RULE_NODE }], min: 1 }],
			normalize: (editor, error) => {
				const { node, child, index } = error
				switch (error.code) {
					case CHILD_MIN_INVALID: {
						const block = Block.create({
							object: 'block',
							type: SCORE_RULE_NODE,
							nodes: [],
							data: {
								numericRule: {
									requirement: 'Exact answer',
									answerInput: '',
									startInput: '',
									endInput: '',
									marginType: 'Absolute',
									precisionType: 'Significant digits',
									score: 100
								}
							}
						})
						return editor.insertNodeByKey(node.key, index, block)
					}
					case CHILD_TYPE_INVALID: {
						const block = Block.fromJSON({
							object: 'block',
							type: SCORE_RULE_NODE,
							nodes: [],
							data: {
								numericRule: {
									requirement: 'Exact answer',
									answerInput: '',
									startInput: '',
									endInput: '',
									marginType: 'Absolute',
									precisionType: 'Significant digits',
									score: 100
								}
							}
						})
						return editor.withoutNormalizing(c => {
							c.removeNodeByKey(child.key)
							return c.insertNodeByKey(node.key, index, block)
						})
					}
				}
			}
		}
	}
}

export default schema
