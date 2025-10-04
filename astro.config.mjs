// @ts-check
import vercelAdapter from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  site: "https://cazzert.vercel.app",
  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercelAdapter(),
  integrations: [icon(), sitemap(), react()],
});
