<script lang="ts">
  import type { ImageAndAlt } from "../model/imageAndAlt";
  import ImagesAndText from "./ExcitingContent/ImagesAndText.svelte";

  const fanImages: ImageAndAlt[] = [
    {
      src: "/things/fans/comic-sans.jpg",
      alt: `Hand fan painted with a rainbow with comic sans text saying "Comic Sans? I'm a fan"`,
    },
    {
      src: "/things/fans/mdk.jpg",
      alt: `Hand fan with iron-on vinyl showing a wine glass, ball of yarn, and text "Manchester Drunken Knitwits"`,
    },
    {
      src: "/things/fans/csk.jpg",
      alt: `Hand fan with iron-on vinyl of a crown surrounded by text "Canal Street Kings"`,
    },
    {
      src: "/things/fans/spare-fan.jpg",
      alt: `Hand fan with iron-in vinyl with text "spare fan"`,
    },
  ];
</script>

<div class="things-ive-made">
  <div class="item-wrapper">
    <ImagesAndText
      images={fanImages}
      targetImageSize={400}
      text={[
        "I do not have the luxury of wiping sweat of my brow for self-imposed reasons, so I find a hand fan an essential item to carry in my day-to-day life. " +
          "Like any good drag queen waiting for their chicken nuggets in an overly warm McDonalds, whipping out the hand fan with a quick sassy hand flick " +
          "lets those around me know I mean BUSINESS. Or that I have far too much time on my hands? Also great for making friends in night clubs.",
        "I'm particularly proud of the comic sans hand fan as I a) painted it by hand, and b) came up with the pun myself.",
        "The other fans are made of iron-on vinyl for events and have been passed on to new (hopefully benevolent) owners.",
      ]}
    />
  </div>
</div>

<style>
</style>
