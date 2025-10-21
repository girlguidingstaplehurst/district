import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import reportWebVitals from "./reportWebVitals";
import Layout from "./Layout";
import ShowCalendar from "./ShowCalendar";
import AddEvent from "./AddEvent";
import NoMatch from "./NoMatch";
import Login from "./admin/Login";

import "./index.css";
import AdminLayout from "./admin/AdminLayout";
import { AuthProvider } from "./admin/useAuth";
import { Dashboard, populateDashboard } from "./admin/Dashboard";
import { reviewEvent, ReviewEvent } from "./admin/ReviewEvent";
import { createInvoice, CreateInvoice } from "./admin/CreateInvoice";
import { ManageInvoice, manageInvoice } from "./admin/ManageInvoice";
import ManagedContent from "./components/ManagedContent";
import { CreateEvents } from "./admin/CreateEvents";
import Location from "./Location";
import WhatsOn from "./WhatsOn";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <ManagedContent
              name="kathie-lamb-guide-centre"
              showLastUpdated={false}
            />
          }
        />
        <Route path="about" element={<ManagedContent name="about" showLastUpdated={false}/>} />
        <Route path="contact" element={<ManagedContent name="contact" showLastUpdated={false}/>} />
        {/*<Route*/}
        {/*  path="booking"*/}
        {/*  element={<ShowCalendar />}*/}
        {/*  loader={async () => await fetch("/api/v1/events")}*/}
        {/*/>*/}
        {/*<Route path="add-event" element={<AddEvent />} />*/}
        {/*<Route*/}
        {/*  path="whats-on"*/}
        {/*  element={<WhatsOn />}*/}
        {/*  loader={async () => await fetch("/api/v1/events")}*/}
        {/*/>*/}
        <Route path="location" element={<Location />} />
        <Route
          path="privacy-policy"
          element={<ManagedContent name="privacy-policy" />}
        />
        <Route
          path="terms-of-hire"
          element={<ManagedContent name="terms-of-hire" />}
        />
        <Route
          path="cleaning-and-damage-policy"
          element={<ManagedContent name="cleaning-and-damage-policy" />}
        />
        <Route path="*" element={<NoMatch />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} loader={populateDashboard} />
        <Route path="create-events" element={<CreateEvents />} />
        <Route
          path="review/:eventID"
          element={<ReviewEvent />}
          loader={({ params }) => reviewEvent(params.eventID)}
        />
        <Route
          path="create-invoice"
          element={<CreateInvoice />}
          loader={({ request }) => {
            const url = new URL(request.url);
            const events = url.searchParams.get("events");
            return createInvoice(events);
          }}
        />
        <Route
          path="invoice/:invoiceID"
          element={<ManageInvoice />}
          loader={({ params }) => manageInvoice(params.invoiceID)}
        />
      </Route>
      <Route path="admin/login" element={<Login />} />
    </Route>,
  ),
);

const theme = extendTheme({
  colors: {
    black: "#1d1d1b",
    brand: {
      300: "#00a7e5",
      500: "#007bc4",
      900: "#161b4e",
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
    <GoogleOAuthProvider clientId="362406102359-frmsjn6et0551pciju1li4mep62thmse.apps.googleusercontent.com">
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ChakraProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
