import React, { Component } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import reducer from './reducers';
import PivotGrid from './containers/PivotGrid';
import hydrateStore from './hydrateStore';
import * as actions from './actions';

class WrappedGrid extends Component {
  constructor(props) {
    super(props);
    const { data, config } = this.props;
    this.store = createStore(reducer);
    this.customFunctions = hydrateStore(this.store, config, data);
  }

  render() {
    return (
      <Provider store={this.store}>
        <PivotGrid
          customFunctions={this.customFunctions}
          id={this.props.id}
          drilldown={this.props.drilldown}
        />
      </Provider>
    );
  }
}

Object.keys(actions).forEach(action => {
  WrappedGrid.prototype[action] = function action(...args) {
    this.store.dispatch(actions[action](...args));
  };
});

export default WrappedGrid;
