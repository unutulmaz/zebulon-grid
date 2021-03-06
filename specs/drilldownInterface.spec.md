# Interface for drilldown
---

## Overview

The drilldown function is a callback passed to the grid to be called when a data cell is double-clicked.

This spec describes the signature of the callback function.

## Drilldown function

The drilldrown function takes a single argument *cellInfos*.

*cellInfos* is an object with the following properties:

- value
- data
- dimensions


*value* is the value of the cell as a string.

*data* is an array of the data used to calculate the value of the cell.

*dimensions* is an array of the dimensions of the cell including measure.

Each dimension is an object containing the following properties:

- axis

- dimension

  - caption
  - id
  - isCollapsed

- cell

  - caption
  - id

where for both *dimension* and *cell*, *caption* is the value displayed on the grid and *id* its id in the data source. *axis* is *rows* or *columns*


