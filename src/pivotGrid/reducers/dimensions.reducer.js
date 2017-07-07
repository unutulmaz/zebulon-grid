import { SET_DIMENSIONS, CHANGE_SORT_ORDER } from '../constants';

export default (state = {}, action) => {
  const { type, dimensions, key } = action;
  let sort;
  switch (type) {
    case SET_DIMENSIONS:
      return dimensions.reduce(
        (acc, dimension) => ({ ...acc, [dimension.id]: dimension }),
        {}
      );
    case CHANGE_SORT_ORDER:
      let dimension = state[key];
      sort = dimension.sort;
      sort.sortedBy = null;
      if (sort.direction === 'desc') {
        sort.direction = 'asc';
      } else {
        sort.direction = 'desc';
      }
      const dimensionsSort = { [key]: { ...dimension, sort } };
      if (dimension.isAttribute) {
        dimensionsSort[dimension.isAttributeOf] = {
          ...state[dimension.isAttributeOf],
          sort: {
            ...state[dimension.isAttributeOf].sort,
            sortedBy: key
          }
        };
      }

      return {
        ...state,
        ...dimensionsSort
        // [dimension.id]: { ...state[dimension.id], sort },
      };
    default:
      return state;
  }
};
