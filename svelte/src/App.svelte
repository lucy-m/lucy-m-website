<script lang="ts">
  import finny from "./assets/finny.png";
</script>

<main>
  <h1>Hello pqy</h1>
  <p>
    My name is Lucy and I make websites. Sometimes I even keep them up to date.
  </p>
  <figure>
    <img src={finny} alt="Me" class="me" />
    <figcaption>
      This is a picture of me, in case you couldn't guess.
    </figcaption>
  </figure>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    max-width: 500px;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    padding: clamp(18px, 6vw, 32px);
    background-color: hsl(143.71deg 43.79% 96.1%);
  }

  img.me {
    clip-path: inset(1px);
    width: 100%;
  }
</style>
