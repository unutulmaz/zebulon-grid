import {
  MOVE_DIMENSION,
  MOVE_MEASURE,
  TOGGLE_MEASURE,
  SET_AXIS,
  FETCH_DATA
} from "../constants";
import { isNullOrUndefined } from "../utils/generic";
export default (
  state = { rows: [], columns: [], dimensions: [], measures: [] },
  action
) => {
  const { type, id, position, oldAxis, newAxis, axis } = action;
  let newAxisValue;
  let oldAxisValue;
  let oldPosition;
  let positionToRemove;
  let newPosition = position;
  switch (type) {
    case FETCH_DATA:
      return { rows: [], columns: [], dimensions: [], measures: [] };
    case MOVE_DIMENSION:
      if (isNullOrUndefined(newPosition) && newAxis !== oldAxis) {
        newPosition = state[newAxis].length;
      }

      if (oldAxis !== newAxis) {
        oldAxisValue = state[oldAxis].filter(dimension => dimension !== id);
        newAxisValue = [
          ...state[newAxis].slice(0, newPosition),
          id,
          ...state[newAxis].slice(newPosition)
        ];
        return { ...state, [oldAxis]: oldAxisValue, [newAxis]: newAxisValue };
      }
      oldPosition = state[oldAxis].indexOf(id);
      if (oldPosition === newPosition) {
        return state;
      }
      newAxisValue = [
        ...state[oldAxis].slice(0, newPosition),
        id,
        ...state[oldAxis].slice(newPosition)
      ];
      if (oldPosition > -1) {
        // in this case, we need to remove the value at old position
        if (oldPosition < newPosition) {
          positionToRemove = oldPosition;
        } else {
          positionToRemove = oldPosition + 1;
        }
        newAxisValue = [
          ...newAxisValue.slice(0, positionToRemove),
          ...newAxisValue.slice(positionToRemove + 1)
        ];
      }
      return { ...state, [newAxis]: newAxisValue };
    case MOVE_MEASURE:
      if (isNullOrUndefined(newPosition)) {
        newPosition = state.measures.length;
      }
      oldPosition = state.measures.indexOf(id);
      if (oldPosition === newPosition) {
        return state;
      }
      newAxisValue = [
        ...state.measures.slice(0, Math.max(oldPosition, 0)),
        ...state.measures.slice(oldPosition + 1)
      ];

      newAxisValue = [
        ...newAxisValue.slice(0, newPosition),
        id,
        ...newAxisValue.slice(newPosition)
      ];
      return { ...state, measures: newAxisValue };
    case TOGGLE_MEASURE:
      oldPosition = state.measures.indexOf(id);
      if (oldPosition > -1) {
        return {
          ...state,
          measures: [
            ...state.measures.slice(0, oldPosition),
            ...state.measures.slice(oldPosition + 1)
          ]
        };
      } else {
        return { ...state, measures: [...state.measures, id] };
      }
    case SET_AXIS:
      return { ...state, ...axis };
    default:
      return state;
  }
};
