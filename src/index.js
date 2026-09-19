import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, useLocation } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import Layout from "./Layout";
import ManagedContent from "./components/ManagedContent";
import { ContentProvider } from "./ContentProvider";
import { getPageSlug } from "./content";
import "./index.css";

function ContentfulPage() {
  const { pathname } = useLocation();
  return <ManagedContent name={getPageSlug(pathname)} showLastUpdated={false} />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Layout />}>
        <Route index element={<ContentfulPage />} />
        <Route path="*" element={<ContentfulPage />} />
      </Route>
    </Route>,
  ),
);

const theme = extendTheme({
  colors: {
    black: "#1d1d1b",
    brand: { 300: "#ffffff", 500: "#007bc4", 900: "#161b4e", header: "#007bc4" },
    rainbows: { 300: "#ffffff", 500: "#e1120e", 900: "#96d3f5", header: "#e1120e" },
    brownies: { 300: "#603d33", 500: "#603d33", 900: "#ffc80a", header: "#603d33" },
    guides: { 300: "#ffffff", 500: "#8cb5e2", 900: "#173a86", header: "#173a86" },
    rangers: { 300: "#fbdfe7", 500: "#e1120e", 900: "#54184a", header: "#54184a" },
  },
  fonts: { body: "Poppins, Century Gothic, sans-serif", heading: "Poppins, Century Gothic, sans-serif" },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ContentProvider>
        <RouterProvider router={router} />
      </ContentProvider>
    </ChakraProvider>
  </React.StrictMode>,
);

reportWebVitals();
