<script lang="ts">
  import { PosFns } from "../model";

  const points = [
    PosFns.new(0, 300),
    PosFns.new(500, 250),
    PosFns.new(750, 350),
    PosFns.new(100, 500),
  ];
</script>

<svg width="960px" height="720px" viewBox="0 200 960 720">
  <path
    fill="none"
    stroke="mediumslateblue"
    d="M 0,300 L500,250, 750,350, 100,500 Z"
  />
</svg>
