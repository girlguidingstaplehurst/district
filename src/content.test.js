import { colorTheme, getPageSlug, normalizeNavigation, pageTheme, themeLogo } from "./content";

const entry = (id, fields) => ({ sys: { id }, fields });

describe("Contentful page and navigation helpers", () => {
  test("maps the root path to the District page and other paths to slugs", () => {
    expect(getPageSlug("/")).toBe("girlguiding-staplehurst-district");
    expect(getPageSlug("/new-page/")).toBe("new-page");
  });

  test("uses explicit supported themes and falls back for invalid themes", () => {
    expect(pageTheme({ fields: { theme: "guides" } })).toBe("guides");
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(pageTheme({ fields: { theme: "unknown" } })).toBe("brand");
    warn.mockRestore();
  });

  test("maps logo-specific themes to their colour themes", () => {
    expect(colorTheme("2nd-staplehurst-rainbows")).toBe("rainbows");
    expect(colorTheme("1st-staplehurst-brownies")).toBe("brownies");
    expect(pageTheme({ fields: { theme: "1st-staplehurst-guides" } })).toBe("guides");
    expect(themeLogo("4th-staplehurst-brownies")).toBe("/4th-staplehurst-brownies-192.png");
    expect(themeLogo("1st-marden-brownies")).toBe("/1st-marden-brownies-192.png");
  });

  test("builds ordered internal and external navigation children", () => {
    const district = entry("district", { label: "District", order: 2, name: "district" });
    const volunteer = entry("volunteer", { label: "Volunteering", order: 1, parent: district, name: "volunteer" });
    const external = entry("external", { label: "External", order: 1, url: "https://example.com" });
    const tree = normalizeNavigation([district, volunteer, external]);
    expect(tree.map((item) => item.label)).toEqual(["External", "District"]);
    expect(tree[1].children[0].href).toBe("/volunteer");
    expect(tree[0].href).toBe("https://example.com");
  });

  test("warns but retains deep navigation", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const first = entry("first", { label: "First" });
    const second = entry("second", { label: "Second", parent: first });
    const third = entry("third", { label: "Third", parent: second });
    const fourth = entry("fourth", { label: "Fourth", parent: third });
    const tree = normalizeNavigation([first, second, third, fourth]);
    expect(tree[0].children[0].children[0].children[0].label).toBe("Fourth");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Fourth"));
    warn.mockRestore();
  });
});
