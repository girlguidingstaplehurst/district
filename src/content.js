export const ROOT_PAGE_NAME = "girlguiding-staplehurst-district";
export const DEFAULT_THEME = "brand";
export const SUPPORTED_THEMES = ["brand", "rainbows", "brownies", "guides", "rangers"];
export const THEME_LOGOS = {
  brand: "/logo192.png",
  rainbows: "/2nd-staplehurst-rainbows-192.png",
  brownies: "/1st-staplehurst-brownies-192.png",
  guides: "/1st-staplehurst-guides-192.png",
  rangers: "/1st-staplehurst-rangers-192.png",
  "4th-staplehurst-brownies": "/4th-staplehurst-brownies-192.png",
  "1st-marden-brownies": "/1st-marden-brownies-192.png",
};

export function colorTheme(theme) {
  if (!theme) return DEFAULT_THEME;
  if (SUPPORTED_THEMES.includes(theme)) return theme;
  const suffix = theme.split("-").pop();
  return SUPPORTED_THEMES.includes(suffix) ? suffix : DEFAULT_THEME;
}

export function themeLogo(theme) {
  if (THEME_LOGOS[theme]) return THEME_LOGOS[theme];
  return THEME_LOGOS[colorTheme(theme)];
}

let client;

async function getClient() {
  if (!client) {
    const contentful = await import("contentful");
    client = contentful.createClient({
      space: "o3u1j7dkyy42",
      accessToken: "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14",
    });
  }
  return client;
}

export function getPageSlug(pathname) {
  const path = pathname.replace(/^\/+|\/+$/g, "");
  return path || ROOT_PAGE_NAME;
}

export function pageTheme(page) {
  const theme = page?.fields?.theme;
  const mappedTheme = colorTheme(theme);
  if (mappedTheme !== DEFAULT_THEME || theme === DEFAULT_THEME) return mappedTheme;
  if (theme !== undefined) {
    console.warn(`Unsupported Contentful page theme: ${theme}`);
  } else {
    console.warn(`Missing Contentful page theme for ${page?.fields?.slug || page?.fields?.name || "page"}`);
  }
  return DEFAULT_THEME;
}

export async function getPage(name) {
  const result = await (await getClient()).getEntries({
    content_type: "districtPage",
    limit: 1,
    "fields.name": name,
  });
  return result.items[0] || null;
}

function resolveIncludedEntries(result) {
  const included = new Map((result.includes?.Entry || []).map((item) => [entryId(item), item]));
  return result.items.map((item) => {
    const target = item.fields?.target;
    const parent = item.fields?.parent;
    return {
      ...item,
      fields: {
        ...item.fields,
        target: target?.sys?.id ? included.get(target.sys.id) || target : target,
        parent: parent?.sys?.id ? included.get(parent.sys.id) || parent : parent,
      },
    };
  });
}

function entryId(entry) {
  return entry?.sys?.id;
}

function field(entry, ...names) {
  for (const name of names) {
    if (entry?.fields?.[name] !== undefined) return entry.fields[name];
  }
  return undefined;
}

function nonEmptyField(entry, ...names) {
  for (const name of names) {
    const value = entry?.fields?.[name];
    if (value) return value;
  }
  return undefined;
}

function resolvePageSlug(page) {
  return page?.fields?.name || page?.fields?.slug || page?.fields?.path;
}

function linkFromTarget(target) {
  if (!target) return null;
  if (typeof target === "string") return target;
  return resolvePageSlug(target) ? `/${resolvePageSlug(target)}` : target.fields?.url;
}

function navigationEntry(entry) {
  const target = field(entry, "target", "page", "districtPage", "link");
  const pageName = field(entry, "pageName") || resolvePageSlug(target) || field(entry, "slug", "pageSlug") || field(entry, "name");
  const href = field(entry, "linkOverride") || field(entry, "url", "href", "path") || (pageName ? `/${pageName}` : linkFromTarget(target));
  const page = target?.fields?.name || target?.fields?.slug ? target : null;
  return {
    id: entryId(entry) || `${field(entry, "label", "name")}-${href}`,
    label: nonEmptyField(entry, "linkLabel", "label", "name", "title") || "Untitled",
    href: href || null,
    page,
    order: Number(field(entry, "order", "position", "sortOrder") || 0),
    parent: field(entry, "parent", "parentItem", "parentNavigationItem") || null,
    children: field(entry, "children", "items", "childItems") || [],
    entry,
  };
}

function parentId(parent) {
  return typeof parent === "string" ? parent : entryId(parent);
}

export function normalizeNavigation(entries) {
  const nodes = entries.flatMap((entry) => {
    const node = navigationEntry(entry);
    const nested = node.children;
    node.children = [];
    return [node, ...nested];
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots = [];

  nodes.forEach((node) => {
    const id = parentId(node.parent);
    if (!id || id === node.id) {
      roots.push(node);
      return;
    }
    const parent = byId.get(id);
    if (!parent || parent === node) {
      console.warn(`Navigation item ${node.label} has an invalid parent`);
      roots.push(node);
      return;
    }
    parent.children.push(node);
  });

  const sort = (items) => {
    items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    items.forEach((item) => sort(item.children));
    return items;
  };

  const inspect = (items, depth, ancestors = new Set()) => {
    items.forEach((item) => {
      if (depth > 2) {
        console.warn(`Navigation depth exceeds two levels: ${item.label} (${item.id})`);
      }
      if (ancestors.has(item.id)) {
        console.warn(`Navigation cycle detected at ${item.label} (${item.id})`);
        item.children = [];
        return;
      }
      inspect(item.children, depth + 1, new Set([...ancestors, item.id]));
    });
  };

  const sorted = sort(roots);
  inspect(sorted, 1);
  return sorted;
}

export async function getNavigation() {
  const result = await (await getClient()).getEntries({
    content_type: "districtNavigation",
    order: "fields.order",
    include: 10,
  });
  return normalizeNavigation(resolveIncludedEntries(result));
}
