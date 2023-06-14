import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;

const style = [
  "color: mediumslateblue",
  "font-family: 'Comic Sans MS'",
  "font-size: 16px",
  "line-height: 22px",
].join(";");

console.log(
  "%cHey friend!\nI assume you're a fellow developer and you want to have a nose at my code. " +
    "Luckily for you, this website is open source so you can see it in all its unminified glory " +
    "at https://github.com/lucy-m/lucy-m-website.",
  style
);
