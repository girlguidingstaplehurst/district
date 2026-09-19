import { Box, Center, Container, Flex, Image, Link, SimpleGrid, Stack, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { useContent } from "../ContentProvider";

export function getVersion() { return process.env.REACT_APP_VERSION || "development"; }

function FooterDestination({ item, children, ...props }) {
  if (!item.href) return <Text {...props}>{children}</Text>;
  return item.href.startsWith("/") ? <Link as={ReactRouterLink} to={item.href} {...props}>{children}</Link> : <Link href={item.href} {...props}>{children}</Link>;
}

function FooterChildren({ items, depth = 1 }) {
  return items.map((item) => (
    <Box key={item.id}>
      <FooterDestination item={item} pl={depth * 3} fontWeight="normal" fontSize="sm" whiteSpace="nowrap">{item.label}</FooterDestination>
      <FooterChildren items={item.children} depth={depth + 1} />
    </Box>
  ));
}

function Footer() {
  const { navigation } = useContent();
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box bg="brand.900" color="white">
      <Container maxW="6xl" padding={4}>
        {!isMobile && <SimpleGrid columns={{ md: navigation.length || 1 }} spacing={6} marginBottom={8}>
          {navigation.map((item) => <Stack key={item.id} spacing={2}>
            <FooterDestination item={item} fontWeight="bold" fontSize="sm" whiteSpace="nowrap">{item.label}</FooterDestination>
            <FooterChildren items={item.children} />
          </Stack>)}
        </SimpleGrid>}
        <Center><Flex align="center" direction="column" gap={2}><Link href="https://kathielambcentre.org/"><Image src="/logo192.png" boxSize={128} /></Link><Text fontSize={12} align="center">&copy; {new Date().getFullYear()} Girlguiding Staplehurst District. Registered Charity 801848</Text><Text fontSize={12} align="center">Version {getVersion()}</Text></Flex></Center>
      </Container>
    </Box>
  );
}

export default Footer;
