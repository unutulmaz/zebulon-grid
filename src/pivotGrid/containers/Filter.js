import React from 'react';
import { connect } from 'react-redux';
import VirtualizedCheckbox from 'react-virtualized-checkbox';

import { getDimensionValuesSelector } from '../selectors';
import { addFilter, deleteFilter } from '../actions';

const Filter = ({ items, onOk }) =>
  <div style={{ height: 400 }}>
    <VirtualizedCheckbox items={items} onOk={onOk} valueKey="key" />
  </div>;

const mapStateToProps = (state, ownProps) => {
  return {
    items: getDimensionValuesSelector(state)(ownProps.dimensionId)
  };
};
const mapDispatchToProps = (dispatch, ownProps) => ({
  onOk: (checkedAll, filterKeys) => {
    if (checkedAll) {
      dispatch(deleteFilter(ownProps.dimensionId));
    } else {
      dispatch(
        addFilter(
          ownProps.dimensionId,
          'in',
          null,
          filterKeys.map(v => v.key),
          false
        )
      );
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
