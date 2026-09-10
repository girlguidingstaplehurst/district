import {
  Box,
  Button,
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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  const path = pathname.split("-")[2];
  const [brand900] = useToken("colors", ["brand.900"]);

  const image = path === undefined  ? "/logo192.png" : `${pathname}-192.png`;

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
              <DrawerLink to="/2nd-staplehurst-rainbows" label="2nd Staplehurst Rainbows" onClick={onClose}/>
              <DrawerLink to="/1st-staplehurst-brownies" label="1st Staplehurst Brownies" onClick={onClose}/>
              <DrawerLink to="/4th-staplehurst-brownies" label="4th Staplehurst Brownies" onClick={onClose}/>
              <DrawerLink to="/1st-marden-brownies" label="1st Marden Brownies" onClick={onClose}/>
              <DrawerLink to="/1st-staplehurst-guides" label="1st Staplehurst Guides" onClick={onClose}/>
              <DrawerLink to="/1st-staplehurst-rangers" label="1st Staplehurst Rangers" onClick={onClose}/>
              <DrawerLink to="/volunteer" label="Volunteering" onClick={onClose}/>
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
  const path = pathname.split("-")[2];
  const theme = path === undefined ? "brand" : path;
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
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="40px"
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

function MenuSection({ label, items, ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pathname } = useLocation();
  const path = pathname.split("-")[2];
  const theme = path === undefined ? "brand" : path;
  const [brand300, brand500, brand900] = useToken("colors", [
    `${theme}.300`,
    `${theme}.500`,
    `${theme}.900`,
  ]);

  const isActive = items.some((item) => pathname === item.to);

  return (
    <Menu isOpen={isOpen} onClose={onClose} {...props}>
      <MenuButton
        as={Button}
        onClick={isOpen ? onClose : onOpen}
        flex={1}
        textAlign="center"
        fontWeight="bold"
        borderTop={`3px solid ${brand900}`}
        borderTopRadius={3}
        color={isActive ? brand500 : brand300}
        bg="transparent"
        _hover={{
          bg: brand900,
          color: brand500,
          borderTop: `3px solid ${brand500}`,
        }}
        _expanded={{
          bg: brand900,
          color: brand500,
          borderTop: `3px solid ${brand500}`,
        }}
      >
        {label}
      </MenuButton>
      <MenuList>
        {items.map((item) => (
          <MenuItem
            key={item.to}
            as={ReactRouterLink}
            to={item.to}
            onClick={onClose}
            color={pathname === item.to ? brand500 : brand900}
            fontWeight="bold"
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

function TopNav() {
  const { pathname } = useLocation();
  const path = pathname.split("-")[2];
  const theme = path === undefined ? "brand" : path;
  const [brand500] = useToken("colors", [`${theme}.500`]);

  const image = path === undefined ? "/logo192.png" : `${pathname}-192.png`;

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
           <MenuSection
             label="Rainbows"
             items={[{ to: "/2nd-staplehurst-rainbows", label: "2nd Staplehurst Rainbows" }]}
           />
           <MenuSection
             label="Brownies"
             items={[
               { to: "/1st-staplehurst-brownies", label: "1st Staplehurst Brownies" },
               { to: "/4th-staplehurst-brownies", label: "4th Staplehurst Brownies" },
               { to: "/1st-marden-brownies", label: "1st Marden Brownies" },
             ]}
           />
           <MenuSection
             label="Guides"
             items={[{ to: "/1st-staplehurst-guides", label: "1st Staplehurst Guides" }]}
           />
           <MenuSection
             label="Rangers"
             items={[{ to: "/1st-staplehurst-rangers", label: "1st Staplehurst Rangers" }]}
           />
           <MenuSection
             label="Volunteering"
             items={[{ to: "/volunteer", label: "Volunteering" }]}
           />
        </Stack>
      </Flex>
    </Flex>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const breakpoint = useBreakpoint({ ssr: false });
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";

  const path = pathname.split("-")[2];
  const theme = path === undefined ? "brand" : path;
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
