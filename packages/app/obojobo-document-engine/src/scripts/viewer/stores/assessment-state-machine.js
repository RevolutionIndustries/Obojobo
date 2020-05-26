import { Machine, interpret, assign } from 'xstate'

import APIUtil from '../util/api-util'
import Common from 'Common'
import NavStore from '../stores/nav-store'
import AssessmentNetworkStates from './assessment-store/assessment-network-states'
import AssessmentStateActions from './assessment-store/assessment-state-actions'
import NavUtil from '../util/nav-util'

import AssessmentScoreReportView from '../assessment/assessment-score-report-view'
import AssessmentScoreReporter from '../assessment/assessment-score-reporter'
import AssessmentUtil from '../util/assessment-util'
import CurrentAssessmentStates from '../util/current-assessment-states'
import FocusUtil from '../util/focus-util'
import LTINetworkStates from './assessment-store/lti-network-states'
import LTIResyncStates from './assessment-store/lti-resync-states'
import QuestionStore from './question-store'
import QuestionUtil from '../util/question-util'
import React from 'react'

const QUESTION_NODE_TYPE = 'ObojoboDraft.Chunks.Question'

const { OboModel } = Common.models
const { ErrorUtil, ModalUtil } = Common.util
const { Dispatcher } = Common.flux
const { SimpleDialog, Dialog } = Common.components.modal

const {
	PROMPTING_FOR_RESUME,
	STARTING_ATTEMPT,
	RESUMING_ATTEMPT,
	IN_ATTEMPT,
	START_ATTEMPT_FAILED,
	RESUME_ATTEMPT_FAILED,
	SENDING_RESPONSES,
	SEND_RESPONSES_SUCCESSFUL,
	SEND_RESPONSES_FAILED,
	NOT_IN_ATTEMPT,
	ENDING_ATTEMPT,
	END_ATTEMPT_FAILED,
	END_ATTEMPT_SUCCESSFUL,
	PROMPTING_FOR_IMPORT,
	IMPORTING_ATTEMPT,
	IMPORT_ATTEMPT_FAILED,
	IMPORT_ATTEMPT_SUCCESSFUL
} = AssessmentNetworkStates

const {
	START_ATTEMPT,
	PROMPT_FOR_IMPORT,
	PROMPT_FOR_RESUME,
	IMPORT_ATTEMPT,
	RESUME_ATTEMPT,
	SEND_RESPONSES,
	ACKNOWLEDGE,
	END_ATTEMPT,
	CONTINUE_ATTEMPT
	// RETRY
} = AssessmentStateActions

class AssessmentStateHelpers {
	static async startAttempt(assessmentId) {
		console.log('startATtempt', assessmentId)
		return this.onRequest(
			await this.sendStartAttemptRequest(assessmentId),
			this.onAttemptStarted.bind(this)
		)
	}

	static async resumeAttempt(draftId, attemptId) {
		return this.onRequest(
			await this.sendResumeAttemptRequest(draftId, attemptId),
			this.onAttemptStarted.bind(this)
		)
	}

	static sendResponses(assessmentId, attemptId) {
		return new Promise((resolve, reject) => {
			const listener = ({ value }) => {
				Dispatcher.off('question:forceSentAllResponses', listener)

				if (value.success) {
					resolve()
				} else {
					reject()
				}
			}

			Dispatcher.on('question:forceSentAllResponses', listener)
			QuestionUtil.forceSendAllResponsesForContext(
				this.composeNavContextString(assessmentId, attemptId)
			)
		})
	}

	static async endAttempt(draftId, attemptId) {
		return this.onRequest(
			await this.sendEndAttemptRequest(draftId, attemptId),
			this.onAttemptEnded.bind(this)
		)
	}

	static async sendStartAttemptRequest(assessmentId) {
		const model = OboModel.models[assessmentId]

		return await APIUtil.startAttempt({
			draftId: model.getRoot().get('draftId'),
			assessmentId: model.get('id'),
			visitId: NavStore.getState().visitId
		})
	}

	static async sendResumeAttemptRequest(draftId, attemptId) {
		return await APIUtil.resumeAttempt({
			draftId,
			attemptId,
			visitId: NavStore.getState().visitId
		})
	}

	static async sendEndAttemptRequest(draftId, attemptId) {
		return await APIUtil.endAttempt({
			attemptId,
			draftId,
			visitId: NavStore.getState().visitId
		})
	}

	static async onRequest(res, successFn) {
		if (res.status !== 'ok') {
			return this.onError(res)
		}

		return successFn(res)
	}

	static async onError(res = null) {
		if (res) {
			switch (res.value.message.toLowerCase()) {
				case 'attempt limit reached':
					ErrorUtil.show(
						'No attempts left',
						'You have attempted this assessment the maximum number of times available.'
					)
					break

				default:
					ErrorUtil.errorResponse(res)
					break
			}
		}

		throw Error('Request failed')
	}

	static onAttemptStarted(res) {
		const assessment = res.value
		const assessmentId = assessment.assessmentId
		const assessmentModel = OboModel.models[assessmentId]

		this.setAssessmentQuestionBank(assessmentModel, assessment.questions)
		this.updateNavContextAndMenu(assessmentModel, assessment.attemptId)
		this.signalAttemptStarted(assessmentModel)

		// Return the response so that the assessment data can be added to the context
		return res
	}

	static setAssessmentQuestionBank(assessmentModel, questions) {
		const qb = assessmentModel.children.at(1)

		qb.children.reset()
		Array.from(questions).forEach(child => qb.children.add(OboModel.create(child)))
	}

	static updateNavContextAndMenu(assessmentModel, attemptId) {
		const assessmentId = assessmentModel.get('id')

		NavUtil.setContext(this.composeNavContextString(assessmentId, attemptId))
		NavUtil.rebuildMenu(assessmentModel.getRoot())
		NavUtil.goto(assessmentId)
	}

	static signalAttemptStarted(assessmentModel) {
		const assessmentId = assessmentModel.get('id')

		assessmentModel.processTrigger('onStartAttempt')
		Dispatcher.trigger('assessment:attemptStarted', assessmentId)
	}

	static onAttemptEnded(res) {
		/*
		example response
		{
			"status": "ok",
			"value": {
				"assessmentId": "my-assessment",
				"attempts": [
					{
						"userId": "1",
						"draftId": "00000000-0000-0000-0000-000000000000",
						"contentId": "b156af29-faf5-4c61-a035-1cc33d8f1bf5",
						"attemptId": "d9b51660-60f4-4e13-a877-9c8339d3ecd8",
						"assessmentScoreId": "6",
						"attemptNumber": 1,
						"assessmentId": "my-assessment",
						"startTime": "2020-05-15T20:12:07.163Z",
						"finishTime": "2020-05-15T21:11:45.301Z",
						"isFinished": true,
						"state": {
							"chosen": [
								{
									"id": "e32101dd-8f0e-4bec-b519-968270efb426",
									"type": "ObojoboDraft.Chunks.Question"
								},
								{
									"id": "f1ebeb0e-606f-4d1e-b8b9-2ba4fbfbfa0f",
									"type": "ObojoboDraft.Chunks.Question"
								},
								{
									"id": "fa4c4db0-30f1-4386-9ce9-956aaf228378",
									"type": "ObojoboDraft.Chunks.Question"
								},
								{
									"id": "5345c7c6-ac69-4e9f-80da-6037765fa612",
									"type": "ObojoboDraft.Chunks.QuestionBank"
								},
								{
									"id": "af4ea08a-e488-4156-a2a0-c0f9a64c58eb",
									"type": "ObojoboDraft.Chunks.QuestionBank"
								}
							]
						},
						"questionScores": [
							{
								"id": "e32101dd-8f0e-4bec-b519-968270efb426",
								"score": 0
							},
							{
								"id": "f1ebeb0e-606f-4d1e-b8b9-2ba4fbfbfa0f",
								"score": 0
							},
							{
								"id": "fa4c4db0-30f1-4386-9ce9-956aaf228378",
								"score": 0
							}
						],
						"responses": [],
						"attemptScore": 0,
						"assessmentScore": 0,
						"assessmentScoreDetails": {
							"status": "passed",
							"rewardTotal": 0,
							"attemptScore": 0,
							"rewardedMods": [],
							"attemptNumber": 1,
							"assessmentScore": 0,
							"assessmentModdedScore": 0
						}
					}
				],
				"ltiState": null
			}
		}

		*/
		const assessment = this.getInternalAssessmentObjectFromResponse(res.value)
		const attempts = assessment.attempts //res.value.attempts
		const lastAttempt = attempts[attempts.length - 1]
		const { assessmentId, attemptId, attemptNumber } = lastAttempt
		const assessmentModel = OboModel.models[assessmentId]
		const navContext = this.composeNavContextString(assessmentId, attemptId)

		// this.hideQuestions(lastAttempt.state.chosen, navContext)
		// debugger "hello past me, i was here. lastAttempt.currentResponses doesnt exist, it on the context version. but is this really a good idea in the first place? anyway, i need a way to clear responses. maybe what i do is just have the helper send the request, then the onDone handles all the cleanup"
		// this.clearResponses(lastAttempt.currentResponses, navContext)
		this.signalAttemptEnded(assessmentModel)
		this.showReportDialog(assessmentModel, attempts, attemptNumber)
		this.updateStateByContextForAttempt(assessment.attempts[assessment.attempts.length - 1])

		return assessment
	}

	static updateStateByContextForAttempt(attempt) {
		const scores = {}
		attempt.questionScores.forEach(scoreData => {
			scores[scoreData.id] = scoreData
		})
		const stateToUpdate = {
			scores,
			responses: attempt.responses
		}

		QuestionStore.updateStateByContext(stateToUpdate, `assessmentReview:${attempt.attemptId}`)
	}

	// static hideQuestions(chosenQuestions, navContext) {
	// 	chosenQuestions.forEach(question => {
	// 		if (question.type !== QUESTION_NODE_TYPE) {
	// 			return
	// 		}

	// 		QuestionUtil.hideQuestion(question.id, navContext)
	// 	})
	// }

	// static clearResponses(responses, navContext) {
	// 	responses.forEach(questionId => QuestionUtil.clearResponse(questionId, navContext))
	// }

	static getReportForAttempt(assessmentModel, allAttempts, attemptNumber) {
		const reporter = new AssessmentScoreReporter({
			assessmentRubric: assessmentModel.modelState.rubric.toObject(),
			totalNumberOfAttemptsAllowed: assessmentModel.modelState.attempts,
			allAttempts
		})

		return reporter.getReportFor(attemptNumber)
	}

	static signalAttemptEnded(assessmentModel) {
		assessmentModel.processTrigger('onEndAttempt')
		Dispatcher.trigger('assessment:attemptEnded', assessmentModel.get('id'))
	}

	static showReportDialog(assessmentModel, allAttempts, attemptNumber) {
		const assessmentLabel = NavUtil.getNavLabelForModel(NavStore.getState(), assessmentModel)

		ModalUtil.show(
			<Dialog
				modalClassName="obojobo-draft--sections--assessment--results-modal"
				centered
				buttons={[
					{
						value: `Show ${assessmentLabel} Overview`,
						onClick: this.onCloseResultsDialog.bind(this),
						default: true
					}
				]}
				title={`Attempt ${attemptNumber} Results`}
				width="35rem"
			>
				<AssessmentScoreReportView
					report={this.getReportForAttempt(assessmentModel, allAttempts, attemptNumber)}
				/>
			</Dialog>
		)
	}

	static onCloseResultsDialog() {
		ModalUtil.hide()
		FocusUtil.focusOnNavTarget()
	}

	static composeNavContextString(assessmentId, attemptId) {
		return `assessment:${assessmentId}:${attemptId}`
	}

	// Converts the assessmentResponse return value to an object that Obojobo can more easily use!
	static getInternalAssessmentObjectFromResponse(assessmentResponse) {
		const attempts = assessmentResponse.attempts

		const getLastOf = array => {
			return array && array.length > 0 ? array[array.length - 1] : null
		}

		return {
			lti: assessmentResponse.ltiState,
			highestAttemptScoreAttempts: AssessmentUtil.findHighestAttempts(attempts, 'attemptScore'),
			highestAssessmentScoreAttempts: AssessmentUtil.findHighestAttempts(
				attempts,
				'assessmentScore'
			),
			unfinishedAttempt: getLastOf(attempts.filter(attempt => !attempt.isFinished)),
			attempts: attempts
				.filter(attempt => attempt.isFinished)
				.map(attempt => {
					// Server returns responses in an array, but we use a object keyed by the questionId:
					if (!Array.isArray(attempt.responses)) {
						return attempt
					}

					const responsesById = {}
					attempt.responses.forEach(r => {
						responsesById[r.id] = r.response
					})

					return { ...attempt, responses: responsesById }
				})
		}
	}
}

const todo = () => {}

const updateContextWithAssessmentResponse = assign({
	// When the src function is completed the results will be
	// put into event.data. It will then call this action. assign() will
	// set the contents of event.data into this machine's context,
	// therefore making context.currentAttempt = the attempt data
	// returned by AssessmentStateHelpers.startAttempt

	assessment: (context, event) => {
		context.assessment.current = event.data.value
		return context.assessment
	}
})

class AssessmentStateMachine {
	constructor(assessmentObject) {
		//eslint-disable-next-line new-cap
		this.machine = Machine({
			id: 'assessment',
			initial: NOT_IN_ATTEMPT,
			context: {
				assessment: assessmentObject
				// forceSentAllResponsesListener: null
			},
			states: {
				[NOT_IN_ATTEMPT]: {
					on: {
						[START_ATTEMPT]: STARTING_ATTEMPT,
						[PROMPT_FOR_IMPORT]: PROMPTING_FOR_IMPORT,
						[PROMPT_FOR_RESUME]: PROMPTING_FOR_RESUME
					}
				},
				[STARTING_ATTEMPT]: {
					invoke: {
						id: 'startAttempt',
						src: async context => {
							return await AssessmentStateHelpers.startAttempt(context.assessment.id)
						},
						onDone: {
							target: IN_ATTEMPT,
							actions: [updateContextWithAssessmentResponse]
						},
						onError: START_ATTEMPT_FAILED
					}
				},
				[PROMPTING_FOR_IMPORT]: {
					on: {
						[START_ATTEMPT]: STARTING_ATTEMPT,
						[IMPORT_ATTEMPT]: IMPORTING_ATTEMPT
					}
				},
				[IMPORTING_ATTEMPT]: {
					invoke: {
						id: 'importAttempt',
						src: todo,
						onDone: IN_ATTEMPT,
						onError: IMPORT_ATTEMPT_FAILED
					}
				},
				[PROMPTING_FOR_RESUME]: {
					on: {
						[RESUME_ATTEMPT]: RESUMING_ATTEMPT
					}
				},
				[RESUMING_ATTEMPT]: {
					invoke: {
						id: 'resumeAttempt',
						src: async context => {
							const { draftId, attemptId } = context.assessment.unfinishedAttempt
							return await AssessmentStateHelpers.resumeAttempt(draftId, attemptId)
						},
						onDone: {
							target: IN_ATTEMPT,
							actions: updateContextWithAssessmentResponse
						},
						onError: RESUME_ATTEMPT_FAILED
					}
				},
				[IN_ATTEMPT]: {
					on: {
						[SEND_RESPONSES]: SENDING_RESPONSES
					}
				},
				[START_ATTEMPT_FAILED]: {
					on: {
						[ACKNOWLEDGE]: NOT_IN_ATTEMPT
					}
				},
				[IMPORT_ATTEMPT_FAILED]: {
					on: {
						[ACKNOWLEDGE]: NOT_IN_ATTEMPT
					}
				},
				[RESUME_ATTEMPT_FAILED]: {
					on: {
						[ACKNOWLEDGE]: PROMPTING_FOR_RESUME
					}
				},
				[SENDING_RESPONSES]: {
					invoke: {
						id: 'sendingResponses',
						src: async context => {
							const { assessmentId, attemptId } = context.assessment.current
							return await AssessmentStateHelpers.sendResponses(assessmentId, attemptId)
						},
						onDone: SEND_RESPONSES_SUCCESSFUL,
						onError: SEND_RESPONSES_FAILED
					}
				},
				[SEND_RESPONSES_SUCCESSFUL]: {
					on: {
						[END_ATTEMPT]: ENDING_ATTEMPT,
						[CONTINUE_ATTEMPT]: IN_ATTEMPT
					}
				},
				[SEND_RESPONSES_FAILED]: {
					on: {
						retry: SENDING_RESPONSES,
						[CONTINUE_ATTEMPT]: IN_ATTEMPT
					}
				},
				[ENDING_ATTEMPT]: {
					invoke: {
						id: 'endAttempt',
						src: async context => {
							const { assessmentId, attemptId } = context.assessment.current
							const draftId = OboModel.models[assessmentId].getRoot().get('draftId')

							return await AssessmentStateHelpers.endAttempt(draftId, attemptId)
						},
						onDone: {
							target: END_ATTEMPT_SUCCESSFUL,
							actions: [
								assign({
									assessment: (context, event) => {
										context.assessment.attempts = event.data.attempts
										context.assessment.highestAssessmentScoreAttempts =
											event.data.highestAssessmentScoreAttempts
										context.assessment.highestAttemptScoreAttempts =
											event.data.highestAttemptScoreAttempts
										context.assessment.lti = event.data.lti
										context.assessment.unfinishedAttempt = event.data.unfinishedAttempt
										context.assessment.current = null
										// context.assessment = { ...context.assessment, ...event.data, current: null }

										return context.assessment
									}
								})
							]
						},
						onError: END_ATTEMPT_FAILED
					}
				},
				[END_ATTEMPT_SUCCESSFUL]: {
					on: {
						[ACKNOWLEDGE]: NOT_IN_ATTEMPT
					}
				},
				[END_ATTEMPT_FAILED]: {
					on: {
						[CONTINUE_ATTEMPT]: IN_ATTEMPT
					}
				}
			}
		})

		this.service = interpret(this.machine)
	}

	send(action) {
		this.service.send(action)
	}

	getCurrentState() {
		return this.service.state.value
	}

	start(onTransition) {
		this.service.start()
		this.service.onTransition((state, oldValues) => {
			if (!state.changed) {
				return
			}

			onTransition(this, state, oldValues)
		})
	}

	stop() {
		this.service.stop()
	}

	// startAttempt() {
	// 	this.service.send('startAttempt')
	// }
}

export default AssessmentStateMachine
