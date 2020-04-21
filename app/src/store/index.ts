import {patientsReducer} from './patients/reducers';
import {serverReducer} from './server/reducers';
import {createStore, combineReducers} from 'redux';

const rootReducer = combineReducers({
  server: serverReducer,
  patients: patientsReducer,
});
export type RootState = ReturnType<typeof rootReducer>;
export const store = createStore(rootReducer);
