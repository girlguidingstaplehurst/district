import {
  Box,
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
      <Container maxW="4xl" padding={4}>
        <Stack
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
          <Grid
            flex={1}
            gap={4}
            templateColumns={{ base: "repeat(1, 2fr)", sm: "repeat(2, 2fr)" }}
          >
            <GridItem>
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
            </GridItem>
          </Grid>
        </Stack>
        <Text fontSize={12} align="center">
          &copy; {new Date().getFullYear()} Girlguiding Staplehurst District.
          Registered Charity 801848
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;
