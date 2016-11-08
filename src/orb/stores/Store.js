import { Observable } from 'rx-lite'

import { Axis, AxisType } from '../Axis'
import AxisUi from '../AxisUi'
import { Config } from '../Config'
import { ExpressionFilter } from '../Filtering'
import * as utils from '../Utils'

/**
 * Creates a new instance of store
 * @class
 * @memberOf orb
 * @param  {object} config - configuration object
 */
export default class Store {

  constructor (config, forceUpdateCallback) {
    this.init = false
    this.defaultfield = { name: '#undefined#' }
    this.forceUpdateCallback = forceUpdateCallback
    this.config = new Config(config)
    this.filters = new Map()
    Object.keys(this.config.preFilters).forEach(key => this.filters.set(key, this.config.preFilters[key]))
    this.zoom = 1
    this.sizes = this.getsizes()
    this.rowsUi = this.getrowsUi()
    this.columnsUi = this.getcolumnsUi()
    this.layout = this.getlayout()
    this.rowHeaderSizes = {leafs: {}, dimensions: {}}
    this.columnHeaderSizes = {leafs: {}, dimensions: {}}

    this.init = true
  }

  subscribe (datasource) {
    this.data = []
    this.filteredData = []
    let observableDatasource = null
    // datasource can be an observable, an array of arrays or an array of objects
    if (Array.isArray(datasource) && (Array.isArray(datasource[0]) || typeof datasource[0] === 'object')) {
      observableDatasource = Observable.of(datasource)
    } else if (Observable.isObservable(datasource)) {
      // datasource is a Rxjs observable
      observableDatasource = datasource
    }
    if (observableDatasource) this.dataSubscription = observableDatasource.subscribe(this.push.bind(this))
  }

  unsubscribe () {
    if (this.dataSubscription) this.dataSubscription.dispose()
  }

  push (payload) {
    let pushed
    let _data = this.data
    // Push data (array of objects, array of arrays or object) to this.data
    // New data is pushed at the top (using unshift) in order to read the newest data first
    // when building the axes
    if (Array.isArray(payload) && (Array.isArray(payload[0]) || typeof payload[0] === 'object')) {
      payload.forEach(line => { _data.unshift(line) })
      pushed = payload
    } else if (Array.isArray(payload) || typeof payload === 'object') {
      _data.unshift(payload)
      pushed = [payload]
    }
    // Push filtered data and refresh Ui
    if (pushed) {
      const filteredPush = this.filter(pushed)
      if (filteredPush.length) {
        filteredPush.forEach(line => { this.filteredData.unshift(line) })
        this.columnsUi = this.getcolumnsUi()
        this.rowsUi = this.getrowsUi()
        this.layout = this.getlayout()
        if (this.init) { this.forceUpdateCallback() }
      }
    }
    this.data = _data
  }

  filter (data) {
    let filterFields = [...this.filters.keys()]
    if (filterFields.length > 0) {
      const res = []

      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let exclude = false
        for (let fi = 0; fi < filterFields.length; fi++) {
          let fieldname = filterFields[fi]
          let fieldFilter = this.filters.get(fieldname)

          if (fieldFilter && !fieldFilter.test(row[fieldname])) {
            exclude = true
            break
          }
        }
        if (!exclude) {
          res.push(row)
        }
      }
      return res
    } else {
      return data
    }
  }

  getrows () {
    const axe = new Axis(AxisType.ROWS, this.config.rowFields, this.filteredData)
    for (let field of this.config.rowFields) {
      axe.sort(field, true)
    }
    return axe
  }

  getcolumns () {
    const axe = new Axis(AxisType.COLUMNS, this.config.columnFields, this.filteredData)
    for (let field of this.config.columnFields) {
      axe.sort(field, true)
    }
    return axe
  }

  getChartAxis () {
    return new Axis(AxisType.CHART, [this.config.selectedField], this)
  }

  getrowsUi (noNewAxis) {
    if (!noNewAxis) { this.rows = this.getrows() }
    return new AxisUi(this.rows, this.config)
  }

  getcolumnsUi (noNewAxis) {
    if (!noNewAxis) { this.columns = this.getcolumns() }
    return new AxisUi(this.columns, this.config)
  }

  getlayout () {
    const rowHeaders = {
      width: (this.rows.fields.length || 1) +
        (this.config.dataHeadersLocation === 'rows' && this.config.activatedDataFieldsCount >= 1 ? 1 : 0),
      height: this.rowsUi.headers.length
    }
    const columnHeaders = {
      width: this.columnsUi.headers.length,
      height: (this.columns.fields.length || 1) +
        (this.config.dataHeadersLocation === 'columns' && this.config.activatedDataFieldsCount >= 1 ? 1 : 0)
    }
    const pivotTable = {
      width: rowHeaders.width + columnHeaders.width,
      height: rowHeaders.height + columnHeaders.height
    }
    return {columnHeaders, rowHeaders, pivotTable}
  }

  getsizes () {
    const cell = {
      height: this.zoom * (this.config.cellHeight || 30),
      width: this.zoom * (this.config.cellWidth || 100)
    }
    const grid = {
      width: this.config.width,
      height: this.config.height
    }
    return {cell, grid}
  }

  handleZoom (zoomIn) {
    const {zoom} = this
    const zoomValues = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]
    const zoomIndex = zoomValues.indexOf(zoom)
    let nextZoomIndex
    if (zoomIn) {
      nextZoomIndex = Math.min(zoomIndex + 1, zoomValues.length - 1)
    } else {
      nextZoomIndex = Math.max(zoomIndex - 1, 0)
    }
    this.zoom = zoomValues[nextZoomIndex]
    this.sizes = this.getsizes()
    this.forceUpdateCallback()
  }

  sort (axetype, field) {
    let sorted = false
    if (axetype === AxisType.ROWS) {
      this.rows.sort(field)
      sorted = true
    } else if (axetype === AxisType.COLUMNS) {
      this.columns.sort(field)
      sorted = true
    }
    if (sorted && this.init) {
      switch (axetype) {
        case AxisType.ROWS:
          this.rowsUi = this.getrowsUi(true)
          break
        case AxisType.COLUMNS:
          this.columnsUi = this.getcolumnsUi(true)
          break
        default:
          break
      }
      this.forceUpdateCallback()
    }
  }

  moveField (fieldname, oldaxistype, newaxistype, position) {
    const axisType = this.config.moveField(fieldname, oldaxistype, newaxistype, position)
    switch (axisType) {
      case AxisType.COLUMNS:
        this.columnsUi = this.getcolumnsUi()
        if (!this.config.rowFields.length) {
          // If the other axis has no field, it must be recreated to update the key of the Total header
          // Since there are no field, it is very cheap anyway
          this.rowsUi = this.getrowsUi()
        }
        break
      case AxisType.ROWS:
        this.rowsUi = this.getrowsUi()
        if (!this.config.columnFields.length) {
          // If the other axis has no field, it must be recreated to update the key of the Total header
          // Since there are no field, it is very cheap anyway
          this.columnsUi = this.getcolumnsUi()
        }
        break
      default:
        this.columnsUi = this.getcolumnsUi()
        this.rowsUi = this.getrowsUi()
    }
    this.layout = this.getlayout()
    this.forceUpdateCallback()
  }

  selectField (fieldname) {
    this.config.selectField(fieldname)
    this.rows = this.getrows()
    this.forceUpdateCallback()
  }

  toggleDataField (fieldname) {
    // toggleDataField returns the count of activated data fields.
    // If it is 0, there is no need to recompute the axes as the only effect is to make the data cells blank.
    if (this.config.toggleDataField(fieldname)) {
      switch (this.config.dataHeadersLocation) {
        case 'columns':
          this.columnsUi = this.getcolumnsUi()
          break
        case 'rows':
          this.rowsUi = this.getrowsUi()
          break
        default:
          break
      }
      this.layout = this.getlayout()
    }
    this.forceUpdateCallback()
  }

  applyFilter (fieldname, axetype, all, operator, term, staticValue, excludeStatic) {
    if (all && this.filters.has(fieldname)) {
      this.filters.delete(fieldname)
    } else if (!all) {
      this.filters.set(fieldname, new ExpressionFilter(fieldname, this.filteredData, operator, term, staticValue, excludeStatic))
    }
    this.filteredData = this.filter(this.data)
    this.columnsUi = this.getcolumnsUi()
    this.rowsUi = this.getrowsUi()
    this.layout = this.getlayout()
    this.forceUpdateCallback()
  }

  drilldown (cell) {
    return this.config.drilldown(cell)
  }

  refreshData (data) {
    this.filteredData = data
  }

  updateCellSizes (handle, offset, initialOffset) {
    function updateCellSize (size, offset) { return Math.max(size + offset, 10)}
    if (handle.isOnDimensionHeader) {
      if (handle.axis === AxisType.COLUMNS) {
        this.columnHeaderSizes.dimensions[handle.id] = updateCellSize(this.columnHeaderSizes.dimensions[handle.id] || this.sizes.cell.height, offset.y - initialOffset.y)
      } else {
        this.rowHeaderSizes.dimensions[handle.id] = updateCellSize(this.rowHeaderSizes.dimensions[handle.id] || this.sizes.cell.width, offset.x - initialOffset.x)
      }
    } else {
      if (handle.axis === AxisType.COLUMNS && handle.position === 'right'){
        if (handle.leafSubheaders.length) {
          let fractionalOffset = (offset.x - initialOffset.x) / handle.leafSubheaders.length
          for (let subheader of handle.leafSubheaders){
            this.columnHeaderSizes.leafs[subheader.key] = updateCellSize(this.columnHeaderSizes.leafs[subheader.key] || this.sizes.cell.width, fractionalOffset)
          }
        } else {
          // Header is a leaf header
          this.columnHeaderSizes.leafs[handle.id] = updateCellSize(this.columnHeaderSizes.leafs[handle.id] || this.sizes.cell.width, offset.x - initialOffset.x)
        }
      } else if (handle.axis === AxisType.ROWS && handle.position === 'bottom'){
        if (handle.leafSubheaders.length) {
          let fractionalOffset = (offset.y - initialOffset.y) / handle.leafSubheaders.length
          for (let subheader of handle.leafSubheaders){
            this.rowHeaderSizes.leafs[subheader.key] = updateCellSize(this.rowHeaderSizes.leafs[subheader.key] || this.sizes.cell.height, fractionalOffset)
          }
        } else {
          // Header is a leaf header
          this.rowHeaderSizes.leafs[handle.id] = updateCellSize(this.rowHeaderSizes.leafs[handle.id] || this.sizes.cell.height, offset.y - initialOffset.y)
        }
      } else if (handle.axis === AxisType.COLUMNS && handle.position === 'bottom') {
        this.columnHeaderSizes.dimensions[handle.id] = updateCellSize(this.columnHeaderSizes.dimensions[handle.id] || this.sizes.cell.height, offset.y - initialOffset.y)
      } else if (handle.axis === AxisType.ROWS && handle.position === 'right') {
        this.rowHeaderSizes.dimensions[handle.id] = updateCellSize(this.rowHeaderSizes.dimensions[handle.id] || this.sizes.cell.width, offset.x - initialOffset.x)
      }
    }
    this.forceUpdateCallback()
  }


  toggleSubtotals (axetype) {
    if (this.config.toggleSubtotals(axetype)) {
    }
  }

  toggleGrandtotal (axetype) {
    if (this.config.toggleGrandtotal(axetype)) {
    }
  }

  areSubtotalsVisible (axetype) {
    return this.config.areSubtotalsVisible(axetype)
  }

  isGrandtotalVisible (axetype) {
    return this.config.isGrandtotalVisible(axetype)
  }

  getFieldValues (field, filterFunc) {
    let values1 = []
    let values = []
    let containsBlank = false
    // We use config.data here instead of filteredData because otherwise you lose the filtered values the next time you open a Filter Panel
    for (let i = 0; i < this.data.length; i++) {
      let row = this.data[i]
      let val = row[field]
      if (filterFunc !== undefined) {
        if (filterFunc === true || (typeof filterFunc === 'function' && filterFunc(val))) {
          values1.push(val)
        }
      } else {
        if (val != null) {
          values1.push(val)
        } else {
          containsBlank = true
        }
      }
    }
    if (values1.length > 1) {
      if (utils.isNumber(values1[0]) || utils.isDate(values1[0])) {
        values1.sort(function (a, b) { return a ? (b ? a - b : 1) : (b ? -1 : 0) })
      } else {
        values1.sort()
      }

      for (let vi = 0; vi < values1.length; vi++) {
        if (vi === 0 || values1[vi] !== values[values.length - 1]) {
          values.push(values1[vi])
        }
      }
    } else {
      values = values1
    }
    if (containsBlank) {
      values.unshift(null)
    }
    return values
  }

  getFieldFilter (field) {
    return this.filters[field]
  }

  isFieldFiltered (field) {
    let filter = this.getFieldFilter(field)
    return filter != null && !filter.isAlwaysTrue()
  }

  getData (field, rowdim, coldim, aggregateFunc) {
    let value
    if (rowdim && coldim) {
      const datafieldName = field || (this.config.activatedDataFields[0] || this.defaultfield).name
      value = this.calcAggregation(
        rowdim.isRoot ? null : rowdim.getRowIndexes().slice(0),
        coldim.isRoot ? null : coldim.getRowIndexes().slice(0),
        [datafieldName],
        aggregateFunc
      )[datafieldName]
    }
    return value === undefined ? null : value
  }

  calcAggregation (rowIndexes, colIndexes, fieldNames, aggregateFunc) {
    let res = {}

    if (this.config.activatedDataFieldsCount > 0) {
      let intersection

      if (rowIndexes === null) {
        intersection = colIndexes
      } else if (colIndexes === null) {
        intersection = rowIndexes
      } else {
        intersection = utils.twoArraysIntersect(colIndexes, rowIndexes)
      }

      const emptyIntersection = intersection && intersection.length === 0
      const data = this.filteredData
      let datafield
      let datafields = []

      if (fieldNames) {
        for (let fieldnameIndex = 0; fieldnameIndex < fieldNames.length; fieldnameIndex++) {
          datafield = this.config.getDataField(fieldNames[fieldnameIndex])
          if (!aggregateFunc) {
            if (!datafield) {
              datafield = this.config.getField(fieldNames[fieldnameIndex])
              if (datafield) {
                aggregateFunc = datafield.dataSettings ? datafield.dataSettings.aggregateFunc() : datafield.aggregateFunc()
              }
            } else {
              aggregateFunc = datafield.aggregateFunc()
            }
          }

          if (datafield && aggregateFunc) {
            datafields.push({ field: datafield, aggregateFunc })
          }
        }
      } else {
        for (let datafieldIndex = 0; datafieldIndex < this.config.activatedDataFieldsCount; datafieldIndex++) {
          datafield = this.config.activatedDataFields[datafieldIndex] || this.defaultfield
          if (aggregateFunc || datafield.aggregateFunc) {
            datafields.push({ field: datafield, aggregateFunc: aggregateFunc || datafield.aggregateFunc() })
          }
        }
      }

      for (let dfi = 0; dfi < datafields.length; dfi++) {
        datafield = datafields[dfi]
        // no data
        if (emptyIntersection) {
          res[datafield.field.name] = null
        } else {
          res[datafield.field.name] = datafield.aggregateFunc(datafield.field.name, intersection || 'all', data, rowIndexes, colIndexes)
        }
      }
    }

    return res
  }
}
