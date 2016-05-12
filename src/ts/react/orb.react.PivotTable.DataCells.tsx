import * as React from 'react';
import {AxeType} from '../orb.axe';
import PivotRow from './orb.react.PivotRow';

import {Grid, AutoSizer} from 'react-virtualized';
import PivotCell from './orb.react.PivotCell';

import {PGridWidgetStore} from '../orb.ui.pgridwidgetstore';

export interface DataCellsProps{
  pgridwidgetstore: PGridWidgetStore,
  onScroll: any,
  scrollLeft: any,
  scrollTop: any
}

export default class DataCellsComponent extends React.Component<DataCellsProps,{}>{


  render(){
    // console.log('render dataCells');
    const pgridwidgetstore = this.props.pgridwidgetstore;
    const config = pgridwidgetstore.pgrid.config;
    const columnCount = pgridwidgetstore.dataRows[0].length;

    const cellHeight = this.props.pgridwidgetstore.layout.cell.height;
    const cellWidth = this.props.pgridwidgetstore.layout.cell.width;

    return(
      <AutoSizer>
      {({height, width})=>
        <Grid
          onScroll={this.props.onScroll}
          scrollLeft={this.props.scrollLeft}
          scrollTop={this.props.scrollTop}
          width={width}
          height={height}
          columnWidth={cellWidth}
          rowHeight={cellHeight}
          columnCount={columnCount}
          rowCount={pgridwidgetstore.dataRows.length}
          cellRenderer={
            ({columnIndex, rowIndex}) => <PivotCell
                      key={columnIndex}
                      cell={pgridwidgetstore.dataRows[rowIndex][columnIndex]}
                      leftmost={true}
                      topmost={true}
                      pgridwidgetstore={this.props.pgridwidgetstore} />
                      }
          />}
        </AutoSizer>
    )
  }

  _render() {
    const pgridwidgetstore = this.props.pgridwidgetstore;
    const layoutInfos = {
      lastLeftMostCellVSpan: 0,
      topMostCells: {}
    };

    const dataCells = pgridwidgetstore.dataRows.map((dataRow, index) => {
      return <PivotRow key={index}
                       row={dataRow}
                       axetype={AxeType.DATA}
                       layoutInfos={layoutInfos}
                       pgridwidgetstore={this.props.pgridwidgetstore}>
      </PivotRow>;
    });


    return <div className="inner-table-container data-cntr" >
        <table className="inner-table">
            <colgroup>
            </colgroup>
            <tbody>
              {dataCells}
            </tbody>
          </table>
      </div>;
  }
};