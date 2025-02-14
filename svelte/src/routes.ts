import type { ComponentProps, ComponentType } from "svelte";
import { Scene, Talks } from "./components";
import FromStatic from "./components/FromStatic.svelte";
import ThingsIveMade from "./components/ThingsIveMade.svelte";
import { makeFishingSceneWithLocalStorage } from "./scenes/fishing";
import { makeFishing2Scene } from "./scenes/fishing-2/fishing-2-scene";

export const routes = {
  theFunBit: "/the-fun-bit",
  cv: "/cv",
  thingsIveYelledAbout: "/things-ive-yelled-about",
  thingsIveMade: "/things-ive-made",
  test: "/test",
  fallback: "/",
};

export interface NavItem {
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
    component: Talks,
    props: {},
  },
  {
    label: "Things",
    route: routes.thingsIveMade,
    component: ThingsIveMade,
    props: {},
  },
  {
    label: "Something fun",
    route: routes.theFunBit,
    component: Scene,
    props: {
      sceneSpec: makeFishingSceneWithLocalStorage,
    } as ComponentProps<Scene>,
  },
  {
    label: "Super secret test bit",
    route: routes.test,
    component: Scene,
    props: {
      sceneSpec: makeFishing2Scene,
    } as ComponentProps<Scene>,
    hidden: true,
  },
];
