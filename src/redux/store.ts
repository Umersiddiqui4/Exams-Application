import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // This uses localStorage
import rootReducer from './rootReducer' // Import your root reducer

// Redux Persist configuration
const persistConfig = {
  key: 'root',  // Unique key for your persisted state
  storage, // Local storage for persistence
  // Persist only lightweight slices to avoid quota errors
  whitelist: ['auth', 'examData'],
}

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
})

const persistor = persistStore(store) // Persistor that manages rehydration

export { store, persistor }
