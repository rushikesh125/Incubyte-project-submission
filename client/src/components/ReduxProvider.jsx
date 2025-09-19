"use client";
import { store,persistor } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <div>{children}</div>
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
