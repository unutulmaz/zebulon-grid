'use strict'

import { AxeType } from './Axe'
import { Store } from './orb.store'

export const HeaderType = {
  EMPTY: 1,
  DATA_HEADER: 2,
  DATA_VALUE: 3,
  FIELD_BUTTON: 4,
  INNER: 5,
  WRAPPER: 6,
  SUB_TOTAL: 7,
  GRAND_TOTAL: 8,
  getHeaderClass: function (headerType, axetype) {
    var cssclass = axetype === AxeType.ROWS ? 'header-row' : (axetype === AxeType.COLUMNS ? 'header-col' : '')
    switch (headerType) {
      case HeaderType.EMPTY:
      case HeaderType.FIELD_BUTTON:
        cssclass = 'empty'
        break
      case HeaderType.INNER:
        cssclass = 'header ' + cssclass
        break
      case HeaderType.WRAPPER:
        cssclass = 'header ' + cssclass
        break
      case HeaderType.SUB_TOTAL:
        cssclass = 'header header-st ' + cssclass
        break
      case HeaderType.GRAND_TOTAL:
        cssclass = 'header header-gt ' + cssclass
        break
    }

    return cssclass
  },
  getCellClass: function (rowHeaderType, colHeaderType) {
    var cssclass = ''
    switch (rowHeaderType) {
      case HeaderType.GRAND_TOTAL:
        cssclass = 'cell-gt'
        break
      case HeaderType.SUB_TOTAL:
        if (colHeaderType === HeaderType.GRAND_TOTAL) {
          cssclass = 'cell-gt'
        } else {
          cssclass = 'cell-st'
        }
        break
      default:
        if (colHeaderType === HeaderType.GRAND_TOTAL) {
          cssclass = 'cell-gt'
        } else if (colHeaderType === HeaderType.SUB_TOTAL) {
          cssclass = 'cell-st'
        } else {
          cssclass = ''
        }
    }
    return cssclass
  }
}

export class CellBase {

  constructor (options) {
    /**
     * axe type (COLUMNS, ROWS, DATA, ...)
     * @type {orb.AxeType}
     */
    this.axetype = options.axetype
    /**
     * cell type (EMPTY, DATA_VALUE, FIELD_BUTTON, INNER, WRAPPER, SUB_TOTAL, GRAND_TOTAL, ...)
     * @type {HeaderType}
     */
    this.type = options.type
    /**
     * header cell template
     * @type {String}
     */
    this.template = options.template
    /**
     * header cell value
     * @type {Object}
     */
    this.value = options.value
    /**
     * is header cell expanded
     * @type {Boolean}
     */
    this.expanded = true
    /**
     * header cell css class(es)
     * @type {String}
     */
    this.cssclass = options.cssclass
    /**
     * header cell width
     * @type {Number}
     */
    this.hspan = options.hspan || (() => 1)
    /**
     * gejs header cell's height
     * @return {Number}
     */
    this.vspan = options.vspan || (() => 1)
    /**
     * gejs wether header cell is visible
     * @return {Boolean}
     */
    this.visible = options.isvisible || (() => true)

    this.key = this.axetype + this.type + this.value

    this.store = new Store()
  }

  getState () { return this.store.get(this.key) }
  setState (newState) { this.store.set(this.key, newState) }
}

/**
 * Creates a new instance of a row header.
 * @class
 * @memberOf orb.ui
 * @param  {orb.ui.rowHeader} parent - parent header.
 * @param  {orb.dimension} dim - related dimension values container.
 * @param  {HeaderType} type - header type (INNER, WRAPPER, SUB_TOTAL, GRAND_TOTAL).
 * @param  {orb.ui.rowHeader} totalHeader - sub total or grand total related header.
 */
export class Header extends CellBase {

  constructor (axetype, headerTypeP, dim, parent, datafieldscount, subtotalHeader) {
    const isRowsAxe = axetype === AxeType.ROWS
    const headerType = headerTypeP || (dim.depth === 1 ? HeaderType.INNER : HeaderType.WRAPPER)
    var value
    var hspan
    var vspan

    switch (headerType) {
      case HeaderType.GRAND_TOTAL:
        value = 'Grand Total'
        hspan = isRowsAxe ? dim.depth - 1 || 1 : datafieldscount
        vspan = isRowsAxe ? datafieldscount : dim.depth - 1 || 1
        break
      case HeaderType.SUB_TOTAL:
        value = dim.value
        hspan = isRowsAxe ? dim.depth : datafieldscount
        vspan = isRowsAxe ? datafieldscount : dim.depth
        break
      default:
        value = dim.value
        hspan = isRowsAxe ? 1 : null
        vspan = isRowsAxe ? null : 1
        break
    }

    const options = {
      axetype: axetype,
      type: headerType,
      template: isRowsAxe ? 'cell-template-row-header' : 'cell-template-column-header',
      value: value,
      cssclass: HeaderType.getHeaderClass(headerType, axetype)
    }

    super(options)

    this.hspan = hspan != null ? () => hspan : this.calcSpan
    this.vspan = vspan != null ? () => vspan : this.calcSpan
    this.isvisible = this.isParentExpanded

    this.subtotalHeader = subtotalHeader
    this.parent = parent
    this.dim = dim
    this.expanded = this.getState() ? this.getState().expanded : (headerType !== HeaderType.SUB_TOTAL || !dim.field.subTotal.collapsed)
    this.subheaders = []

    if (parent != null) {
      this.parent.subheaders.push(this)
    }

    this.datafieldscount = datafieldscount
  }

  expand () {
    this.expanded = true
    this.setState({
      expanded: this.expanded
    })
  }

  collapse () {
    this.expanded = false
    this.setState({
      expanded: this.expanded
    })
  }

  isParentExpanded () {
    if (this.type === HeaderType.SUB_TOTAL) {
      var hparent = this.parent
      while (hparent != null) {
        if (hparent.subtotalHeader && !hparent.subtotalHeader.expanded) {
          return false
        }
        hparent = hparent.parent
      }
      return true
    } else {
      var isexpanded = this.dim.isRoot || this.dim.isLeaf || !this.dim.field.subTotal.visible || this.subtotalHeader.expanded
      if (!isexpanded) {
        return false
      }

      var par = this.parent
      while (par != null && (!par.dim.field.subTotal.visible || (par.subtotalHeader != null && par.subtotalHeader.expanded))) {
        par = par.parent
      }
      return par == null || par.subtotalHeader == null ? isexpanded : par.subtotalHeader.expanded
    }
  }

  calcSpan (ignoreVisibility) {
    // console.log('calcSpan')
    // console.log(this)
    var jspan = 0
    var subSpan
    var addone = false

    if (this.isRowsAxe || ignoreVisibility || this.visible()) {
      if (!this.dim.isLeaf) {
        // subdimvals 'own' properties are the set of values for this dimension
        if (this.subheaders.length > 0) {
          for (let i = 0; i < this.subheaders.length; i++) {
            var subheader = this.subheaders[i]
            // if ijs not an array
            if (!subheader.dim.isLeaf) {
              subSpan = this.isRowsAxe ? subheader.vspan() : subheader.hspan()
              jspan += subSpan
              if (i === 0 && (subSpan === 0)) {
                addone = true
              }
            } else {
              jspan += this.datafieldscount
            }
          }
        } else {
          jspan += this.datafieldscount
        }
      } else {
        return this.datafieldscount
      }
      return jspan + (addone ? 1 : 0)
    }
    return jspan
  }
}

export class DataHeader extends CellBase {

  constructor (datafield, parent) {
    super({
      axetype: null,
      type: HeaderType.DATA_HEADER,
      template: 'cell-template-dataheader',
      value: datafield,
      cssclass: HeaderType.getHeaderClass(parent.type, parent.axetype),
      isvisible: parent.visible
    })

    this.parent = parent
  }
}

export class DataCell extends CellBase {

  constructor (pgrid, isvisible, rowinfo, colinfo) {
    const rowDimension = rowinfo.type === HeaderType.DATA_HEADER ? rowinfo.parent.dim : rowinfo.dim
    const columnDimension = colinfo.type === HeaderType.DATA_HEADER ? colinfo.parent.dim : colinfo.dim
    const rowType = rowinfo.type === HeaderType.DATA_HEADER ? rowinfo.parent.type : rowinfo.type
    const colType = colinfo.type === HeaderType.DATA_HEADER ? colinfo.parent.type : colinfo.type

    const datafield = pgrid.config.dataFieldsCount > 1
      ? (pgrid.config.dataHeadersLocation === 'rows'
        ? rowinfo.value
        : colinfo.value)
      : pgrid.config.dataFields[0]

    super({
      axetype: null,
      type: HeaderType.DATA_VALUE,
      template: 'cell-template-datavalue',
      // value: pgrid.getData(datafield ? datafield.name : null, rowDimension, columnDimension),
      cssclass: 'cell ' + HeaderType.getCellClass(rowType, colType),
      isvisible: isvisible
    })

    this.rowDimension = rowDimension
    this.columnDimension = columnDimension
    this.rowType = rowType
    this.colType = colType
    this.datafield = datafield
  }
}

export class ButtonCell extends CellBase {

  constructor (field) {
    super({
      axetype: null,
      type: HeaderType.FIELD_BUTTON,
      template: 'cell-template-fieldbutton',
      value: field,
      cssclass: HeaderType.getHeaderClass(HeaderType.FIELD_BUTTON)
    })
  }
}

export class EmptyCell extends CellBase {

  constructor (hspan, vspan) {
    super({
      axetype: null,
      type: HeaderType.EMPTY,
      template: 'cell-template-empty',
      value: null,
      cssclass: HeaderType.getHeaderClass(HeaderType.EMPTY),
      hspan: function () {
        return hspan
      },
      vspan: function () {
        return vspan
      }
    })
  }
}