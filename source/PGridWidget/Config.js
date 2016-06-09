import * as utils from './Utils'
import { AxeType } from './Axe'
import * as aggregation from './Aggregation'
import * as filtering from './Filtering'
// import { ThemeManager } from './orb.themes'

function getpropertyvalue (property, configs, defaultvalue) {
  for (let i = 0; i < configs.length; i++) {
    if (configs[i][property] != null) {
      return configs[i][property]
    }
  }
  return defaultvalue
}

function mergefieldconfigs (...args) {
  var merged = {
    configs: [],
    sorjs: [],
    subtotals: [],
    functions: []
  }

  for (let i = 0; i < args.length; i++) {
    var nnconfig = args[i] || {}
    merged.configs.push(nnconfig)
    merged.sorjs.push(nnconfig.sort || {})
    merged.subtotals.push(nnconfig.subTotal || {})
    merged.functions.push({
      aggregateFuncName: nnconfig.aggregateFuncName,
      aggregateFunc: i === 0 ? nnconfig.aggregateFunc : (nnconfig.aggregateFunc ? nnconfig.aggregateFunc() : null),
      formatFunc: i === 0 ? nnconfig.formatFunc : (nnconfig.formatFunc ? nnconfig.formatFunc() : null)
    })
  }

  return merged
}

function createfield (rootconfig, axetype, fieldconfig, defaultfieldconfig) {
  var axeconfig
  var fieldAxeconfig

  if (defaultfieldconfig) {
    switch (axetype) {
      case AxeType.ROWS:
        axeconfig = rootconfig.rowSettings
        fieldAxeconfig = defaultfieldconfig.rowSettings
        break
      case AxeType.COLUMNS:
        axeconfig = rootconfig.columnSettings
        fieldAxeconfig = defaultfieldconfig.columnSettings
        break
      case AxeType.DATA:
        axeconfig = rootconfig.dataSettings
        fieldAxeconfig = defaultfieldconfig.dataSettings
        break
      default:
        axeconfig = null
        fieldAxeconfig = null
        break
    }
  } else {
    axeconfig = null
    fieldAxeconfig = null
  }

  var merged = mergefieldconfigs(fieldconfig, fieldAxeconfig, axeconfig, defaultfieldconfig, rootconfig)

  return new Field({
    name: getpropertyvalue('name', merged.configs, ''),

    caption: getpropertyvalue('caption', merged.configs, ''),

    sort: {
      order: getpropertyvalue('order', merged.sorjs, null),
      customfunc: getpropertyvalue('customfunc', merged.sorjs, null)
    },
    subTotal: {
      visible: getpropertyvalue('visible', merged.subtotals, true),
      collapsible: getpropertyvalue('collapsible', merged.subtotals, true),
      collapsed: getpropertyvalue('collapsed', merged.subtotals, false) && getpropertyvalue('collapsible', merged.subtotals, true)
    },

    aggregateFuncName: getpropertyvalue('aggregateFuncName', merged.functions, 'sum'),
    aggregateFunc: getpropertyvalue('aggregateFunc', merged.functions, aggregation.sum),
    formatFunc: getpropertyvalue('formatFunc', merged.functions, null)
  }, false)
}

export class GrandTotalConfig {

  constructor (options) {
    options = options || {}

    this.rowsvisible = options.rowsvisible !== undefined ? options.rowsvisible : true
    this.columnsvisible = options.columnsvisible !== undefined ? options.columnsvisible : true
  }
}

export class SubTotalConfig {

  constructor (options, setdefauljs) {
    const defauljs = {
      visible: setdefauljs === true ? true : undefined,
      collapsible: setdefauljs === true ? true : undefined,
      collapsed: setdefauljs === true ? false : undefined
    }
    options = options || {}

    this.visible = options.visible !== undefined ? options.visible : defauljs.visible
    this.collapsible = options.collapsible !== undefined ? options.collapsible : defauljs.collapsible
    this.collapsed = options.collapsed !== undefined ? options.collapsed : defauljs.collapsed
  }
}

export class SortConfig {

  constructor (options) {
    options = options || {}

    this.order = options.order || (options.customfunc ? 'asc' : null)
    this.customfunc = options.customfunc
  }
}

export class ChartConfig {

  constructor (options) {
    options = options || {}

    this.enabled = options.enabled || false
    // type can be: 'LineChart', 'AreaChart', 'ColumnChart', 'BarChart', 'SteppedAreaChart'
    this.type = options.type || 'LineChart'
  }
}

export class Field {

  constructor (options, createSubOptions) {
    options = options || {}

    // field name
    this.name = options.name

    // shared settings
    this.caption = options.caption || this.name

    // rows & columns settings
    this.sort = new SortConfig(options.sort)
    this.subTotal = new SubTotalConfig(options.subTotal)

    this.aggregateFuncName = options.aggregateFuncName ||
    (options.aggregateFunc
      ? (utils.isString(options.aggregateFunc)
        ? options.aggregateFunc : 'custom')
        : null)

    this.aggregateFunc(options.aggregateFunc)
    this.formatFunc(options.formatFunc || this.defaultFormatFunc)

    if (createSubOptions !== false) {
      (this.rowSettings = new Field(options.rowSettings, false)).name = this.name
      ;(this.columnSettings = new Field(options.columnSettings, false)).name = this.name
      ;(this.dataSettings = new Field(options.dataSettings, false)).name = this.name
    }
  }

  defaultFormatFunc (val) {
    return val != null ? val.toString() : ''
  }

  aggregateFunc (func) {
    if (func) {
      this._aggregatefunc = aggregation.toAggregateFunc(func)
    } else {
      return this._aggregatefunc
    }
  }

  formatFunc (func) {
    if (func) {
      this._formatfunc = func
    } else {
      return this._formatfunc
    }
  }

}

/**
 * Creates a new instance of pgrid config
 * @class
 * @memberOf orb
 * @param  {object} config - configuration object
 */
// module.config(config) {
export class Config {

  constructor (config) {
    this.config = config
    this.dataSource = config.dataSource || []
    this.canMoveFields = config.canMoveFields !== undefined ? !!config.canMoveFields : true
    this.dataHeadersLocation = config.dataHeadersLocation === 'columns' ? 'columns' : 'rows'
    this.grandTotal = new GrandTotalConfig(config.grandTotal)
    this.subTotal = new SubTotalConfig(config.subTotal, true)
    this.width = config.width
    this.height = config.height
    this.toolbar = config.toolbar
    // this.theme = new ThemeManager()
    this.chartMode = new ChartConfig(config.chartMode)

    this.rowSettings = new Field(config.rowSettings, false)
    this.columnSettings = new Field(config.columnSettings, false)
    this.dataSettings = new Field(config.dataSettings, false)

    this.allFields = (config.fields || []).map(fieldconfig => {
      var f = new Field(fieldconfig)
      // map fields names to captions
      this.dataSourceFieldNames.push(f.name)
      this.dataSourceFieldCaptions.push(f.caption)
      return f
    })

    this.rowFields = (config.rows || []).map(fieldconfig => {
      fieldconfig = this.ensureFieldConfig(fieldconfig)
      return createfield(this, AxeType.ROWS, fieldconfig, this.getfield(this.allFields, fieldconfig.name))
    })

    this.columnFields = (config.columns || []).map(fieldconfig => {
      fieldconfig = this.ensureFieldConfig(fieldconfig)
      return createfield(this, AxeType.COLUMNS, fieldconfig, this.getfield(this.allFields, fieldconfig.name))
    })

    this.dataFields = (config.data || []).map(fieldconfig => {
      fieldconfig = this.ensureFieldConfig(fieldconfig)
      return createfield(this, AxeType.DATA, fieldconfig, this.getfield(this.allFields, fieldconfig.name))
    })

    this.dataFieldsCount = this.dataFields ? (this.dataFields.length || 1) : 1

    this.runtimeVisibility = {
      subtotals: {
        rows: this.rowSettings.subTotal.visible !== undefined ? this.rowSettings.subTotal.visible : true,
        columns: this.columnSettings.subTotal.visible !== undefined ? this.columnSettings.subTotal.visible : true
      }
    }
    this.dataSourceFieldNames = []
    this.dataSourceFieldCaptions = []
  }

  captionToName (caption) {
    var fcaptionIndex = this.dataSourceFieldCaptions.indexOf(caption)
    return fcaptionIndex >= 0 ? this.dataSourceFieldNames[fcaptionIndex] : caption
  }

  nameToCaption (name) {
    var fnameIndex = this.dataSourceFieldNames.indexOf(name)
    return fnameIndex >= 0 ? this.dataSourceFieldCaptions[fnameIndex] : name
  }

  // setTheme (newTheme) {
  //   return this.theme.current() !== this.theme.current(newTheme)
  // }

  ensureFieldConfig (obj) {
    if (typeof obj === 'string') {
      return {
        name: this.captionToName(obj)
      }
    }
    return obj
  }

  getfield (axefields, fieldname) {
    var fieldindex = this.getfieldindex(axefields, fieldname)
    if (fieldindex > -1) {
      return axefields[fieldindex]
    }
    return null
  }

  getfieldindex (axefields, fieldname) {
    for (let fi = 0; fi < axefields.length; fi++) {
      if (axefields[fi].name === fieldname) {
        return fi
      }
    }
    return -1
  }

  getField (fieldname) {
    return this.getfield(this.allFields, fieldname)
  }

  getRowField (fieldname) {
    return this.getfield(this.rowFields, fieldname)
  }

  getColumnField (fieldname) {
    return this.getfield(this.columnFields, fieldname)
  }

  getDataField (fieldname) {
    return this.getfield(this.dataFields, fieldname)
  }

  availablefields () {
    const usedFields = this.rowFields.concat(this.columnFields)
    return this.allFields
      // This is a hacky way to detect which fields are measures
      // This will have to be solved later as part of a bigger overhaul where dimension and measures will be clearly separated
      .filter(field => field.aggregateFuncName === null)
      .filter(field => usedFields.map(field => field.name).indexOf(field.name) === -1)
  }

  getDataSourceFieldCaptions () {
    var row0
    if (this.dataSource && (row0 = this.dataSource[0])) {
      var fieldNames = utils.ownProperties(row0)
      var headers = []
      for (var i = 0; i < fieldNames.length; i++) {
        headers.push(this.nameToCaption(fieldNames[i]))
      }
      return headers
    }
    return null
  }

  getPreFilters () {
    var prefilters = {}
    if (this.config['preFilters']) {
      utils.forEach(
        utils.ownProperties(this.config['preFilters']),
        function (filteredField) {
          var prefilterConfig = this.config.preFilters[filteredField]
          if (utils.isArray(prefilterConfig)) {
            prefilters[this.captionToName(filteredField)] = new filtering.ExpressionFilter(null, null, prefilterConfig, false)
          } else {
            var opname = utils.ownProperties(prefilterConfig)[0]
            if (opname) {
              prefilters[this.captionToName(filteredField)] = new filtering.ExpressionFilter(opname, prefilterConfig[opname])
            }
          }
        })
    }

    return prefilters
  }

  moveField (fieldname, oldaxetype, newaxetype, position) {
    var oldaxe, oldposition
    var newaxe
    var fieldConfig
    var defaultFieldConfig = this.getfield(this.allFields, fieldname)

    if (defaultFieldConfig) {
      switch (oldaxetype) {
        case AxeType.ROWS:
          oldaxe = this.rowFields
          break
        case AxeType.COLUMNS:
          oldaxe = this.columnFields
          break
        default:
          break
      }

      switch (newaxetype) {
        case AxeType.ROWS:
          newaxe = this.rowFields
          fieldConfig = this.getRowField(fieldname)
          break
        case AxeType.COLUMNS:
          newaxe = this.columnFields
          fieldConfig = this.getColumnField(fieldname)
          break
        default:
          break
      }

      if (oldaxe || newaxe) {
        var newAxeSubtotalsState = this.areSubtotalsVisible(newaxetype)

        if (oldaxe) {
          oldposition = this.getfieldindex(oldaxe, fieldname)
          if (oldaxetype === newaxetype) {
            if (oldposition === oldaxe.length - 1 &&
              position == null ||
              oldposition === position - 1) {
              return false
            }
          }
          oldaxe.splice(oldposition, 1)
        }

        var field = createfield(
          this,
          newaxetype,
          fieldConfig,
          defaultFieldConfig)

        if (!newAxeSubtotalsState && field.subTotal.visible !== false) {
          field.subTotal.visible = null
        }

        if (newaxe) {
          if (position != null) {
            newaxe.splice(position, 0, field)
          } else {
            newaxe.push(field)
          }
        }
        if (newaxetype === null) {
          return oldaxetype
        } else if (oldaxetype === null) {
          return newaxetype
        } else {
          return -1
        }
      }
    }
  }

  toggleDataField (fieldname) {
    const defaultFieldConfig = this.getfield(this.allFields, fieldname)
    const newDataFields = this.dataFields.filter(fld => fld.name !== fieldname)
    if (this.dataFields.length === newDataFields.length) {
      this.dataFields.push(defaultFieldConfig)
    } else {
      this.dataFields = newDataFields
    }

    // update data fields count
    this.dataFieldsCount = this.dataFields ? (this.dataFields.length || 1) : 1
    return true
  }

  toggleSubtotals (axetype) {
    var i
    var axeFields
    var newState = !this.areSubtotalsVisible(axetype)

    if (axetype === AxeType.ROWS) {
      this.runtimeVisibility['subtotals']['rows'] = newState
      axeFields = this.rowFields
    } else if (axetype === AxeType.COLUMNS) {
      this.runtimeVisibility['subtotals']['columns'] = newState
      axeFields = this.columnFields
    } else {
      return false
    }

    newState = newState === false ? null : true
    for (i = 0; i < axeFields.length; i++) {
      if (axeFields[i].subTotal.visible !== false) {
        axeFields[i].subTotal.visible = newState
      }
    }
    return true
  }

  areSubtotalsVisible (axetype) {
    if (axetype === AxeType.ROWS) {
      return this.runtimeVisibility['subtotals']['rows']
    } else if (axetype === AxeType.COLUMNS) {
      return this.runtimeVisibility['subtotals']['columns']
    } else {
      return null
    }
  }

  toggleGrandtotal (axetype) {
    var newState = !this.isGrandtotalVisible(axetype)

    if (axetype === AxeType.ROWS) {
      this.grandTotal.rowsvisible = newState
    } else if (axetype === AxeType.COLUMNS) {
      this.grandTotal.columnsvisible = newState
    } else {
      return false
    }
    return true
  }

  isGrandtotalVisible (axetype) {
    if (axetype === AxeType.ROWS) {
      return this.grandTotal.rowsvisible
    } else if (axetype === AxeType.COLUMNS) {
      return this.grandTotal.columnsvisible
    } else {
      return false
    }
  }
}