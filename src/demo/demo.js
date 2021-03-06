import React from "react";
// "zebulon-controls": "file:../controls/zebulon-controls-1.0.1.tgz",
// "zebulon-table": "file:../table/zebulon-table-1.0.0.tgz"
export const MEASURE_ID = "__measures__";
export const customConfigurationFunctions = (
  prevConfigurationFunctions,
  prevConfiguration
) => {
  const configurationFunctions = {
    ...prevConfigurationFunctions,
    globals_: {
      formats: {
        ...prevConfigurationFunctions.globals_.formats,
        price: ({ value }) => {
          if (Number.isFinite(value)) {
            return (
              <div style={{ color: "blue", textAlign: "right" }}>
                {`${Number(value).toFixed(2)} $`}
              </div>
            );
          }
          return value;
        },
        titiFormat: ({ value }) => (
          <div style={{ color: "red", textAlign: "center" }}>{value}</div>
        )
      },
      accessors: {
        ...(prevConfigurationFunctions.dataset.accessors || {})
      },
      aggregations: {
        ...(prevConfigurationFunctions.dataset.aggregations || {})
      },
      sorts: {
        ...(prevConfigurationFunctions.dataset.aggregations || {}),
        dummySort: (a, b) => {
          const x =
            a % 2 < b % 2 || (a % 2 === b % 2 && a < b)
              ? -1
              : !(a % 2 === b % 2 && a === b) + 0;
          return x;
        }
      }
    }
  };
  const measures = Object.values({
    ...prevConfiguration.measures,
    price: {
      id: "price",
      caption: "Price",
      aggregation: "weighted_avg",
      valueAccessor: "price",
      format: "price"
    }
  });
  const dimensions = Object.values({
    ...prevConfiguration.dimensions,
    titi: {
      id: "titi",
      caption: "Titi",
      keyAccessor: "titi",
      labelAccessor: "titi_lb",
      sort: { keyAccessor: "titi", orderFunctionAccessor: "dummySort" },
      format: "titiFormat"
    }
  });
  const axis = {
    ...prevConfiguration.axis,
    measures: [...prevConfiguration.measures, "price"]
  };
  const configuration = { dimensions, measures, axis };
  const actionContent = (
    <div>
      <div>Add a new measure (Price) with new : </div>
      <div> - custom accessor function ( amounts and quantities)</div>
      <div>
        - custom agregation function ( average of amounts weighted by
        quantities)
      </div>
      <div> - custom format ( blue + $ symbol)</div>
      <div>
        Add a (dummy) sort function for dimension Titi : ordered by even ids,
        then odd ids.
      </div>
      <div> Add a custom format ( red centered) on dimension Titi.</div>
    </div>
  );
  return { configurationFunctions, configuration, actionContent };
};
const cellDisplay = cell => {
  // console.log(cell);
  const rows = cell.dimensions
    .filter(dimension => dimension.axis === "rows")
    .map(dimension => (
      <li key={dimension.dimension.id}>
        {`${dimension.dimension.id === MEASURE_ID
          ? "Measure"
          : dimension.dimension.caption} : ${dimension.cell.caption}`}
      </li>
    ));
  const columns = cell.dimensions
    .filter(dimension => dimension.axis === "columns")
    .map(dimension => (
      <li key={dimension.dimension.id}>
        {`${dimension.dimension.id === MEASURE_ID
          ? "Measure"
          : dimension.dimension.caption} : ${dimension.cell.caption}`}
      </li>
    ));
  const value = (
    <li key={"value"}>{Math.round(cell.value.value * 10000) / 10000}</li>
  );
  return (
    <div style={{ display: "flex", height: "fitContent" }}>
      <div style={{ width: 150, height: "auto" }}>
        <div style={{ paddingLeft: "5px", fontWeight: "bold" }}>Rows</div>
        <ul style={{ paddingLeft: "20px" }}> {rows}</ul>
      </div>
      <div style={{ width: 150 }}>
        <div style={{ paddingLeft: "5px", fontWeight: "bold", height: "auto" }}>
          Columns
        </div>
        <ul style={{ paddingLeft: "20px" }}> {columns}</ul>
      </div>
      <div style={{ width: 90 }}>
        <div style={{ paddingLeft: "5px", fontWeight: "bold", height: "auto" }}>
          Value
        </div>
        <ul style={{ paddingLeft: "20px" }}> {value}</ul>
      </div>
    </div>
  );
};
const rangeDisplay = range => {
  const cellFrom = {
    dimensions: range.rows[0].concat(range.columns[0]),
    value: range.values[0][0]
  };
  const cellTo = {
    dimensions: range.rows[range.rows.length - 1].concat(
      range.columns[range.columns.length - 1]
    ),
    value: range.values[range.rows.length - 1][range.columns.length - 1]
  };
  const divFrom = cellDisplay(cellFrom);
  const divTo = cellDisplay(cellTo);
  let values = {};
  if (range.measuresAxis === "columns") {
    values = range.columns.reduce((values, measure, indexColumn) => {
      if (values[measure.leaf.caption] === undefined) {
        values[measure.leaf.caption] = 0;
      }
      values[
        measure.leaf.caption
      ] += range.rows.reduce((value, dimension, indexRow) => {
        value += range.values[indexRow][indexColumn].value;
        return value;
      }, 0);
      return values;
    }, {});
  } else {
    values = range.rows.reduce((values, measure, indexRow) => {
      if (values[measure.leaf.caption] === undefined) {
        values[measure.leaf.caption] = 0;
      }
      values[
        measure.leaf.caption
      ] += range.columns.reduce((value, dimension, indexColumn) => {
        value += range.values[indexRow][indexColumn].value;
        return value;
      }, 0);
      return values;
    }, {});
  }
  const sums = Object.keys(values).map(measure => (
    <li key={measure}>{`${measure} : ${Math.round(values[measure] * 10000) /
      10000}`}</li>
  ));
  const divValues = (
    <div
      style={{
        width: 160,
        borderLeft: "solid 0.02em",
        height: "auto"
      }}
    >
      <div style={{ paddingLeft: "5px", fontWeight: "bold" }}>
        Sum of values
      </div>
      <ul style={{ paddingLeft: "20px" }}> {sums}</ul>
    </div>
  );
  const div = (
    <div style={{ display: "flex", height: "fitContent" }}>
      <div style={{ borderLeft: "solid 0.02em", height: "auto" }}>
        <div
          style={{
            paddingLeft: "5px",
            fontWeight: "bold",
            textAlign: "left"
          }}
        >
          From
        </div>
        {divFrom}
      </div>
      <div style={{ borderLeft: "solid 0.02em", height: "auto" }}>
        <div
          style={{
            paddingLeft: "5px",
            fontWeight: "bold",
            textAlign: "Left"
          }}
        >
          To
        </div>
        {divTo}
      </div>
      {divValues}
    </div>
  );
  return div;
};
export const exportFile = (content, fileName, mime) => {
  if (mime == null) {
    mime = "text/csv";
  }
  var blob = new Blob([content], { type: mime });
  var a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = [mime, a.download, a.href].join(":");
  var e = document.createEvent("MouseEvents");
  e.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  return a.dispatchEvent(e);
};

export const customMenuFunctions = (prevMenuFunctions, callback) => {
  const menuFunctions = {
    dataCellFunctions: {
      ...prevMenuFunctions.dataCellFunctions,
      cell: {
        code: "cell",
        caption: "Custom cell function",
        type: "MenuItem",
        function: cell => callback("cell", cellDisplay(cell))
      }
    },
    rangeFunctions: {
      ...prevMenuFunctions.rangeFunctions,
      range: {
        code: "range",
        caption: "Custom range function",
        type: "MenuItem",
        function: range => callback("range", rangeDisplay(range))
      }
    },
    gridFunctions: {
      ...prevMenuFunctions.gridFunctions,
      grid: {
        code: "grid",
        type: "MenuItem",
        caption: "Custom export as csv",
        // function: () => <div>toto</div>
        function: ({ grid, toText }) =>
          exportFile(toText(grid, "csv"), "zebulon.csv")
      }
      // ,
      // test: {
      //   code: "test",
      //   type: "SubMenu",
      //   caption: "test",
      //   // function: () => <div>toto</div>
      //   function: () => <div>Test</div>
      // }
    }
  };
  const actionContent = (
    <div>
      <div>
        Add custom menu functions for cell (cells under the right ckick),
        selected range or grid, accesible by the contextual menu on the data
        cells area.
      </div>
      <div>The first cell function is called on doubleclick too.</div>
    </div>
  );
  return { menuFunctions, actionContent };
};

//   return { menuFunctions, actionContent };
// };
