import React from 'react'
import ReactDOM from 'react-dom'
import { Observable } from 'rx-lite'

// CSS files
import 'react-virtualized/styles.css'
import 'react-resizable/css/styles.css'

import Main from './Main'
// const themeChangeCallbacks = {}

// Do not use the .less files because the compilation is too complicated (cf gulpactions/buildcss.js)
// require('../../../dist/orb.css')
// require('../../deps/bootstrap-3.3.1/css/bootstrap.css')

function getMockDataSource (dataRepetition, nToto) {
  const nTiti = 100
  const nTutu = 2
  var arr = []
  var res = []
  for (var k = 0; k < dataRepetition; k++) {
    for (var o = 0; o < nToto; o++) {
      for (var i = 0; i < nTiti; i++) {
        for (var u = 0; u < nTutu; u++) {
          arr = []
          arr[0] = 'toto' + String(o)
          arr[3] = 'titi' + String(i)
          arr[4] = String(u)
          arr[1] = k + 10 * u + 100 * i * 1000 * o + 1 // +9999999999.1234567890123456
          arr[2] = k + 10 * u + 100 * i * 1000 * o + 1 // +9999999999.1234567890123456
          res.push(arr)
        }
      }
    }
  }
  return res
}

const datasourceArray = [
  getMockDataSource(1, 100),
  ['toto11', 33, 666, 'titi0', 'tutu0'],
  ['toto0', 1, 10, 'titi0', 'tutu0'],
  [['toto1', 10, 100, 'titi0', 'tutu0'], ['toto12', 44, 777, 'titi0', 'tutu0']],
  ['toto2', 10, 100, 'titi0', 'tutu0']
]

const datasource = Observable.interval(0).take(1)
  .map(i => datasourceArray[i])
// .of(datasourceArray[0])

// const datasource = Observable.interval(2000).take(datasourceArray.length)

var config = {
  canMoveFields: true,
  dataHeadersLocation: 'columns',
  width: 1099,
  height: 601,
  theme: 'green',
  toolbar: {
    visible: true
  },
  grandTotal: {
    rowsvisible: false,
    columnsvisible: false
  },
  subTotal: {
    visible: false,
    collapsed: false,
    collapsible: false
  },
  rowSettings: {
    subTotal: {
      visible: false,
      collapsed: false,
      collapsible: false
    }
  },
  columnSettings: {
    subTotal: {
      visible: false,
      collapsed: false,
      collapsible: false
    }
  },
  fields: [
    {
      name: '0',
      caption: 'Toto',
      sort: {
        order: 'asc'
      }
    },
    // {
    //     name: '1',
    //     caption: 'Product',
    // },
    // {
    //     name: '2',
    //     caption: 'Manufacturer',
    //     sort: {
    //         order: 'asc'
    //     },
    //     rowSettings: {
    //         subTotal: {
    //             visible: false,
    //             collapsed: true,
    //             collapsible: true
    //         }
    //     },
    // },
    {
      name: '3',
      caption: 'Titi'
    },
    {
      name: '4',
      caption: 'Tutu'
    }
    // {
    //     name: '4',
    //     caption: 'Category',
    //     sort: {
    //         customfunc: function(a, b) {
    //             if(a.trim() == 'Touch Screen Phones'){
    //              return -1
    //             }
    //             if(a < b) return -1
    //             if(a > b) return 1
    //             return 0
    //         }
    //     }
    // },
  ],
  dataFields: [
    {
      name: '2',
      caption: 'Quantity',
      aggregateFunc: 'sum'
    },
    {
      name: '1',
      caption: 'Amount',
      aggregateFunc: 'sum',
      aggregateFuncName: 'whatever',
      formatFunc: (value) => value ? Number(value).toFixed(0) + ' $' : ''
    }
  ],
  columns: ['Titi', 'Tutu'], // , 'Category' ],
  rows: ['Toto'],
  data: ['Quantity'],
  drilldown: (cell) => console.log('drilldown (config) on cell', cell),
  preFilters: {
    // 'Titi': ['titi0']
    // 'Class': { 'Matches': 'Regular' },
    // 'Manufacturer': { 'Matches': /^a|^c/ },
    // 'Category': { 'Does Not Match': 'D' },
    // 'Amount': { '>': 40 },
    // 'Quantity': [4, 8, 12]
  }
}

ReactDOM.render(<Main config={config} datasource={datasource} />, document.getElementById('root'))