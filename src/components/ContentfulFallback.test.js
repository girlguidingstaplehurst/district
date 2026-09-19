import { render, screen } from "@testing-library/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { ContentfulError, MissingContent } from "./ContentfulFallback";

const theme = extendTheme({ colors: { brand: { 300: "#ffffff", 500: "#007bc4", 900: "#161b4e" } } });

function renderFallback(element) {
  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{element}</MemoryRouter>
    </ChakraProvider>,
  );
}

test("missing content has its own message, placeholder, brand styling, and home link", () => {
  renderFallback(<MissingContent />);

  expect(screen.getByRole("heading", { name: /olivia couldn.t find that page/i })).toBeInTheDocument();
  expect(screen.getByText(/looked everywhere/i)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Olivia looking for the page" })).toHaveAttribute("src", "/oh-no-olivia.png");
  expect(screen.getByRole("link", { name: "Take me home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("heading").className).toContain("chakra-heading");
});

test("Contentful errors have a distinct message and the same recovery affordances", () => {
  renderFallback(<ContentfulError />);

  expect(screen.getByRole("heading", { name: /olivia left the page in the kitchen/i })).toBeInTheDocument();
  expect(screen.getByText(/back soon/i)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Olivia looking for the page" })).toHaveAttribute("src", "/oh-no-olivia.png");
  expect(screen.getByRole("link", { name: "Take me home" })).toHaveAttribute("href", "/");
});
