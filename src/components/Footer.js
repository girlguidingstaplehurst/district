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
                  <Heading size="sm">Kathie Lamb Guide Centre</Heading>
                </Link>
                <Link as={ReactRouterLink} to="/about">
                  About
                </Link>
                <Link as={ReactRouterLink} to="/contact">
                  Contact Us
                </Link>
                {/*<Link as={ReactRouterLink} to="/booking">*/}
                {/*  Booking*/}
                {/*</Link>*/}
                <Link as={ReactRouterLink} to="/privacy-policy">
                  Privacy Policy
                </Link>
                <Link as={ReactRouterLink} to="/terms-of-hire">
                  Terms of Hire
                </Link>
                <Link as={ReactRouterLink} to="/cleaning-and-damage-policy">
                  Cleaning and Damage Policy
                </Link>
                {/*<Link as={ReactRouterLink} to="/whats-on">*/}
                {/*  What's On?*/}
                {/*</Link>*/}
                <Link as={ReactRouterLink} to="/location/">
                  Location
                </Link>
              </Stack>
            </GridItem>
            <GridItem>
              <Stack gap={4}>
                <Link href="https://staplehurstguiding.org.uk/">
                  <Heading size="sm">Girlguiding Staplehurst District</Heading>
                </Link>
                <Link href="https://staplehurstguiding.org.uk/about-us">
                  About Us
                </Link>
                <Link href="https://staplehurstguiding.org.uk/rainbows">
                  Rainbows
                </Link>
                <Link href="https://staplehurstguiding.org.uk/brownies">
                  Brownies
                </Link>
                <Link href="https://staplehurstguiding.org.uk/guides">
                  Guides
                </Link>
                <Link href="https://staplehurstguiding.org.uk/rangers">
                  Rangers
                </Link>
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
        <Text fontSize={12} align="center">
          &copy; {new Date().getFullYear()} Girlguiding Staplehurst District. Registered Charity
          801848
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;
