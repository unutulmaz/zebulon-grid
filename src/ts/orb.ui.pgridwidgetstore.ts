/**
* @fileOverview Pivot Grid axe viewmodel
* @author Najmeddine Nouri <najmno@gmail.com>
*/

'use strict';

/* global module, require, React, window */
/*jshint eqnull: true*/

import * as React from 'react';
import {observable} from 'mobx';

import {Axe, AxeType} from './orb.axe';
import {PGrid, EVENT_UPDATED, EVENT_CONFIG_CHANGED, EVENT_SORT_CHANGED} from './orb.pgrid';
import {HeaderType, DataCell, CellBase} from './orb.ui.header';
import {UiRows} from './orb.ui.rows';
import {UiCols} from './orb.ui.cols';

// import Dialog from './react/orb.react.Dialog';
// import Grid from './react/orb.react.Grid';


/**
* Creates a new instance of pivot grid control
* @class
* @memberOf orb.ui
* @param  {object} pgrid - pivot grid instance
*/
export class PGridWidgetStore {

  /**
   * Parent pivot grid
   * @type {orb.pgrid}
   */
  public pgrid: PGrid;

  /**
   * Control rows headers
   * @type {orb.ui.rows}
   */
  @observable public rows: UiRows = null;
  /**
   * Control columns headers
   * @type {orb.ui.cols}
   */
  @observable public columns: UiCols = null;


  @observable public layout = {
      cell: {
        /**
        * Dimensions of a cell
        */
        height: 30,
        width: 100
      },
      rowHeaders: {
          /**
           * Total number of horizontal row headers.
           * @type {Number}
           */
          width: undefined,
          /**
           * Total number of vertical row headers.
           * @type {Number}
           */
          height: undefined
      },
      columnHeaders: {
          /**
           * Total number of horizontal column headers.
           * @type {Number}
           */
          width: undefined,
          /**
           * Total number of vertical column headers.
           * @type {Number}
           */
          height: undefined
      },
      pivotTable: {
          /**
           * Total number of horizontal cells of the whole pivot grid control.
           * @type {Number}
           */
          width: undefined,
          /**
           * Total number of vertical cells of the whole pivot grid control.
           * @type {Number}
           */
          height: undefined
      }
  };
  public pivotComponent: React.Component<any,{}|void> | Element | void;

  public dialog;

  constructor(config) {
      // this.dialog = Dialog.create();
      this.pgrid = new PGrid(config);
      this.init();
  };

  init() {
      this.pgrid.subscribe(EVENT_UPDATED, this.buildUi.bind(this));
      this.pgrid.subscribe(EVENT_SORT_CHANGED, this.buildUi.bind(this));
      this.pgrid.subscribe(EVENT_CONFIG_CHANGED, this.buildUi.bind(this));

      this.buildUi();
  }

  buildUi() {
      console.log(`buildUi`, this.pgrid);
      // build row and column headers
      this.rows = new UiRows(this.pgrid.rows);
      this.columns = new UiCols(this.pgrid.columns);

      // set control layout infos
      this.layout.rowHeaders = {
          width: (this.pgrid.rows.fields.length || 1) +
          (this.pgrid.config.dataHeadersLocation === 'rows' && this.pgrid.config.dataFieldsCount > 1 ? 1 : 0),
          height: this.rows.headers.length
      };
      this.layout.columnHeaders = {
          width: this.columns.leafsHeaders.length,
          height: (this.pgrid.columns.fields.length || 1) +
          (this.pgrid.config.dataHeadersLocation === 'columns' && this.pgrid.config.dataFieldsCount > 1 ? 1 : 0)
      };

      this.layout.pivotTable = {
          width: this.layout.rowHeaders.width + this.layout.columnHeaders.width,
          height: this.layout.rowHeaders.height + this.layout.columnHeaders.height
      };

      var arr;

      console.log(this);
  }

  expandRow(cell) {
      cell.expand();
  };

  collapseRow(cell) {
      cell.subtotalHeader.collapse();
  };

  sort(axetype, field) {
      this.pgrid.sort(axetype, field);
  };

  refreshData(data) {
      this.pgrid.refreshData(data);
  };

  applyFilter(fieldname, operator, term, staticValue, excludeStatic) {
      this.pgrid.applyFilter(fieldname, operator, term, staticValue, excludeStatic);
  };

  moveField(field, oldAxeType, newAxeType, position) {
      this.pgrid.moveField(field, oldAxeType, newAxeType, position);
  };

  toggleFieldExpansion (axetype, field, newState) {
      var axeToExpand =
          axetype === AxeType.ROWS
          ? this.rows
          : (axetype === AxeType.COLUMNS
          ? this.columns
          : null);

      // if (axeToExpand && axeToExpand.toggleFieldExpansion(field, newState)) {
      //     this.render();
      // }
  };

  toggleSubtotals(axetype) {
      this.pgrid.toggleSubtotals(axetype);
  };

  areSubtotalsVisible(axetype) {
      return this.pgrid.areSubtotalsVisible(axetype);
  };

  toggleGrandtotal(axetype) {
      this.pgrid.toggleGrandtotal(axetype);
  };

  isGrandtotalVisible(axetype) {
      return this.pgrid.isGrandtotalVisible(axetype);
  };

  changeTheme(newTheme) {
      this.pivotComponent['changeTheme'](newTheme);
  };

  drilldown(dataCell) {
      // if(dataCell) {
      //     var colIndexes = dataCell.columnDimension.getRowIndexes();
      //     var data = dataCell.rowDimension.getRowIndexes()
      //       .filter(index => colIndexes.indexOf(index) >= 0)
      //       .map(index => this.pgrid.filteredDataSource[index]);
      //
      //     var title;
      //     if(dataCell.rowType === HeaderType.GRAND_TOTAL && dataCell.colType === HeaderType.GRAND_TOTAL) {
      //         title = 'Grand total';``
      //     } else {
      //         if(dataCell.rowType === HeaderType.GRAND_TOTAL) {
      //             title = dataCell.columnDimension.value + '/Grand total ';
      //         } else if(dataCell.colType === HeaderType.GRAND_TOTAL) {
      //             title = dataCell.rowDimension.value + '/Grand total ';
      //         } else {
      //             title = dataCell.rowDimension.value + '/' + dataCell.columnDimension.value;
      //         }
      //     }
      //
      //     this.dialog.show({
      //         title: title,
      //         comp: {
      //             type: Grid,
      //             props: {
      //                 headers: this.pgrid.config.getDataSourceFieldCaptions(),
      //                 data: data,
      //                 theme: this.pgrid.config.theme
      //             }
      //         },
      //         theme: this.pgrid.config.theme
      //         // style: this.pivotComponent['fontStyle']
      //     });
      // }
  };

};
