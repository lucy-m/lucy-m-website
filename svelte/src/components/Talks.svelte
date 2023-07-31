<script lang="ts">
  import { ImagesAndText } from "./ExcitingContent";

  const ndcLondonImgs = [
    {
      src: "/talks-ndc-london-2023.JPG",
      alt: "Me standing on NDC London 2023 stage.",
    },
    {
      src: "/talks-ndc-oslo-2023-badge.jpg",
      alt: "Me holding up my NDC Oslo 2023 badge which says 'Lucy Mair, Speaker'.",
    },
    {
      src: "/talks-ndc-oslo-2023-me-on-stage.jpg",
      alt: "A poorly photoshopped image of me standing on stage at NDC Oslo 2023",
    },
  ];
</script>

<div class="talks">
  <div class="item-wrapper content-block">
    <h2>Property-based testing</h2>
    <ImagesAndText
      images={ndcLondonImgs}
      targetImageSize={400}
      text={[
        "I have talked at both NDC Oslo and NDC London in 2023 on the topic of Property-Based Testing. This is a technique that uses unit testing with randomized inputs to test general statements rather than relying on specific examples. It's a very interesting technique that I have personally used to test quicker and more effectively.",
        "You can find my talk on <a href='https://www.youtube.com/watch?v=8xSoeMJhe98'>Youtube</a> and a summary of it can be found on <a href='https://www.infoq.com/news/2023/07/property-based-testing/'>InfoQ</a>.",
      ]}
    />
  </div>
</div>

<style>
  .talks > :global(.item-wrapper) {
    /* This rule intentionally does nothing */
    box-sizing: border-box;
  }

  .content-block {
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--spacing) * 0.5);
  }

  h2 {
    font-family: "Bitter", "Quicksand", sans-serif;
    font-weight: 700;
    font-size: min(2.2rem, 7vw);
    background-image: url("/underlines/underline_2.PNG");
    background-size: 400px;
    background-repeat: no-repeat;
    background-position-x: 12px;
    background-position-y: bottom;
    filter: hue-rotate(274.92deg) saturate(0.3) brightness(2.5);
    margin: calc(var(--spacing) * -1);
    margin-bottom: 0;
    padding: var(--spacing);
  }
</style>
