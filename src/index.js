import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import reportWebVitals from "./reportWebVitals";
import Layout from "./Layout";
import NoMatch from "./NoMatch";

import "./index.css";
import ManagedContent from "./components/ManagedContent";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <ManagedContent
              name="girlguiding-staplehurst-district"
              showLastUpdated={false}
              theme="brand"
            />
          }
        />
        <Route
          path="2nd-rainbows"
          element={
            <ManagedContent name="2nd-rainbows" showLastUpdated={false} theme="rainbows" />
          }
        />
        <Route
          path="1st-brownies"
          element={
            <ManagedContent name="1st-brownies" showLastUpdated={false} theme="brownies" />
          }
        />
        <Route
          path="4th-brownies"
          element={
            <ManagedContent name="4th-brownies" showLastUpdated={false} theme="brownies" />
          }
        />
        <Route
          path="1st-guides"
          element={<ManagedContent name="1st-guides" showLastUpdated={false} theme="guides" />}
        />
        <Route
          path="1st-rangers"
          element={<ManagedContent name="1st-rangers" showLastUpdated={false} theme="rangers" />}
        />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Route>,
  ),
);

const theme = extendTheme({
  colors: {
    black: "#1d1d1b",
    brand: {
      300: "#ffffff",
      500: "#007bc4",
      900: "#161b4e",
      header: "#007bc4",
    },
    rainbows: {
      300: "#ffffff",
      500: "#e1120e",
      900: "#96d3f5",
      header: "#e1120e",
    },
    brownies: {
      300: "#603d33",
      500: "#603d33",
      900: "#ffc80a",
      header: "#603d33",
    },
    guides: {
      300: "#ffffff",
      500: "#8cb5e2",
      900: "#173a86",
      header: "#173a86"
    },
    rangers: {
      300: "#fbdfe7",
      500: "#e1120e",
      900: "#54184a",
      header: "#54184a",
    },
  },
  fonts: {
    body: "Poppins, Century Gothic, sans-serif",
    heading: "Poppins, Century Gothic, sans-serif",
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
