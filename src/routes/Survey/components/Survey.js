import React, {Component} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import keydown from 'react-keydown'
import Scroll from 'react-scroll'
import Question from './Question'
import {fetchQuestions, selectActiveQuestion, saveAnswer, submitAnswers} from '../modules/survey'
import Waypoint from 'react-waypoint'
const Element = Scroll.Element
const scroll = Scroll.scroller
import {Line} from 'rc-progress'

class Survey extends Component {
  static propTypes = {
    questions: React.PropTypes.array,
    activeQuestionId: React.PropTypes.number.isRequired,
    fetchQuestions: React.PropTypes.func.isRequired,
    selectActiveQuestion: React.PropTypes.func.isRequired,
    saveAnswer: React.PropTypes.func.isRequired
  }

  ensureActiveQuestionVisible(name, smooth = true) {
    try {
      scroll.scrollTo(String(name), {
        duration: 500,
        smooth: smooth,
        offset: -(window.innerHeight / 2) + 250,
        ignoreCancelEvents: true
      })
    } catch (e) {
      console.log(e, 'Reached end or start of questionnaire')
    }
    const scope = this
    setTimeout(function () {
      scope.props.selectActiveQuestion(name)
      const input = scope.refs[`qn-${name}`].getWrappedInstance().refs.input
      if (input){
        input.focus()
      }
    }, 500)
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
    if (['scale', 'mcq'].includes(activeQuestion.type)) {
      const keys = activeQuestion.options.map(opt => String(opt.id))
      const index = keys.indexOf(event.key)
      if (index > -1) {
        await this.props.saveAnswer(activeQuestion.options[index].value)
        setTimeout(this.ensureActiveQuestionVisible.bind(this, this.props.activeQuestionId + 1), 750)
      }
    }
  }2

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

  handleOnSubmit() {
    this.props.submitAnswers(this.props.questions.map(qn => ({
        questionId: qn.id,
        answer: qn.answer
      })
    ))
  }

  handleReset() {
    this.props.fetchQuestions()
    this.ensureActiveQuestionVisible(0, false)
  }

  render() {
    const {questions, activeQuestionId} = this.props
    const percent = Math.round((questions.filter(qn => qn.answer && !qn.error).length / questions.length) * 100)
    return (
      <div>
        <h1>Questions</h1>
        <br /><br /><br /><br /><br /><br />
        {questions.length ?
          questions.map((qn, index) => {
            qn.index = index
            return <Element name={String(index)} key={index}
                            className={classnames({'inactive': index !== activeQuestionId})}>
              <Waypoint onEnter={this.props.selectActiveQuestion.bind(this, index)} topOffset="25%" bottomOffset="40%">
                <div onClick={this.ensureActiveQuestionVisible.bind(this, index)}>
                  <Question {...qn} ref={`qn-${index}`} activeQuestionId = {activeQuestionId}
                            active={index === activeQuestionId}
                            setAndScroll={this.ensureActiveQuestionVisible.bind(this)}/>
                </div>
              </Waypoint>
            </Element>
          })
          : null
        }
        <div className="submit-panel container">
          <div className="row">
            <div className="col-sm-1 col-md-1">
            </div>
            <div className="col-xs-5 col-sm-8 col-md-8">
              <p className="progress-text"><strong>{percent}%</strong></p>
              <Line percent={percent} strokeWidth="2" trailWidth="2"/>
            </div>
            <div className="col-xs-2 col-sm-1 col-md-1">
              <div className="btn btn-glyph">
                <span className="glyphicon glyphicon-repeat reset" onClick={this.handleReset.bind(this)}></span>
              </div>
            </div>
            <div className="col-xs-4 col-sm-2 col-md-2">
              <button type="button" className="btn btn-default btn-lg" onClick={this.handleOnSubmit.bind(this)}
                      disabled={percent !== 100}>Submit
              </button>
            </div>
          </div>
        </div>
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

export default keydown('up', 'down', 'right', 'left', 'enter', '1', '2', '3', '4', '5', 'a', 'b', 'c', 'd', 'e')(Survey)
