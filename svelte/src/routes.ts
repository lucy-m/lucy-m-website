import type { ComponentProps, ComponentType } from "svelte";
import { Scene } from "./components";
import FromStatic from "./components/FromStatic.svelte";
import { introScene } from "./scenes/intro-scene";

export const routes = {
  theFunBit: "/the-fun-bit",
  cv: "/cv",
  thingsIveYelledAbout: "/things-ive-yelled-about",
  fallback: "/",
};

interface NavItem {
  label: string;
  route: string;
  component: ComponentType;
  props: any;
  hidden?: true;
}

export const fallback: NavItem = {
  label: "Home",
  route: routes.fallback,
  component: FromStatic,
  props: { selector: "#static-intro" } as ComponentProps<FromStatic>,
};

export const navItems: NavItem[] = [
  fallback,
  {
    label: "CV",
    route: routes.cv,
    component: FromStatic,
    props: { selector: "#cv" } as ComponentProps<FromStatic>,
    hidden: true,
  },
  {
    label: "Talks",
    route: routes.thingsIveYelledAbout,
    component: FromStatic,
    props: { selector: "#talks" } as ComponentProps<FromStatic>,
  },
  {
    label: "Something fun",
    route: routes.theFunBit,
    component: Scene,
    props: { source: introScene } as ComponentProps<Scene>,
  },
];
