import React, {Component} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {saveAnswer, saveAnswerError, addOption} from '../modules/survey'
import {SimpleSelect} from 'react-selectize'
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
export const VerticalOptions = props => (
  <div className="vertical-option-container">
    {props.options && props.options.length ? props.options.map(opt =>
        <div key={opt.id}
             className={classnames('left', {'chosen': opt.value === props.answer}, 'options')}
             onClick={chooseAnswer.bind(this, opt.value, props)}>
          <span className="option-key">{opt.id}</span>
          <span className="option-label">{opt.label}</span>
        </div>
      ) : null}
  </div>
)

VerticalOptions.propTypes = {
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

export const HorizontalOptions = props => (
  <div className="horizontal-option-container">
    {props.options && props.options.length ? props.options.map(opt =>
        <div key={opt.id}
             className={classnames({'left': opt.id === 1}, {'chosen': opt.value === props.answer}, 'options')}
             onClick={chooseAnswer.bind(this, opt.value, props)}>
          <span className="option-key">{opt.id}</span>
          <span className="option-label">{opt.label}</span>
          {opt.text ? <span>
								<div className="line"></div>
								<span className="option-text">{opt.text}</span>
							</span> : null }
        </div>
      ) : null}
  </div>
)

HorizontalOptions.propTypes = {
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
    setAndScroll: React.PropTypes.func.isRequired,
    saveAnswerError: React.PropTypes.func.isRequired,
    regex: React.PropTypes.string,
    error: React.PropTypes.bool,
    errorMessage: React.PropTypes.string,
    activeQuestionId: React.PropTypes.number
  }

  componentDidUpdate(prevProps) {
    if (this.refs.input) {
      if (prevProps.active && !this.props.active) {
        this.refs.input.blur()
      }
    }
  }

  validateAnswer(answer, regex) {
    const re = new RegExp(regex)
    return re.test(answer)
  }

  handleKeyDown(event) {
    if (['Enter', 'ArrowDown'].includes(event.key)) {
      this.props.setAndScroll(this.props.index + 1)
    } else if (event.key === 'ArrowUp') {
      this.props.setAndScroll(this.props.index - 1)
    }
  }

  handleInput(e) {
    this.props.saveAnswer(e.target.value)
    this.props.saveAnswerError(!this.validateAnswer(e.target.value, this.props.regex))
  }

  async handleDropDownSelect(selection) {
    if (selection) {
      if (selection.newOption && this.props.options.findIndex(opt => opt.value === selection.value) === -1) {
        await this.props.addOption(selection)
      }
      this.props.saveAnswer(selection.value)
      this.props.setAndScroll(this.props.index + 1)
    }
  }

  render() {
    const {question, type, options, answer='', saveAnswer, active, index, setAndScroll, error,
      errorMessage='Please enter a valid answer'} = this.props
    let RenderedQuestion;
    switch (type) {
      case 'scale':
        RenderedQuestion = (
          <HorizontalOptions {...{options, answer, saveAnswer, active, index}} setAndScroll={setAndScroll.bind(this)}/>
        )
        break
      case 'mcq':
        RenderedQuestion = (
          <VerticalOptions {...{options, answer, saveAnswer, active, index}} setAndScroll={setAndScroll.bind(this)}/>
        )
        break
      case 'input':
        RenderedQuestion = (
          <div>
            <input className="borderless-input" onKeyDown={this.handleKeyDown.bind(this)}
                   value={answer}
                   onChange={this.handleInput.bind(this)}
                   ref="input"/>
            {error ? (
                answer ? <p className="message alert alert-danger">{errorMessage}</p> :
                  <p className="message alert alert-danger">Please don't leave your answer blank</p>
              )
              : <p className="message alert alert-info">Press <u>Enter</u> when done</p> }
          </div>
        )
        break
      case 'dropdown':
        const selectedOption = options.filter(opt => opt.value === answer)[0]
        RenderedQuestion = (
            <SimpleSelect className="borderless-input" ref="input" options={options} theme="material"
                          renderResetButton={() => (<div></div>)}
                          value={selectedOption} onValueChange={this.handleDropDownSelect.bind(this)}>
            </SimpleSelect>
        )
        break
      case 'dropdown-others':
        const selectedOption2 = options.filter(opt => opt.value === answer)[0]
        RenderedQuestion = (
            <SimpleSelect className="borderless-input" ref="input" options={options} theme="material"
                          renderResetButton={() => (<div></div>)}
                          createFromSearch={(options, search) => ({label: search, value: search})}
                          renderOption={(arg) =>{
                            var label, newOption, selectable, isSelectable
                            if (arg != null) {
                              label = arg.label, newOption = arg.newOption, selectable = arg.selectable
                            }
                            isSelectable = (typeof selectable === 'undefined' || selectable) && (label)
                            return (
                              <div className={"simple-option " + (isSelectable ? '' : 'not-selectable')}>
                                <span>{!!newOption ? (!!label? "Others: " + label : "Others: Type in your answer") : label}</span>
                              </div>
                            )
                          }}
                          value={selectedOption2} onValueChange={this.handleDropDownSelect.bind(this)}>
            </SimpleSelect>
        )
        break
    }
    return (
      <div className={classnames('question-container', {'error-question': error}, {'short-question': ['input'].includes(type)},
        {'tall-question': type === 'mcq' && options.length > 5})}>
        <p className="question text-left">{question}</p>
        {RenderedQuestion}
      </div>
    )
  }
}

Question = connect(
  null,
  (dispatch, props) => ({
    saveAnswer: answer => {
      if (props.active) {
        dispatch(saveAnswer({
          questionId: props.index,
          answer: answer
        }))
      }
    },
    saveAnswerError: error => {
      if (props.active) {
        dispatch(saveAnswerError({
          questionId: props.index,
          error: error
        }))
      }
    },
    addOption: option => {
      if (props.active) {
        dispatch(addOption({
          questionId: props.index,
          option: option
        }))
      }
    }
  }),
  null,
  { withRef: true }
)(Question)

export default (Question)
