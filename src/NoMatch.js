import { Container, Heading, Stack, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

function NoMatch() {
  return <Stack gap={4}>
    <Container maxW="6xl" padding={4}>
      <Heading color={`brand.500`}>Not Found</Heading>
    </Container>
  </Stack>;
}

export default NoMatch;
