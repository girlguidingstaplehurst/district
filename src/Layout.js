import {
  Box,
  ButtonGroup,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Link,
  Spacer,
  Stack,
  StackDivider,
  useBreakpoint,
  useDisclosure,
  useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, Outlet, useLocation } from "react-router-dom";
import "./App.css";
import RoundedButton from "./components/RoundedButton";
import Footer from "./components/Footer";
import { TbMenu2 } from "react-icons/tb";
import { useRef } from "react";

function DrawerLink({ label, children, to, ...props }) {
  const { pathname } = useLocation();
  const [brand500, brand900] = useToken("colors", ["brand.500", "brand.900"]);

  const linkColor = pathname === to ? brand500 : brand900;

  return (
    <Link
      as={ReactRouterLink}
      to={to}
      flex={1}
      fontWeight="bold"
      color={linkColor}
      {...props}
    >
      {label}
    </Link>
  );
}

function NavInDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const { pathname } = useLocation();
  const theme = pathname === "/" ? "brand" : pathname.split("-")[1];
  const [brand900] = useToken("colors", ["brand.900"]);

  const image = pathname === "/" ? "/logo192.png" : `${pathname}-192.png`;

  return (
    <>
      <Flex gap={4} direction="column" align="center">
        <Image src={image} boxSize="192px" />
        <ButtonGroup>
          <IconButton
            icon={<TbMenu2 />}
            ariaLabel="Open Navigation Menu"
            onClick={onOpen}
          />
        </ButtonGroup>
      </Flex>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigate</DrawerHeader>

          <DrawerBody>
            <Stack
              divider={<StackDivider borderTop={`1px solid ${brand900}`} />}
            >
              <DrawerLink label="Home" to="/" onClick={onClose} />
              <DrawerLink to="/2nd-rainbows" label="2nd Rainbows" onClick={onClose}/>
              <DrawerLink to="/1st-brownies" label="1st Brownies" onClick={onClose}/>
              <DrawerLink to="/4th-brownies" label="4th Brownies" onClick={onClose}/>
              <DrawerLink to="/1st-guides" label="1st Guides" onClick={onClose}/>
              <DrawerLink to="/1st-rangers" label="1st Rangers" onClick={onClose}/>
            </Stack>
          </DrawerBody>

          <DrawerFooter bg="brand.900" justifyContent="center">
            <Image src="/logo192.png" />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function MenuLink({ label, children, to, ...props }) {
  const { pathname } = useLocation();
  const theme = pathname === "/" ? "brand" : pathname.split("-")[1];
  const [brand300, brand500, brand900] = useToken("colors", [
    `${theme}.300`,
    `${theme}.500`,
    `${theme}.900`,
  ]);

  const linkColor = pathname === to ? brand500 : brand300;

  return (
    <Link
      as={ReactRouterLink}
      to={to}
      flex={1}
      textAlign="center"
      justifySelf="end"
      fontWeight="bold"
      borderTop={`3px solid ${brand900}`}
      color={linkColor}
      borderTopRadius={3}
      _hover={{
        bg: brand900,
        color: brand500,
        borderTop: `3px solid ${brand500}`,
      }}
      {...props}
    >
      {label}
    </Link>
  );
}

function TopNav() {
  const { pathname } = useLocation();
  const theme = pathname === "/" ? "brand" : pathname.split("-")[1];
  const [brand500] = useToken("colors", [`${theme}.500`]);

  const image = pathname === "/" ? "/logo192.png" : `${pathname}-192.png`;

  return (
    <Flex
      spacing={4}
      flex={1}
      gap={4}
      justifyContent="center"
      alignContent="end"
      wrap="wrap"
    >
      <Image src={image} />
      <Flex flexDirection="column" flex={1}>
        <Spacer />
        <Stack
          divider={<StackDivider borderLeft={`1px solid ${brand500}`} />}
          direction="row"
          minH="2em"
          justifyContent="center"
          alignContent="end"
        >
          <MenuLink to="/" label="Home" />
          <MenuLink to="/2nd-rainbows" label="2nd Rainbows" />
          <MenuLink to="/1st-brownies" label="1st Brownies" />
          <MenuLink to="/4th-brownies" label="4th Brownies" />
          <MenuLink to="/1st-guides" label="1st Guides" />
          <MenuLink to="/1st-rangers" label="1st Rangers" />
        </Stack>
      </Flex>
    </Flex>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const breakpoint = useBreakpoint({ ssr: false });
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";

  const theme = pathname === "/" ? "brand" : pathname.split("-")[1];
  const [brand900] = useToken("colors", [`${theme}.900`]);

  return (
    <>
      <div id="top"></div>
      <Box bg={brand900} color="white">
        <Container maxW="6xl" padding={4}>
          {navInDrawer ? <NavInDrawer /> : <TopNav />}
        </Container>
      </Box>
      <Box>
        <Outlet />
        <Container maxW="6xl" padding={4}>
          <Box margin={8} textAlign="center">
            <RoundedButton as="a" href="#top">
              Back to top
            </RoundedButton>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Layout;
