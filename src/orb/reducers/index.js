import { combineReducers } from 'redux';

import data from './dataReducer';
import config from './configReducer';
import fields from './fieldsReducer';
import datafields from './datafieldsReducer';
import axis from './axisReducer';
import sizes from './sizesReducer';
import filters from './filtersReducer';

export default combineReducers({ data, config, fields, datafields, axis, sizes, filters });