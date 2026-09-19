import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import Footer, { getVersion } from "./Footer";
import { resolveVersion } from "../../scripts/version";
import { ContentProvider } from "../ContentProvider";

beforeAll(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }));
});

describe("application version", () => {
  const originalVersion = process.env.REACT_APP_VERSION;

  afterEach(() => {
    if (originalVersion === undefined) {
      delete process.env.REACT_APP_VERSION;
    } else {
      process.env.REACT_APP_VERSION = originalVersion;
    }
  });

  test("prefers a supplied release version", () => {
    expect(
      resolveVersion({
        suppliedVersion: "v0.58.0",
        describe: () => "git-version",
      }),
    ).toBe("v0.58.0");
  });

  test("uses the full Git description when no release version is supplied", () => {
    expect(resolveVersion({ describe: () => "v0.57.0-3-g2b856b6" })).toBe(
      "v0.57.0-3-g2b856b6",
    );
  });

  test("falls back to development when Git metadata is unavailable", () => {
    expect(
      resolveVersion({
        describe: () => {
          throw new Error("not a Git checkout");
        },
      }),
    ).toBe("development");
  });

  test("renders the compiled version in the Footer", () => {
    process.env.REACT_APP_VERSION = "v0.58.0";
    render(
      <ChakraProvider>
        <MemoryRouter>
          <ContentProvider value={{ navigation: [], page: null, loading: false, error: null }}><Footer /></ContentProvider>
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(getVersion()).toBe("v0.58.0");
    expect(screen.getByText("Version v0.58.0")).toBeInTheDocument();
  });
});
