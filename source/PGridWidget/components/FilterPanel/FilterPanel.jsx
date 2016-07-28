import React from 'react'
import { ResizableBox } from 'react-resizable'
import VirtualizedCheckbox from 'react-virtualized-checkbox'

import * as utils from '../../Utils'

const startingHeight = 223
const startingWidth = 301

const FilterPanel = ({store, field, onFilter, onCancel}) => {
  const filter = store.filters.get(field.name)
  const values = store.getFieldValues(field.name)
  const checkedValues = filter && filter.staticValue.length < values.length ? utils.twoArraysIntersect(values, filter.staticValue) : values
  const options = values.map(val => ({checked: checkedValues.indexOf(val) > -1, label: val}))

  const checkboxes =
    <VirtualizedCheckbox
      options={options}
      onOk={(all, result) => onFilter(all, '', '', result, false)}
      onCancel={onCancel}
      maxHeight={startingHeight}
    />

  const divStyle = {
    backgroundColor: 'white',
    border: 'solid 1px',
    boxShadow: '0 5px 15px #9d9d9d',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '90%',
    height: '100%',
    justifyContent: 'space-between',
    padding: '3px',
    width: '100%',
    zIndex: 100
  }

  return (
    <ResizableBox width={startingWidth} height={startingHeight} minConstraints={[startingWidth, startingHeight]}>
      <div style={divStyle} id='filter-panel'>
        {checkboxes}
      </div>
    </ResizableBox>
  )
}

export default FilterPanel
