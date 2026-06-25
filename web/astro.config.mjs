import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const isGithubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  site: "https://OmarHayat-DEV.github.io",
  base: isGithubPages ? "/pairs-trading-shopify" : "/",
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
