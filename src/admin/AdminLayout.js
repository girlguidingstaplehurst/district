import { Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import Footer from "../components/Footer";
import AdminHeader from "./components/AdminHeader";

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Stack minH="100vh" spacing={4}>
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      </Stack>
      <Footer />
    </>
  );
}

export default AdminLayout;
