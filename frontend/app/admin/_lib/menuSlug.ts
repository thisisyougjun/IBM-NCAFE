type SlugSource = {
  id?: number | string;
  engName?: string | null;
  korName?: string | null;
};

export function slugifyMenuName(value?: string | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function menuToSlug(menu: SlugSource) {
  const base = slugifyMenuName(menu.engName) || slugifyMenuName(menu.korName);
  if (base) return base;
  return `menu-${menu.id ?? "item"}`;
}

