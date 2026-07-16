import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import homeReducer from './slices/homeSlice';
import shortlistReducer from './slices/shortlistSlice';
import referralReducer from './slices/referralSlice';

const reactotronEnhancer =
  __DEV__ && require('../config/ReactotronConfig').default.createEnhancer
    ? require('../config/ReactotronConfig').default.createEnhancer()
    : undefined;

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'profile'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  home: homeReducer,
  shortlist: shortlistReducer,
  referral: referralReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__,
  enhancers: getDefaultEnhancers =>
    reactotronEnhancer
      ? getDefaultEnhancers().concat(reactotronEnhancer)
      : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
