import { createSelector } from 'reselect';
import pass from '../utils/Filtering';
import { isUndefined } from '../utils/generic';

const getFilters = state => state.filters || {};
const getData = state => state.data;

export const filteredDataSelector = createSelector(
  [getData, getFilters, state => state.dimensions],
  (data, filtersObject, dimensions) => {
    const filters = [
      ...Object.keys(filtersObject).map(id => filtersObject[id])
    ];
    if (filters.length === 0) {
      return data;
    }
    return data.filter(row =>
      filters.every(filter =>
        pass(filter, dimensions[filter.dimensionId].keyAccessor(row))
      )
    );
  }
);

export const dimensionValuesSelector = createSelector(
  [getData, getFilters, state => state.dimensions],
  (data, filters, dimensions) => id => {
    const dimension = dimensions[id];
    const filter = filters[id] || {};

    let values = {};
    let countNotFiltered = 0;
    // We use data here instead of filteredData
    // Otherwise you lose the filtered values the next time you open a Filter Panel
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      const key = dimension.keyAccessor(row);
      if (isUndefined(values[key])) {
        const label = dimension.labelAccessor(row);
        const sortKey = dimension.sort.keyAccessor(row);
        const isNotFiltered = pass(filter, key);
        countNotFiltered += isNotFiltered;
        values[key] = {
          key: key,
          label: label,
          sortKey: sortKey,
          filterOperator: filter.operator,
          isNotFiltered: isNotFiltered
        };
      }
    }
    values = Object.keys(values).map(key => values[key]);
    let sortFunction;
    if (dimension.sort.custom) {
      sortFunction = (a, b) => dimension.sort.custom(a.sortKey, b.sortKey);
    } else {
      sortFunction = (a, b) =>
        (a.sortKey > b.sortKey) - (b.sortKey > a.sortKey);
    }
    values.sort(sortFunction);
    return { values, noFilter: values.length === countNotFiltered };
  }
);
export const dimensionFiltersSelector = createSelector(
  [getFilters],
  filters => dimensionId => filters[dimensionId]
);
