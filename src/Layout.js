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

  const [brand900] = useToken("colors", ["brand.900"]);

  return (
    <>
      <Flex gap={4} direction="column" align="center">
        <Image src="/logo192.png" boxSize="192px" />
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
              <DrawerLink label="About" to="/about" onClick={onClose} />
              <DrawerLink label="Contact Us" to="/contact" onClick={onClose} />
              {/*<DrawerLink label="Booking" to="/booking" onClick={onClose} />*/}
              {/*<DrawerLink label="What's On?" to="/whats-on" onClick={onClose} />*/}
              <DrawerLink label="Location" to="/location" onClick={onClose} />
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
  const [brand500, brand900, white] = useToken("colors", [
    "brand.500",
    "brand.900",
    "white",
  ]);

  const linkColor = pathname === to ? brand500 : white;

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
        bg: white,
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
  const [brand500] = useToken("colors", ["brand.500"]);

  return (
    <Flex
      spacing={4}
      flex={1}
      gap={4}
      justifyContent="center"
      alignContent="end"
      wrap="wrap"
    >
      <Image src="/logo192.png" />
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
          <MenuLink to="/about" label="About" />
          <MenuLink to="/contact" label="Contact Us" />
          {/*<MenuLink to="/booking" label="Booking" />*/}
          {/*<MenuLink to="/whats-on" label="What's On?" />*/}
          <MenuLink to="/location" label="Location" />
        </Stack>
      </Flex>
    </Flex>
  );
}

function Layout() {
  const breakpoint = useBreakpoint({ ssr: false });
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";

  return (
    <>
      <div id="top"></div>
      <Box bg="brand.900" color="white">
        <Container maxW="4xl" padding={4}>
          {navInDrawer ? <NavInDrawer /> : <TopNav />}
        </Container>
      </Box>
      <Box>
        <Outlet />
        <Container maxW="4xl" padding={4}>
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
