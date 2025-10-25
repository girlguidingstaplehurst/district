import {
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  Link,
  Stack,
  StackDivider,
  Text,
  useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

function Footer() {
  const [brand500] = useToken("colors", ["brand.500"]);
  return (
    <Box bg="brand.900" color="white">
      <Container maxW="6xl" padding={4}>
        <Center>
          <Stack
            align="center"
            direction="row"
            divider={
              <StackDivider borderLeft={`1px solid ${brand500}`} padding={2} />
            }
            marginBottom={8}
            alignContent="center"
          >
            <Image
              flex="1"
              src="/logo192.png"
              boxSize={192}
              maxW={192}
              maxH={192}
              padding={4}
            />
            <Stack gap={4}>
              <Link as={ReactRouterLink} to="/">
                <Heading size="sm">Girlguiding Staplehurst District</Heading>
              </Link>
              <Link as={ReactRouterLink} to="2nd-rainbows">
                2nd Rainbows
              </Link>
              <Link as={ReactRouterLink} to="1st-brownies">
                1st Brownies
              </Link>
              <Link as={ReactRouterLink} to="4th-brownies">
                4th Brownies
              </Link>
              <Link as={ReactRouterLink} to="1st-guides">
                1st Guides
              </Link>
              <Link as={ReactRouterLink} to="1st-rangers">
                1st Rangers
              </Link>
              <Link href="https://kathielambcentre.org/">
                <Heading size="sm">Kathie Lamb Guide Centre</Heading>
              </Link>
            </Stack>
          </Stack>
        </Center>
        <Text fontSize={12} align="center">
          &copy; {new Date().getFullYear()} Girlguiding Staplehurst District.
          Registered Charity 801848
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;
