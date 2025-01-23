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
    <div class="heading">
      <h2>Property-based testing</h2>
    </div>
    <ImagesAndText
      images={ndcLondonImgs}
      targetImageSize={400}
      text={[
        "I have talked at both NDC Oslo and NDC London in 2023 on the topic of Property-Based Testing. This is a technique that uses unit testing with randomized inputs to test general statements rather than relying on specific examples. It's a very interesting technique that I have personally used to test quicker and more effectively.",
        "You can find my talk on <a href='https://www.youtube.com/watch?v=8xSoeMJhe98'>Youtube</a> and a summary of it can be found on <a href='https://www.infoq.com/news/2023/07/property-based-testing/'>InfoQ</a>.",
      ]}
    />
  </div>
  <div class="item-wrapper content-block">
    <div class="heading">
      <h2>How to introduce new technology</h2>
      <h3>and why you maybe shouldn't</h3>
    </div>
    <p>
      This talk is still a bit of a work in progress and I will update later.
    </p>
    <p>
      Picking up a new language or framework is always a fun side project, but
      bringing these into production software at work is always a challenge. It
      may not be compatible with other technologies you use. The project will
      need to be maintained for possibly years to come. You will have to
      convince the rest of your team it's a good idea and they should invest the
      time to learn.
    </p>
    <p>
      At Codat, we have used React for our front ends for years but earlier this
      year we successfully did a project using Svelte. In this talk, I will
      discuss why we decided to use Svelte, how to convince people to use a new
      language or framework, and why you maybe shouldn’t.
    </p>
  </div>
</div>

<style>
  .talks {
    display: flex;
    flex-direction: column;
    row-gap: var(--spacing);
  }

  .talks > :global(.item-wrapper) {
    /* Never leave this blank! */
    box-sizing: border-box;
  }

  .content-block {
    display: flex;
    flex-direction: column;
    row-gap: calc(var(--spacing) * 0.5);
  }

  h2 {
    font-family: "Bitter", "Quicksand", sans-serif;
    font-size: min(2.2rem, 7vw);
  }

  h3 {
    font-family: "Bitter", "Quicksand", sans-serif;
    font-size: min(1.6rem, 4vw);
    font-style: italic;
  }

  .heading {
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
