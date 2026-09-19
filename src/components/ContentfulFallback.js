import { Center, Container, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

function ContentfulFallback({ heading, message }) {
  return (
    <Stack gap={4} bg="brand.300" color="brand.900" minH="50vh" paddingY={8}>
      <Container maxW="6xl" padding={4} textAlign="center">
        <Heading color="brand.500">{heading}</Heading>
        <Center marginY={8}>
          <Image src="/oh-no-olivia.png" alt="Olivia looking for the page" maxW="md" borderRadius="md" />
        </Center>
        <Text fontSize="lg" marginTop={4}>{message}</Text>
        <Link as={ReactRouterLink} to="/" color="brand.500" fontWeight="bold">
          Take me home
        </Link>
      </Container>
    </Stack>
  );
}

export function MissingContent() {
  return <ContentfulFallback heading="Olivia couldn’t find that page" message="She’s looked everywhere, but this page seems to have gone missing." />;
}

export function ContentfulError() {
  return <ContentfulFallback heading="Olivia left the page in the kitchen" message="She’ll be back soon. In the meantime, let’s get you somewhere safe." />;
}

export default ContentfulFallback;
