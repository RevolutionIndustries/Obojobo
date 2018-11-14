import './viewer-component.scss'

import React from 'react'
import katex from 'katex'

import Common from 'Common'
import Viewer from 'Viewer'

const { OboComponent } = Viewer.components
const { NonEditableChunk } = Common.chunk

const getLatexHtml = function(latex) {
	try {
		const html = katex.renderToString(latex, { displayMode: true })
		return { html }
	} catch (e) {
		return { error: e }
	}
}

const MathEquation = props => {
	let katexHtml = getLatexHtml(props.model.modelState.latex)
	if (katexHtml.error) {
		katexHtml = ''
	} else {
		katexHtml = katexHtml.html
	}

	if (katexHtml.length === 0) {
		return null
	}

	return (
		<OboComponent
			model={props.model}
			moduleData={props.moduleData}
			className={`obojobo-draft--chunks--math-equation pad align-${props.model.modelState.align}`}
			aria-label={props.model.modelState.alt}
		>
			<NonEditableChunk>
				{props.model.modelState.label === '' ? null : (
					<div className="for-screen-reader-only">{'Equation ' + props.model.modelState.label}</div>
				)}
				<div
					className="katex-container"
					style={{ fontSize: props.model.modelState.size }}
					dangerouslySetInnerHTML={{ __html: katexHtml }}
				/>
				{props.model.modelState.label === '' ? null : (
					<div className="equation-label" aria-hidden="true">
						{props.model.modelState.label}
					</div>
				)}
			</NonEditableChunk>
		</OboComponent>
	)
}

export default MathEquation
