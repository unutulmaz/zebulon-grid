import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Grid as ReactVirtualizedGrid } from 'react-virtualized/dist/commonjs/Grid';

import { AxisType, toAxis } from '../../Axis';
import { Header, DataHeader, HeaderType } from '../../Cells';
import { MEASURE_ID, TOTAL_ID, ROOT_ID, KEY_SEPARATOR } from '../../constants';
import HeaderComponent from '../Header';
import getHeaderSize from '../../utils/headerSize';
import { isNullOrUndefined, isNull } from '../../utils/generic';
function toComponent(
  header,
  caption,
  axisType,
  startIndex,
  scrollTop,
  scrollLeft,
  previewSizes,
  getLastChildSize,
  span,
  positionStyle,
  dimensionKey,
  isNotCollapsible,
  isAffixManaged,
  toggleCollapse,
  selectAxis,
  gridId
) {
  return (
    <HeaderComponent
      key={`header-${header.key}`}
      axis={axisType} //{AxisType.ROWS}
      header={header}
      caption={caption}
      positionStyle={positionStyle}
      span={span}
      startIndex={startIndex}
      scrollLeft={scrollLeft}
      scrollTop={scrollTop}
      previewSizes={previewSizes}
      getLastChildSize={getLastChildSize}
      dimensionKey={dimensionKey}
      isNotCollapsible={isNotCollapsible}
      isAffixManaged={isAffixManaged}
      gridId={gridId}
      toggleCollapse={toggleCollapse}
      selectAxis={selectAxis}
    />
  );
}

class Headers extends PureComponent {
  constructor() {
    super();
    this.headersRenderer = this.headersRenderer.bind(this);
    this.cellCache = {};
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.headers !== this.props.headers) {
      this.cellCache = {};
    }
    // this.cellCache = this.getState(cellCache);
  }
  componentDidUpdate(prevProps) {
    if (
      prevProps.sizes !== this.props.sizes ||
      prevProps.zoom !== this.props.zoom
    ) {
      this.grid.recomputeGridSize();
    }
  }

  headersRenderer({
    rowSizeAndPositionManager,
    rowStartIndex,
    rowStopIndex,
    columnSizeAndPositionManager,
    columnStartIndex,
    columnStopIndex,
    scrollTop,
    scrollLeft,
    verticalOffsetAdjustment,
    horizontalOffsetAdjustment
  }) {
    const {
      headers,
      leaves,
      rowCount,
      columnCount,
      previewSizes,
      getLastChildSize,
      // getCrossSize,
      // crossPositions,
      getColumnWidth,
      getRowHeight,
      gridId,
      dimensions,
      measures,
      data,
      axisType,
      toggleCollapse,
      selectAxis
    } = this.props;

    // this.firstLeafHeader =
    //   headers[rowStartIndex][headers[rowStartIndex].length - 1];

    const renderedCells = [];
    let startIndex,
      stopIndex,
      sizeAndPositionManager,
      offsetAdjustment,
      crossSizeAndPositionManager;
    if (axisType === AxisType.ROWS) {
      startIndex = rowStartIndex;
      stopIndex = rowStopIndex;
      sizeAndPositionManager = rowSizeAndPositionManager;
      crossSizeAndPositionManager = columnSizeAndPositionManager;
      offsetAdjustment = verticalOffsetAdjustment;
    } else {
      startIndex = columnStartIndex;
      stopIndex = columnStopIndex;
      sizeAndPositionManager = columnSizeAndPositionManager;
      crossSizeAndPositionManager = rowSizeAndPositionManager;
      offsetAdjustment = horizontalOffsetAdjustment;
    }
    // Because of the offset caused by the fixed headers,

    // we have to make the cell count artificially higher.
    // This ensures that we don't render inexistent headers.
    const correctStopIndex = Math.min(stopIndex, leaves.length - 1);

    const renderedHeaderKeys = {};
    let header;
    let dimensionIndex;
    // collapse expand management
    let collapsedSize = 0;
    let collapsedOffset = 0;
    let nextDimensionIsAttribute, size;
    const collapsedSizes = [];
    const getSize = axisType === AxisType.ROWS ? getColumnWidth : getRowHeight;
    const lastNotMeasureDimensionIndex =
      dimensions.length - 1 - !isNull(measures);
    const measuresCount = isNull(measures)
      ? 1
      : Object.keys(measures).length || 1;

    // loop on leaves + parent leaf
    for (let index = lastNotMeasureDimensionIndex; index >= 0; index -= 1) {
      if (nextDimensionIsAttribute) {
        collapsedSizes.push(0);
      } else {
        collapsedSizes.push(collapsedSize);
      }
      nextDimensionIsAttribute = dimensions[index].isAttribute;
      size = getSize({
        index: [index]
      });
      collapsedSize += size;
    }
    collapsedSizes.reverse();
    for (let index = startIndex; index <= correctStopIndex; index += 1) {
      header = leaves[index];
      while (header.id !== ROOT_ID && !renderedHeaderKeys[header.key]) {
        if (header.isCollapsed) {
          header.depth = header.depth;
        }
        renderedHeaderKeys[header.key] = true;
        let cell = this.cellCache[header.key];
        if (isNullOrUndefined(cell) || true) {
          const dimension = dimensions[header.depth];

          let caption;
          if (header.type === HeaderType.DIMENSION) {
            caption = dimension.format(
              dimension.labelAccessor(data[header.dataIndexes[0]])
            );
          } else {
            caption = measures[header.id].caption;
          }

          const main = sizeAndPositionManager.getSizeAndPositionOfCell(index);
          const mainOffset = main.offset + offsetAdjustment;

          const span = header.span;
          // const span = header.orderedChildrenIds.length || 1;
          const mainSize = getHeaderSize(sizeAndPositionManager, index, span);
          // 3 cases: normal dimension header, measure header or total header
          // let left = 0;
          // if (!header.dim) {
          //   // Measure header
          //   width = getCrossSize(AxisType.ROWS, MEASURE_ID);
          //   left += dimensionPositions.rows[MEASURE_ID];
          // } else if (header.dim.dimension) {
          // Normal dimension header
          //
          // const crossSize = getCrossSize(axisType, dimension.id);
          const cross = crossSizeAndPositionManager.getSizeAndPositionOfCell(
            header.depth
          );
          collapsedSize = 0;
          // collapsedOffset = 0;
          if (header.isCollapsed && collapsedSizes.length > 0) {
            if (header.type !== HeaderType.MEASURE) {
              //   collapsedOffset = collapsedSizes[0];
              // } else {
              collapsedSize = collapsedSizes[header.depth];
            }
          }

          let positionStyle;
          if (axisType === AxisType.ROWS) {
            positionStyle = {
              position: 'absolute',
              left: cross.offset,
              top: mainOffset,
              height: mainSize,
              width: cross.size + collapsedSize
            };
          } else {
            positionStyle = {
              position: 'absolute',
              left: mainOffset,
              top: cross.offset,
              height: cross.size + collapsedSize,
              width: mainSize
            };
          }
          const isNotCollapsible =
            header.type === HeaderType.MEASURE ||
            dimension.isAttribute ||
            header.depth >= lastNotMeasureDimensionIndex ||
            (!header.isCollapsed && span === measuresCount);

          cell = toComponent(
            header,
            caption,
            axisType,
            rowStartIndex,
            scrollTop,
            scrollLeft,
            previewSizes,
            getLastChildSize,
            span,
            positionStyle,
            dimension.id,
            isNotCollapsible,
            index === startIndex && header.depth < lastNotMeasureDimensionIndex,
            toggleCollapse,
            selectAxis,
            gridId
          );
          this.cellCache[header.key] = cell;
        }
        // read parents 9but only once)
        renderedCells.push(cell);
        header = header.parent;
      }
    }

    return renderedCells;
  }

  render() {
    const {
      zoom,
      getRowHeight,
      getColumnWidth,
      columnCount,
      rowCount,
      scrollTop,
      scrollLeft,
      height,
      width
    } = this.props;
    return (
      <ReactVirtualizedGrid
        cellRangeRenderer={this.headersRenderer}
        cellRenderer={function mock() {}}
        // className="pivotgrid-row-headers"
        // The position of inner style was set to static in react-virtualized 9.2.3
        // This broke the grid because the height of the inner container was not reset
        // when the height prop changed
        // This is a workaround
        containerStyle={{ position: 'static' }}
        height={height}
        width={width}
        rowCount={rowCount}
        rowHeight={getRowHeight}
        columnCount={columnCount}
        columnWidth={getColumnWidth}
        overscanRowCount={0}
        ref={ref => {
          this.grid = ref;
        }}
        scrollLeft={scrollLeft}
        scrollTop={scrollTop}
        // We set overflowX and overflowY and not overflow
        // because react-virtualized sets them during render
        style={{
          fontSize: `${zoom * 100}%`,
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      />
    );
  }
}

Headers.propTypes = {
  columnCount: PropTypes.number.isRequired,
  headers: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.instanceOf(Header),
        PropTypes.instanceOf(DataHeader)
      ])
    )
  ).isRequired,
  dimensionPositions: PropTypes.shape({
    columns: PropTypes.objectOf(PropTypes.number),
    rows: PropTypes.objectOf(PropTypes.number)
  }).isRequired,
  getColumnWidth: PropTypes.func.isRequired,
  // getCrossSize: PropTypes.func.isRequired,
  // getLastChildSize: PropTypes.func.isRequired,
  getRowHeight: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  previewSizes: PropTypes.objectOf(PropTypes.number).isRequired,
  rowCount: PropTypes.number.isRequired,
  scrollTop: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired
};

export default Headers;
