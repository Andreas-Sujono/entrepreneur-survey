// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_QUESTIONS = 'REQUEST_QUESTIONS'
export const RECEIVE_QUESTIONS = 'RECEIVE_QUESTIONS'
export const SUBMIT_ANSWERS = 'SUBMIT_ANSWERS'
export const SUBMITTING_ANSWERS = 'SUBMITTING_ANSWERS'
export const SUBMITTED_ANSWERS = 'SUBMITTED_ANSWERS'
export const SELECT_ACTIVE_QUESTION = 'SELECT_ACTIVE_QUESTION'
export const SAVE_ANSWER = 'SAVE_ANSWER'

// ------------------------------------
// Actions
// ------------------------------------
export function requestQuestions () {
  return {
    type: REQUEST_QUESTIONS
  }
}

export function receiveQuestions (json) {
  return {
    type: RECEIVE_QUESTIONS,
    payload: json
  }
}

export function submittingAnswers () {
  return {
    type: SUBMITTING_ANSWERS
  }
}

export function submittedAnswers () {
  return {
    typeof: SUBMITTED_ANSWERS
  }
}

export const submitAnswers = (answers) => {
  return dispatch => {
    return new Promise(() => {
      const data = new FormData()
      data.append("json", JSON.stringify(answers))
      dispatch(submittingAnswers())
      fetch('http://localhost:2001', {
        method: 'POST',
        body: data
      })
      .then(res => {
        dispatch(submittedAnswers())
      })
    })
  }
}

export function selectActiveQuestion (questionId) {
  return {
    type: SELECT_ACTIVE_QUESTION,
    payload: questionId
  }
}

export function saveAnswer (answer) {
  return {
    type: SAVE_ANSWER,
    payload: answer
  }
}

export const fetchQuestions = () => {
  return dispatch => {
    return new Promise(() => {
      dispatch(requestQuestions())
      setTimeout(() => {
        const json = require('../../../../questions.json')
        dispatch(receiveQuestions(json))
        return
      }, 1000)
    })
  }
}

export const actions = {
  requestQuestions,
  receiveQuestions,
  submittingAnswers,
  submittedAnswers,
  selectActiveQuestion,
  fetchQuestions,
  saveAnswer
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_QUESTIONS] : state => ({
    ...state,
    fetching: true
  }),
  [RECEIVE_QUESTIONS] : (state, action) => ({
    ...state,
    title: action.payload.title,
    questions: action.payload.questions,
    fetching: false
  }),
  [SELECT_ACTIVE_QUESTION] : (state, action) => {
    let payload = action.payload
    const numberOfQuestions = state.questions.length
    if (action.payload <= 0) {
      payload = 0
    } else if (action.payload >= numberOfQuestions) {
      payload = numberOfQuestions - 1
    }
    return {
      ...state,
      activeQuestionId: payload
    }
  },
  [SUBMITTING_ANSWERS] : (state, action) => ({
    ...state,
    submitting: true
  }),
  [SUBMITTING_ANSWERS] : (state, action) => ({
    ...state,
    submitting: false,
    submitted: true
  }),
  [SAVE_ANSWER] : (state, action) => ({
    ...state,
    questions: state.questions.map(qn => {
      if (qn.index === action.payload.questionId) {
        qn.answer = action.payload.answer
      }
      return qn;
    })
  })
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  title: null,
  questions: [],
  activeQuestionId: 0
}

export default function surveyReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
