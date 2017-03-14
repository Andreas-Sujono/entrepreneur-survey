import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import keydown from 'react-keydown'
import Scroll from 'react-scroll'
import classes from './Survey.scss'
import Question from './Question'
import { fetchQuestions, selectActiveQuestion, saveAnswer, submitAnswers } from '../modules/survey'
import Waypoint from 'react-waypoint'
const Element = Scroll.Element
const scroll = Scroll.scroller

class Survey extends Component {
	static propTypes = {
		questions: React.PropTypes.array,
		activeQuestionId: React.PropTypes.number.isRequired,
		fetchQuestions: React.PropTypes.func.isRequired,
		selectActiveQuestion: React.PropTypes.func.isRequired,
		saveAnswer: React.PropTypes.func.isRequired
	}

	ensureActiveQuestionVisible(name, smooth=true) {
		scroll.scrollTo(String(name), {
			duration: 500,
			smooth: smooth,
			offset: -(window.innerHeight/2)+100,
			ignoreCancelEvents: true
		})
	}

	async handleKeyDown(event) {
		if (['ArrowRight', 'ArrowDown', 'Enter'].includes(event.key)) {
			await this.props.selectActiveQuestion(this.props.activeQuestionId + 1)
		}
		else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
			await this.props.selectActiveQuestion(this.props.activeQuestionId - 1)
		} else {
			const activeQuestions = this.props.questions.filter(qn => qn.index === this.props.activeQuestionId)
			if (activeQuestions.length) {
				this.handleQuestionKeydown(event, activeQuestions[0])
			}
		}
		this.ensureActiveQuestionVisible(this.props.activeQuestionId)
	}

	async handleQuestionKeydown(event, activeQuestion) {
		switch (activeQuestion.type) {
			case 'scale':
				const keys = activeQuestion.options.map(opt => String(opt.label))
				const index = keys.indexOf(event.key)
				if (index > -1) {
					await this.props.saveAnswer(activeQuestion.options[index].value)
					setTimeout(this.setAndScroll.bind(this, this.props.activeQuestionId + 1), 750)
				}
		}
	}

	async setAndScroll(qnId) {
		await this.props.selectActiveQuestion(qnId)
		this.ensureActiveQuestionVisible(this.props.activeQuestionId)
	}

	componentWillMount() {
		if (this.props.questions.length === 0) {
			this.props.fetchQuestions()
		}
	}

	componentDidMount() {
		if (this.props.questions.length) {
			this.ensureActiveQuestionVisible(this.props.activeQuestionId, false)
		}
	}

	componentWillReceiveProps({keydown}) {
		if (keydown.event && this.props.keydown.event !== keydown.event) {
			this.handleKeyDown(keydown.event)
		}
	}

	componentWillUnmount() {
		this.props.submitAnswers(this.props.questions.map(qn => ({
				questionId: qn.id,
				answer: qn.answer
			})
		))
	}

	render() {
		const { questions, activeQuestionId, selectActiveQuestion } = this.props
		const handleKeyPress = this.handleKeyPress
		return (
			<div>
				<h1>Questions</h1>
				<br /><br /><br /><br /><br /><br />
				{questions.length ?
					questions.map((qn, index) => {
						qn.index = index
						return <Element name={String(index)} key={index} className={classnames({'inactive': index !== activeQuestionId})}>
								<Waypoint onEnter={this.props.selectActiveQuestion.bind(this, index)} topOffset="40%" bottomOffset="25%">
									<div onClick={this.setAndScroll.bind(this, index)}><Question {...qn} active={index === activeQuestionId} setAndScroll={this.setAndScroll.bind(this)} /></div>
								</Waypoint>
							</Element>
					})
					: null
				}
			</div>
		)
	}
}

Survey = connect(
	(state) => ({
		questions: state.survey.questions,
		activeQuestionId: state.survey.activeQuestionId
	}),
	{
		fetchQuestions,
		selectActiveQuestion,
		submitAnswers,
		saveAnswer
	},
	(stateProps, dispatchProps, ownProps) => ({
		...ownProps,
		...stateProps,
		...dispatchProps,
		saveAnswer: (answer) => {
			dispatchProps.saveAnswer({
				questionId: stateProps.activeQuestionId,
				answer: answer
			})
		}
	})
)(Survey)

export default keydown('up', 'down', 'right', 'left', 'enter', '1','2','3','4','5','a','b','c','d','e')(Survey)