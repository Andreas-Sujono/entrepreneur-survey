import React, { Component } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { saveAnswer } from '../modules/survey'
import './Survey.scss'

async function chooseAnswer(answer, props, event) {
	if (props.active) {
		event.stopPropagation()
	}
	await props.saveAnswer(answer)
	setTimeout(() => {
		props.setAndScroll(props.index + 1)
	}, 750)
}

export const Options = props => (
	<div>
		{props.options && props.options.length ? props.options.map(opt => 
			<div key={opt.id} className={classnames({'left': opt.id === 1 }, {'chosen': opt.value === props.answer} ,'options')}
			onClick={chooseAnswer.bind(this, opt.value, props)}>
				<span className="option-label">{opt.label}</span>
				{opt.text ? <span>
								<div className="line"></div>
								<span className="option-text">{opt.text}</span>
							</span> : null }
			</div>
			) : null}
	</div>
)

Options.propTypes = {
	active: React.PropTypes.bool,
	options: React.PropTypes.array.isRequired,
	answer: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	saveAnswer: React.PropTypes.func.isRequired,
	index: React.PropTypes.number.isRequired,
	setAndScroll: React.PropTypes.func.isRequired
}

class Question extends Component {
	static propTypes = {
		question: React.PropTypes.string.isRequired,
		type: React.PropTypes.string.isRequired,
		options: React.PropTypes.array,
		active: React.PropTypes.bool,
		setAndScroll: React.PropTypes.func.isRequired
	}

	render() {
		const { question, type, options, answer, saveAnswer, active, index, setAndScroll} = this.props
		let RenderedQuestion;
		switch (type) {
			case 'scale':
				RenderedQuestion = (
					<div className="question-container">
						<p className="question text-left">{question}</p>
						<Options {...{options, answer, saveAnswer, active, index}} setAndScroll={setAndScroll.bind(this)} />
					</div>
				)
				break;
		}
		return (
			<div>
				{RenderedQuestion}
			</div>
		)
	}
}

Question = connect(
	null,
	(dispatch, props) => ({
		saveAnswer: (answer) => {
			if (props.active) {
				dispatch(saveAnswer({
					questionId: props.index,
					answer: answer
				}))
			}
		}
	})
)(Question)

export default Question