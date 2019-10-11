import './editor-nav.scss'
// relies on styles from viewer
import '../../../viewer/components/nav.scss'

import Common from 'obojobo-document-engine/src/scripts/common'
import EditorUtil from '../../util/editor-util'
import MoreInfoBox from './more-info-box'
import React from 'react'
import SubMenu from './sub-menu'
import isOrNot from 'obojobo-document-engine/src/scripts/common/util/isornot'
import generatePage from '../../documents/generate-page'
import generateAssessment from '../../documents/generate-assessment'

const { Prompt } = Common.components.modal
const { ModalUtil } = Common.util

const { OboModel } = Common.models

class EditorNav extends React.Component {
	constructor(props) {
		super(props)
		this.state = this.props.navState

		// optimization - bind once instead of every render
		this.showAddPageModal = this.showAddPageModal.bind(this)
		this.showAddAssessmentModal = this.showAddAssessmentModal.bind(this)
		this.addAssessment = this.addAssessment.bind(this)
		this.addPage = this.addPage.bind(this)
		this.updateNavTargetId = this.updateNavTargetId.bind(this)
	}

	onNavItemClick(item) {
		EditorUtil.gotoPath(item.fullPath)
		this.setState({ navTargetId: item.id })
	}

	renderLabel(label) {
		return <span>{label}</span>
	}

	renderHeading(index, item, list) {
		const model = OboModel.models[item.id]

		const contentDescription = [
			{
				name: 'title',
				description: 'Title',
				type: 'input'
			},
			{
				name: 'start',
				description: 'Start Page',
				type: 'select',
				values: list.filter(item => item.type === 'link').map(item => ({
					value: item.id,
					description: item.label
				}))
			}
		]

		return (
			<li key={index} className={'heading is-not-selected'}>
				{this.renderLabel(item.label)}
				<MoreInfoBox
					id={item.id}
					type={model.get('type')}
					content={model.get('content')}
					saveId={this.saveId}
					saveContent={this.saveContent}
					savePage={this.props.savePage}
					contentDescription={contentDescription}
					deleteNode={this.showDeleteModal}
					duplicateNode={this.duplicatePage}
					markUnsaved={this.props.markUnsaved}/>
			</li>
		)
	}

	showAddAssessmentModal() {
		ModalUtil.show(
			<Prompt
				title="Add Assessment"
				message="Enter the title for the new assessment:"
				onConfirm={this.addAssessment}
			/>
		)
	}

	addAssessment(name = 'Assessment') {
		ModalUtil.hide()

		const newAssessment = generateAssessment()
		newAssessment.content.title = this.isWhiteSpace(name) ? 'Assessment' : name
		EditorUtil.addAssessment(newAssessment)
		return this.setState({ navTargetId: newAssessment.id })
	}

	showAddPageModal() {
		ModalUtil.show(
			<Prompt
				title="Add Page"
				message="Enter the title for the new page:"
				onConfirm={this.addPage}
			/>
		)
	}

	addPage(title = null) {
		ModalUtil.hide()

		const newPage = generatePage()
		newPage.content.title = this.isWhiteSpace(title) ? null : title
		EditorUtil.addPage(newPage)
		this.setState({ navTargetId: newPage.id })
	}

	isWhiteSpace(str) {
		return !/[\S]/.test(str)
	}

	renderAddAssessmentButton() {
		return (
			<button className={'add-node-button'} onClick={this.showAddAssessmentModal}>
					+ Add Assessment
			</button>
		)
	}

	updateNavTargetId(itemId) {
		this.setState({ navTargetId: itemId })
	}

	renderItems(list) {
		// If there are no pages in the nav list, add a placeholder item
		// The placeholder will render an Add Page button
		if(list
			.filter(item => item.type === 'no-pages' || (item.type !== 'heading' && !item.flags.assessment))
			.length < 1) {

			list.splice(1,0, {
				type: 'no-pages'
			})
		}

		return list.map((item, index) => {
			switch(item.type){
				case 'heading': 
					return this.renderHeading(index, item, list)
				case 'link':
					return (
						<SubMenu
							key={index}
							index={index}
							isSelected={this.state.navTargetId === item.id}
							list={list}
							onClick={this.onNavItemClick.bind(this, item)}
							savePage={this.props.savePage}
							markUnsaved={this.props.markUnsaved}
							updateNavTargetId={this.updateNavTargetId}/>
					)
				case 'no-pages':
					return (
						<li key="1" className="no-pages-item">
							<button 
								className="add-node-button"
								onClick={this.showAddPageModal}>
								+ Page
							</button>
						</li>
					)
				default:
					return null
			}
		})
	}

	render() {
		const className =
			'visual-editor--draft-nav ' +
			isOrNot(this.state.locked, 'locked') +
			isOrNot(this.state.open, 'open') +
			isOrNot(!this.state.disabled, 'enabled')

		const list = EditorUtil.getOrderedList(this.props.navState)

		const containsAssessment = list.filter(item => item.flags && item.flags.assessment).length > 0

		return (
			<div className={className}>
				<ul>
					{this.renderItems(list)}
				</ul>
				{!containsAssessment ? this.renderAddAssessmentButton() : null}
			</div>
		)
	}
}

export default EditorNav
