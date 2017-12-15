import React, { Component } from "react";
import { ScrollableArea } from "./ScrollableArea";
import { AxisType, toAxis } from "../../constants";
export class ScrollableGrid extends ScrollableArea {
  constructor(props) {
    super(props);
    this.state = {
      scroll: {
        rows: { index: 0, direction: 1, startIndex: 0, shift: 0, position: 0 },
        columns: {
          index: 0,
          direction: 1,
          startIndex: 0,
          shift: 0,
          position: 0
        }
      },
      selectedRange: { start: {}, end: {} }
    };
  }
  // ------------------------------------------------
  // selected range
  // ------------------------------------------------
  selectedRange = () => this.state.selectedRange;
  selectedCell = () => ({ ...this.state.selectedRange.end });
  selectCell = (cell, extension) => {
    const range = extension
      ? { ...this.selectedRange(), end: cell }
      : { start: cell, end: cell };
    this.setState({ selectedRange: range });
    if (this.props.selectRange) {
      this.props.selectRange(this.state.selectedRange);
    }
  };

  // ------------------------------------------------
  // to be overwritten
  // ------------------------------------------------
  scrollOnKey = (cell, axis, direction) => {
    const scroll = this.state.scroll;
    if (
      this.scrollbars[axis === AxisType.ROWS ? "vertical" : "horizontal"]
        .width &&
      ((direction === 1 &&
        cell[toAxis(axis)] >= this.stopIndex[toAxis(axis)]) ||
        (direction === -1 &&
          cell[toAxis(axis)] <= scroll[toAxis(axis)].startIndex))
    ) {
      this.onScroll(axis, -direction, cell[toAxis(axis)]);
    }
  };

  lastIndex = (axis, direction) => {
    const last =
      axis === AxisType.COLUMNS
        ? this.props.meta.length - 1
        : this.props.data.length - 1;
    return direction === 1 ? last : 0;
  };
  nextIndex = (axis, direction, index, offset) => {
    const last =
      axis === AxisType.COLUMNS
        ? this.props.meta.length - 1
        : this.props.data.length - 1;
    return Math.max(0, Math.min(last, index + offset * direction));
  };
  nextPageIndex = (axis, direction, index) => {
    // a voir
    const last =
      axis === AxisType.COLUMNS
        ? this.props.meta.length - 1
        : this.props.data.length - 1;
    const offset =
      this.stopIndex[toAxis(axis)] - this.state.scroll[toAxis(axis)].startIndex;
    return Math.max(0, Math.min(last, index + offset * direction));
  };
  // ------------------------------------------------
  nextCell = (axis, direction, offset) => {
    const cell = this.selectedCell();
    cell[toAxis(axis)] = this.nextIndex(
      axis,
      direction,
      cell[toAxis(axis)],
      offset
    );
    return cell;
  };
  nextPageCell = (axis, direction) => {
    const cell = this.selectedCell();
    cell[toAxis(axis)] = this.nextPageIndex(
      axis,
      direction,
      cell[toAxis(axis)]
    );
    return cell;
  };
  endCell = (axis, direction) => {
    const cell = this.selectedCell();
    cell[toAxis(axis)] = this.lastIndex(axis, direction);
    return cell;
  };

  handleNavigationKeys = e => {
    // arrow keys
    if ((e.which > 32 && e.which < 41) || e.which === 9) {
      let direction, cell, axis;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        direction = e.key === "ArrowDown" ? 1 : -1;
        axis = AxisType.ROWS;
        cell = this.nextCell(axis, direction, 1);
      } else if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "Tab"
      ) {
        if (document.activeElement.tagName === "INPUT" && e.key !== "Tab") {
          return;
        }
        direction =
          e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey) ? 1 : -1;
        axis = AxisType.COLUMNS;
        cell = this.nextCell(axis, direction, 1);
      } else if (e.key === "PageUp" || e.key === "PageDown") {
        direction = e.key === "PageDown" ? 1 : -1;
        axis = e.altKey ? AxisType.COLUMNS : AxisType.ROWS;
        cell = this.nextPageCell(axis, direction);
      } else if (e.key === "Home" || e.key === "End") {
        direction = e.key === "End" ? 1 : -1;
        axis = e.altKey ? AxisType.COLUMNS : AxisType.ROWS;
        cell = this.endCell(axis, direction);
      }
      // selection
      this.selectCell(cell, e.shiftKey && e.key !== "Tab");
      this.scrollOnKey(cell, axis, direction);
      e.preventDefault();
      return { ...cell, axis, direction };
    }
  };

  onScroll = (axis, dir, ix, positionRatio) => {
    const scroll = this.state.scroll;
    const { height, width, rowHeight, data, meta } = this.props;
    const newScroll = {
      rows: { ...scroll.rows },
      columns: { ...scroll.columns }
    };
    let startIndex = ix,
      index = ix,
      direction = dir,
      shift = 0,
      position;

    // scroll event =>scroll by position
    if (axis === AxisType.COLUMNS) {
      if (ix === null && positionRatio !== null) {
        const lastColumn = meta[meta.length - 1];
        position = (lastColumn.position + lastColumn.width) * positionRatio;
        const column = meta.find(
          column =>
            position >= column.position &&
            position <= column.position + column.width
        );
        shift = column.position - position;
        direction = 1;
        index = column.index_;
        startIndex = index;
      } else if (direction === 1) {
        startIndex = index;
        position = meta[index].position;
      } else {
        let visibleWidth = width - this.scrollbars.vertical.width;
        position = Math.max(
          0,
          meta[index].position + meta[index].width - visibleWidth
        );
        const column = meta.find(
          column =>
            position >= column.position &&
            position <= column.position + column.width
        );
        startIndex = column.index_;
        console.log(column, position, visibleWidth);
        shift = Math.min(0, column.position - position);
      }
      newScroll.columns = {
        index,
        direction,
        startIndex,
        shift,
        position
      };
      // console.log(column, newScroll);
      // scroll by row step
    } else if (axis === AxisType.ROWS) {
      const visibleHeight = height - this.scrollbars.horizontal.width;
      const nRows = Math.ceil(visibleHeight / rowHeight);
      // scroll event
      if (ix === null && positionRatio !== null) {
        startIndex = Math.round(data.length * positionRatio);
        direction = Math.sign(
          scroll.rows.startIndex +
            (scroll.rows.direction === -1 ? 1 : 0) -
            startIndex
        );
        index =
          direction === 1
            ? startIndex
            : Math.min(startIndex + nRows - 1, data.length - nRows);
      } else {
        startIndex = direction === 1 ? index : Math.max(0, index - nRows + 1);
      }
      newScroll.rows = {
        index,
        direction,
        startIndex,
        shift: direction === -1 ? visibleHeight - nRows * rowHeight : 0
      };
    }
    if (direction) {
      this.setState({ scroll: newScroll });
      if (this.props.onScroll) {
        this.props.onScroll(newScroll);
      }
      return true;
    }
  };

  onScrollEvent = e => {
    if (e.type === "scrollbar") {
      this.onScroll(
        e.direction === "horizontal" ? AxisType.COLUMNS : AxisType.ROWS,
        null,
        null,
        e.positionRatio
      );
    }
  };
  _getContent = () => {
    const content = this.getContent();
    const rows = content.props.children;
    let rowIndex, columnIndex;
    if (Array.isArray(rows) && rows.length) {
      rowIndex = this.state.scroll.rows.startIndex + rows.length - 1;
      const columns = rows[0].props.children;
      if (Array.isArray(columns) && columns.length) {
        columnIndex = this.state.scroll.columns.startIndex + columns.length - 1;
      }
    }
    this.stopIndex = { rows: rowIndex, columns: columnIndex };
    return content;
  };
}