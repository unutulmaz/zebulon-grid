import { FETCH_DATA, PUSH_DATA, FETCH_SUCCESS } from "../constants";

export default (state = { data: [], pushedData: [] }, action) => {
	switch (action.type) {
		case PUSH_DATA:
			return {
				...state,
				pushedData: action.pushedData
			};
		case FETCH_DATA:
			return { data: [], pushedData: [] };
		case FETCH_SUCCESS:
			return { data: action.data, pushedData: [] };
		default:
			return state;
	}
};
