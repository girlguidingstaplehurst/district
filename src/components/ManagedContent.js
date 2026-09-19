import {
  Box,
  Container,
  Heading,
  Image,
  Link,
  ListItem,
  OrderedList,
  Skeleton,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import dayjs from "dayjs";
import Carousel from "./Carousel";
import { getPage, pageTheme } from "../content";
import { ContentfulError, MissingContent } from "./ContentfulFallback";

function ManagedContent({ name, showLastUpdated = true, theme: requestedTheme }) {
  const [content, setContent] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    getPage(name)
      .then((item) => {
        if (!active) return;
        setContent(item);
        setState(item ? "loaded" : "missing");
      })
      .catch((error) => {
        console.error(`Unable to load page ${name}`, error);
        if (active) setState("error");
      });
    return () => { active = false; };
  }, [name]);

  if (state === "missing") return <MissingContent />;
  if (state === "error") return <ContentfulError />;
  const theme = content ? pageTheme(content) : requestedTheme;

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <b>{text}</b>,
    },
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
        console.log(node, children);
        return (
          <Container maxW="6xl">
            <Image
              objectFit="contain"
              src={node.data.target.fields.file.url}
              alt={node.data.target.fields.description}
            />
          </Container>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
        switch (node.data.target.sys.contentType.sys.id) {
          case "slideshow":
            console.log("Slideshow", node.data.target.fields);
            return (
              <Box bg={`${theme}.500`}>
                <Container maxW="6xl">
                  <Carousel images={node.data.target.fields.images} />
                </Container>
              </Box>
            );
          default:
            return <Box>Meow</Box>;
        }
      },
      [BLOCKS.HEADING_2]: (node, children) => (
        <Container maxW="6xl">
          <Heading size="lg" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <Container maxW="6xl">
          <Heading size="md" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_4]: (node, children) => (
        <Container maxW="6xl">
          <Heading size="sm" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_5]: (node, children) => (
        <Container maxW="6xl">
          <Heading size="xs" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_6]: (node, children) => (
        <Container maxW="6xl">
          <Heading size="xs" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <Container maxW="6xl">
          <Text>{children}</Text>
        </Container>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <Container maxW="6xl">
          <OrderedList>{children}</OrderedList>
        </Container>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <Container maxW="6xl">
          <UnorderedList>{children}</UnorderedList>
        </Container>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => <ListItem>{children}</ListItem>,
      [INLINES.HYPERLINK]: (node, children) => (
        <Link href={node.data.uri} color="brand.500">
          {children}
        </Link>
      ),
    },
  };

  return (
    <Skeleton isLoaded={state === "loaded"}>
      <Stack gap={4}>
        <Container maxW="6xl" padding={4}>
          <Heading color={`${theme}.500`}>{content?.fields?.heading}</Heading>
          {showLastUpdated ? (
            <Text>Last updated {dayjs(content?.sys?.updatedAt).toString()}</Text>
          ) : null}
        </Container>
        {documentToReactComponents(content?.fields?.richContent, options)}
      </Stack>
    </Skeleton>
  );
}

export default ManagedContent;
