import {
  Box, Button, ButtonGroup, Container, Drawer, DrawerBody, DrawerCloseButton,
  DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, IconButton,
  Image, Link, Menu, MenuButton, MenuItem, MenuList, Spacer, Stack,
  StackDivider, useBreakpoint, useDisclosure, useToken,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { TbMenu2 } from "react-icons/tb";
import { useContent } from "./ContentProvider";
import { pageTheme, themeLogo } from "./content";
import "./App.css";
import RoundedButton from "./components/RoundedButton";
import Footer from "./components/Footer";

function Destination({ item, children, ...props }) {
  if (!item.href) return <Box {...props}>{children}</Box>;
  if (item.href.startsWith("/")) {
    return <Link as={ReactRouterLink} to={item.href} {...props}>{children}</Link>;
  }
  return <Link href={item.href} {...props}>{children}</Link>;
}

function DrawerLink({ item, onClick, depth = 0 }) {
  const { pathname } = useLocation();
  const [brand500, brand900] = useToken("colors", ["brand.500", "brand.900"]);
  return (
    <Destination item={item} onClick={onClick} flex={1} fontWeight={depth >= 2 ? "normal" : "bold"} color={pathname === item.href ? brand500 : brand900}>
      {item.label}
    </Destination>
  );
}

function NavInDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { navigation, page } = useContent();
  const btnRef = useRef();
  const scrollRef = useRef();
  const [scrollState, setScrollState] = useState({ top: false, bottom: false });
  const theme = pageTheme(page);
  const [brand900] = useToken("colors", [`${theme}.900`]);

  const updateScrollHints = () => {
    const node = scrollRef.current;
    if (!node) return;
    setScrollState({ top: node.scrollTop > 0, bottom: node.scrollTop + node.clientHeight < node.scrollHeight - 1 });
  };
  useEffect(() => { if (isOpen) setTimeout(updateScrollHints, 0); }, [isOpen, navigation]);

  return (
    <>
      <Flex gap={4} direction="column" align="center">
        <Image src={themeLogo(page?.fields?.theme)} boxSize="192px" />
        <ButtonGroup><IconButton ref={btnRef} icon={<TbMenu2 />} aria-label="Open Navigation Menu" onClick={onOpen} /></ButtonGroup>
      </Flex>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Navigate</DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" minH={0}>
            {scrollState.top && <Box textAlign="center" aria-hidden="true">^ More navigation</Box>}
            <Stack ref={scrollRef} onScroll={updateScrollHints} overflowY="auto" flex={1} minH={0} divider={<StackDivider borderTop={`1px solid ${brand900}`} />}>
              {navigation.map((item) => (
                <Box key={item.id}>
                  <DrawerLink item={item} onClick={onClose} />
                  {renderDrawerChildren(item.children, onClose)}
                </Box>
              ))}
            </Stack>
            {scrollState.bottom && <Box textAlign="center" aria-hidden="true">v More navigation</Box>}
          </DrawerBody>
          <DrawerFooter bg={`${theme}.900`} justifyContent="center"><Image src={themeLogo(page?.fields?.theme)} /></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function MenuLink({ item, ...props }) {
  const { pathname } = useLocation();
  const { page } = useContent();
  const theme = pageTheme(page);
  const [text, active, border] = useToken("colors", [`${theme}.300`, `${theme}.500`, `${theme}.900`]);
  return <Destination item={item} {...props} flex={1} display="flex" alignItems="center" justifyContent="center" minH="40px" textAlign="center" fontWeight="bold" borderTop="3px solid transparent" color={pathname === item.href ? active : text} _hover={{ bg: border, color: active, borderTop: `3px solid ${active}` }}>{item.label}</Destination>;
}

function MenuSection({ item }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pathname } = useLocation();
  const { page } = useContent();
  const theme = pageTheme(page);
  const [text, active, border] = useToken("colors", [`${theme}.300`, `${theme}.500`, `${theme}.900`]);
  const isActive = pathname === item.href || item.children.some((child) => pathname === child.href);
  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <MenuButton as={Button} onClick={isOpen ? onClose : onOpen} flex={1} textAlign="center" fontWeight="bold" borderTop="3px solid transparent" color={isActive ? active : text} bg="transparent" _hover={{ bg: border, color: active, borderTop: `3px solid ${active}` }} _expanded={{ bg: border, color: active, borderTop: `3px solid ${active}` }}>{item.label}</MenuButton>
      <MenuList>{item.children.map((child) => <DesktopNestedMenu key={child.id} item={child} />)}</MenuList>
    </Menu>
  );
}

function DesktopNestedMenu({ item, depth = 0 }) {
  const { pathname } = useLocation();
  const { page } = useContent();
  const theme = pageTheme(page);
  const [border] = useToken("colors", [`${theme}.900`]);
  return (
    <Box key={item.id}>
      <MenuItem
        as="a"
        href={item.href || undefined}
        pl={depth > 0 ? 4 + depth * 4 : 4}
        color={pathname === item.href ? `${theme}.500` : border}
        fontWeight={depth === 0 ? "bold" : "normal"}
      >
        {item.label}
      </MenuItem>
      {item.children.map((child) => <DesktopNestedMenu key={child.id} item={child} depth={depth + 1} />)}
    </Box>
  );
}

function renderDrawerChildren(children, onClose, depth = 0) {
  return children.map((child) => (
    <Box key={child.id} pl={(depth + 1) * 4}>
      <DrawerLink item={child} onClick={onClose} depth={depth + 1} />
      {renderDrawerChildren(child.children, onClose, depth + 1)}
    </Box>
  ));
}

function TopNav() {
  const { navigation, page } = useContent();
  const theme = pageTheme(page);
  const [brand500] = useToken("colors", [`${theme}.500`]);
  return <Flex spacing={4} flex={1} gap={4} justifyContent="center" alignContent="end" wrap="wrap"><Image src={themeLogo(page?.fields?.theme)} /><Flex flexDirection="column" flex={1}><Spacer /><Stack divider={<StackDivider borderLeft={`1px solid ${brand500}`} />} direction="row" minH="2em" justifyContent="center" alignContent="end">{navigation.map((item) => item.children.length ? <MenuSection key={item.id} item={item} /> : <MenuLink key={item.id} item={item} />)}</Stack></Flex></Flex>;
}

function Layout() {
  const breakpoint = useBreakpoint({ ssr: false });
  const navInDrawer = breakpoint === "base" || breakpoint === "sm";
  const { page } = useContent();
  const theme = pageTheme(page);
  return <><div id="top" /><Box bg={`${theme}.900`} color="white"><Container maxW="6xl" padding={4}>{navInDrawer ? <NavInDrawer /> : <TopNav />}</Container></Box><Box><Outlet /><Container maxW="6xl" padding={4}><Box margin={8} textAlign="center"><RoundedButton as="a" href="#top">Back to top</RoundedButton></Box></Container></Box><Footer /></>;
}

export default Layout;
