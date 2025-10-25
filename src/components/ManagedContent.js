import * as contentful from "contentful";
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

const client = contentful.createClient({
  space: "o3u1j7dkyy42",
  accessToken: "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14",
});

function ManagedContent({ name, showLastUpdated = true, theme }) {
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const getContent = async () => {
      const entry = await client.getEntries({
        content_type: "districtPage",
        limit: 1,
        "fields.name": name,
      });
      return entry.items[0];
    };

    getContent().then((item) => {
      setContent(item);
      setLoaded(true);
    });
  }, [name]);

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <b>{text}</b>,
    },
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
        console.log(node, children);
        return (
          <Container maxW="5xl">
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
                <Container maxW="5xl">
                  <Carousel images={node.data.target.fields.images} />
                </Container>
              </Box>
            );
          default:
            return <Box>Meow</Box>;
        }
      },
      [BLOCKS.HEADING_2]: (node, children) => (
        <Container maxW="4xl">
          <Heading size="lg" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <Container maxW="4xl">
          <Heading size="md" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.HEADING_4]: (node, children) => (
        <Container maxW="4xl">
          <Heading size="sm" color={`${theme}.500`}>
            {children}
          </Heading>
        </Container>
      ),
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <Container maxW="4xl">
          <Text>{children}</Text>
        </Container>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <OrderedList>{children}</OrderedList>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <UnorderedList>{children}</UnorderedList>
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
    <Skeleton isLoaded={loaded}>
      <Stack gap={4}>
        <Container maxW="4xl" padding={4}>
          <Heading color={`${theme}.500`}>{content.fields?.heading}</Heading>
          {showLastUpdated ? (
            <Text>Last updated {dayjs(content.sys?.updatedAt).toString()}</Text>
          ) : null}
        </Container>
        {documentToReactComponents(content.fields?.richContent, options)}
      </Stack>
    </Skeleton>
  );
}

export default ManagedContent;
