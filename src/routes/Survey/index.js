import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'survey',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([
    	'./components/Survey',
    	'./modules/survey'
    	], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Survey = require('./components/Survey').default
      const reducer = require('./modules/survey').default

      /*  Add the reducer to the store on key 'survey'  */
      injectReducer(store, { key: 'survey', reducer })

      /*  Return getComponent   */
      cb(null, Survey)

    /* Webpack named bundle   */
    }, 'survey')
  }
})
