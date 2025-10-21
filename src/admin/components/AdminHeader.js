import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import useAuth from "../useAuth";

function AdminHeader() {
  const { payload } = useAuth();

  return (
    <Box bg="brand.900" color="white">
      <Container maxW="4xl" padding={4}>
        <Flex
          spacing={4}
          flex={1}
          gap={4}
          justifyContent="center"
          alignContent="end"
        >
          <Image src="/logo192.png" />
          <Flex
            flexDirection="column"
            flex={1}
            spacing={4}
            gap={4}
            justifyContent="right"
            alignContent="end"
            textAlign="right"
          >
            <Flex direction="row" gap={4}>
              <Spacer />
              <Text>{payload.email}</Text>
              <Text>|</Text>
              <Link as={ReactRouterLink} to="/">
                Exit Administration page
              </Link>
            </Flex>
            <Spacer />
            <Heading size="xl" textAlign="right">
              Booking Administration
            </Heading>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default AdminHeader;
