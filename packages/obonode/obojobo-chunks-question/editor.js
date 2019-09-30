import React from 'react'
import { getEventTransfer } from 'slate-react'
import Common from 'obojobo-document-engine/src/scripts/common'

const QUESTION_NODE = 'ObojoboDraft.Chunks.Question'
const SOLUTION_NODE = 'ObojoboDraft.Chunks.Question.Solution'
const MCASSESSMENT_NODE = 'ObojoboDraft.Chunks.MCAssessment'
const CHOICE_LIST_NODE = 'ObojoboDraft.Chunks.MCAssessment.ChoiceList'

import emptyNode from './empty-node.json'
import Icon from './icon'
import Node from './editor-component'
import Solution from './components/solution/editor-component'
import Schema from './schema'
import Converter from './converter'

const plugins = {
	renderNode(props, editor, next) {
		switch (props.node.type) {
			case QUESTION_NODE:
				return <Node {...props} {...props.attributes} />
			case SOLUTION_NODE:
				return <Solution {...props} {...props.attributes} />
			default:
				return next()
		}
	},
	queries: {
		
	
	},
	schema: Schema
}

const getPasteNode = (question) => {
	// If passed a 'whole' question return the question
	// 'Whole' questions are defined as questions that contain more than one child
	// and at least one child is a MCAssessment 
	// (Ex: the user selected on node in the question body and one node in an MCAssessment)
	const mcAssess = question.nodes.filter(node => node.type === MCASSESSMENT_NODE).get(0)
	if(mcAssess && question.nodes.size > 1) return question

	// If the question is not whole, get the content nodes
	// get the index of the mc assessment
	const nodes = []

	// Get all the content nodes in the question body
	for(const node of question.nodes) {
		if(node.type === MCASSESSMENT_NODE || node.type === SOLUTION_NODE) break

		nodes.push(node)
	}

	// Extract out the content nodes in the MCAssessment
	if(mcAssess) {
		mcAssess.nodes.forEach(choiceListOrSettings => {
			if(choiceListOrSettings.type === CHOICE_LIST_NODE) {
				choiceListOrSettings.nodes.forEach(mcChoice => {
					mcChoice.nodes.forEach(ansOrFeedback => {
						ansOrFeedback.nodes.forEach(contentNode => nodes.push(contentNode))
					})
				})
			}
		})		
	}

	// Extract out the content nodes in the Solution
	const solution = question.nodes.filter(node => node.type === SOLUTION_NODE).get(0)
	if(solution) {
		solution.nodes.forEach(page => {
			page.nodes.forEach(contentNode => nodes.push(contentNode))
		})
	}

	return nodes
}

Common.Registry.registerModel('ObojoboDraft.Chunks.Question', {
	name: 'Question',
	icon: Icon,
	isInsertable: true,
	insertJSON: emptyNode,
	slateToObo: Converter.slateToObo,
	oboToSlate: Converter.oboToSlate,
	supportsChildren: true,
	plugins,
	getNavItem(model) {
		const questions = model.parent.children.models.filter(
			child => child.get('type') === 'ObojoboDraft.Chunks.Question'
		)
		const label = model.title || `Question ${questions.indexOf(model) + 1}`

		return {
			type: 'sub-link',
			label,
			path: [`#obo-${model.get('id')}`]
		}
	},
	getPasteNode
})

const Question = {
	name: QUESTION_NODE,
	components: {
		Node,
		Solution,
		Icon
	},
	helpers: {
		slateToObo: Converter.slateToObo,
		oboToSlate: Converter.oboToSlate
	},
	json: {
		emptyNode
	},
	plugins,
}

export default Question
