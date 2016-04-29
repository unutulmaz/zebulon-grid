// declaration types for react-virtualized
interface GridProps{
  width: number,
  height: number,
  columnWidth:number,
  rowHeight:number,
  columnsCount:number,
  rowsCount:number,
  renderCell:({columnIndex, rowIndex}) => JSX.Element
}

interface ScrollSyncProps{
  // children:({onScroll, scrollLeft, scrollTop}) =>JSX.Element
}

declare module "react-virtualized"{
  class Grid extends __React.Component<GridProps,{}>{}

  class ScrollSync extends __React.Component<ScrollSyncProps,{}>{}
}
