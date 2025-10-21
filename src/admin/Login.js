import { Container, Heading, Stack } from "@chakra-ui/react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import useAuth from "./useAuth";
import AdminHeader from "./components/AdminHeader";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentials) => {
    await login(credentials);
    navigate("/admin");
  };

  return (
    <>
      <AdminHeader />
      <Container maxW="4xl" padding={4}>
        <Stack minH="100vh" spacing={4}>
          <Heading>Login</Heading>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("login failed")}
          />
        </Stack>
      </Container>
      <Footer />
    </>
  );
}

export default Login;
