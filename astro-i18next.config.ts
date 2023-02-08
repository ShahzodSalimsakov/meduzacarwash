import type { AstroI18nextConfig } from "astro-i18next";

const config: AstroI18nextConfig = {
  defaultLocale: "ru",
  locales: ["ru", "uz"],
  i18nextServer: {
    debug: true,
  },
  i18nextClient: {
    debug: true,
  },
};

export default config;
