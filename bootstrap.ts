/** @file bootstrap.ts */
// This file auto-bootstraps FlatHub packages thanks to its API.
// It's not too complete, but it gets the job done.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { chdir } from "process";

type Etc<K> = K & Record<string, any>;

type FlatHubRelease = Etc<{
  summary: string;
  urls: Etc<{
    vcs_browser: string | null;
    homepage: string | null;
    help: string | null;
  }>;
  developer_name: string;
  description: string;
  branding?: {
    type: "primary";
    scheme_preference: "dark" | "light";
    value: `#${string}`;
  }[];
  icons: {
    scale: null | number;
    height: number;
    width: number;
    type: "remote";
    url: string;
  }[];
  isMobileFriendly: boolean;
  screenshots: {
    sizes: Etc<{
      src: string;
      height: string;
      width: string;
    }>[];
    default: true | null;
    caption?: string;
  }[];
  categories: (
    | "audiovideo"
    | "development"
    | "education"
    | "game"
    | "graphics"
    | "network"
    | "office"
    | "science"
    | "system"
    | "utility"
  )[];
  icon: string;
  name: string;
  project_license: string;
  content_rating: {
    sex_nudity: any;
    sex_themes: any;
    sex_homosexuality: any;
    language_profanity: any;
    language_discrimination: any;
    social_chat: any;
    social_info: any;
    social_audio: any;
    social_contacts: any;
    money_gambling: any;
    money_purchasing: any;
    social_location: any;
    language_humor: any;
    sex_appearance: any;
    sex_adultery: any;
    violence_bloodshed: any;
    drugs_alcohol: any;
    violence_cartoon: any;
    violence_fantasy: any;
    violence_realistic: any;
    drugs_narcotics: any;
    violence_sexual: any;
    violence_desecration: any;
    violence_slavery: any;
    violence_worship: any;
    sex_prostitution: any;
    drugs_tobacco: any;
  };
  arches: ("x86_64" | "aarch64")[];
  download_size: number;
  installed_size: number;
}>;

const pkg = prompt("FlatHub package ID");
const authorID = prompt("Wanted Konbini author ID");
const pkgID = prompt(
  "Wanted Konbini package ID (just the name, no usr/org...)",
);

if (!pkg) throw "Provide a package, damn.";
if (!pkgID) throw "Provide a package ID, damn.";
if (!authorID) throw "Provide an author, damn.";

const response1 = await fetch(
  `https://flathub.org/api/v2/appstream/${pkg}?locale=en`,
);
const appstream = await response1.json();
const response2 = await fetch(`https://flathub.org/api/v2/summary/${pkg}`);
const summary = await response2.json();

const release: FlatHubRelease = { ...summary, ...appstream };

const newManifest = {
  name: release.name,
  type: "gui",
  slogan: release.summary,
  desc: release.description.trim(),
  accent: release.branding?.find(
    (i) => i.scheme_preference === "dark" && typeof i.value == "string",
  )?.value,
  platforms: {
    mac64: null,
    macArm: null,
    win64: null,
    linux64: release.arches.includes("x86_64") ? "fpak:" + pkg : null,
    linuxArm: release.arches.includes("aarch64") ? "fpak:" + pkg : null,
  },
  icon: release.icon,
  images: release.screenshots.map((s) => {
    return { text: s.caption, link: s.sizes[0]!.src };
  }),
  homepage: release.urls.homepage,
  docs: release.urls.help,
  repo: release.urls.vcs_browser
    ? release.urls.vcs_browser.startsWith("https://github.com/") ||
      release.urls.vcs_browser.startsWith("https://gitlab.com/") ||
      release.urls.vcs_browser.startsWith("https://codeberg.com/")
      ? release.urls.vcs_browser.startsWith("https://github.com/")
        ? "gh:" + release.urls.vcs_browser.split("/").slice(3).join("/")
        : release.urls.vcs_browser.startsWith("https://gitlab.com/")
          ? "gl:" + release.urls.vcs_browser.split("/").slice(3).join("/")
          : "cb" + release.urls.vcs_browser.split("/").slice(3).join("/")
      : `url:${release.urls.vcs_browser.split("https://")[1]}`
    : null,
  author: authorID,
  categories: release.categories.map((s) => {
    if (s === "audiovideo") return "MULTIMEDIA";
    if (s === "development") return "DEVELOPMENT";
    if (s === "education") return "EDUCATION";
    if (s === "game") return "GAMING";
    if (s === "graphics") return "GRAPHICS";
    if (s === "network") return "NETWORK";
    if (s === "office") return "OFFICE";
    if (s === "science") return "SCIENCE";
    if (s === "system") return "SYSTEM";
    if (s === "utility") return "UTILITY";
  }),
};

const prefix = `# Highly relevant packages like this one are added by Konbini itself and not their owners, in an attempt to bootstrap our store.
# This is shown in Konbini because of this bs flag:
bs: true
# If you own this package, simply make a PR removing this comment and modifying this manifest to your liking, including package sources if needed.
# If you really wish to, you may remove it entirely as well (in which case you might want to delete your profile from KonbiniAuthors/usr.YOUR_USER.yaml).`;

if (!existsSync(pkgID.slice(0, 2))) mkdirSync(pkgID.slice(0, 2));
chdir(pkgID.slice(0, 2));
if (!existsSync(authorID)) mkdirSync(authorID);
const prev = existsSync(authorID + "/" + pkgID + ".yaml")
  ? (Bun.YAML.parse(
      readFileSync(authorID + "/" + pkgID + ".yaml", { encoding: "utf-8" }),
    ) as any)
  : {};
writeFileSync(
  authorID + "/" + pkgID + ".yaml",
  prefix +
    "\n" +
    Bun.YAML.stringify(
      {
        ...newManifest,
        ...prev,
      },
      null,
      2,
    ),
);

export {};
