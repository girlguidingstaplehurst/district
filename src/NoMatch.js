import { Container, Heading, Stack } from "@chakra-ui/react";

function NoMatch() {
  return <Stack gap={4}>
    <Container maxW="6xl" padding={4}>
      <Heading color={`brand.500`}>Not Found</Heading>
    </Container>
  </Stack>;
}

export default NoMatch;
