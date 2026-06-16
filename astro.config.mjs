import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Get the site URL from environment variables, or use the default value if not set
// Note: After the first deployment, be sure to set the correct PUBLIC_SITE_URL in the .env file
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://portfolio.ricoui.com/';
const basePath = process.env.PUBLIC_BASE_PATH || '/';

function remarkPublicAssetBase() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;

      if (
        node.type === 'image' &&
        typeof node.url === 'string' &&
        node.url.startsWith('/assets/') &&
        basePath !== '/'
      ) {
        node.url = `${basePath.replace(/\/$/, '')}${node.url}`;
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  base: basePath,
  envPrefix: 'PUBLIC_',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  },

  server: {
    port: 5200,
  },

  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkPublicAssetBase],
  },
});
