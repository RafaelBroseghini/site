import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://rafaelbroseghini.com/",
    title: "rafaelbroseghini.com",
    description: "Cloud-native tooling, side projects, and things I'm still trying to figure out.",
    author: "Rafael Broseghini",
    profile: "https://github.com/rafaelbroseghini",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/Chicago",
    dir: "ltr",
    blurb:
      "Hi, I'm Rafa! I write about cloud-native tooling, side projects, and things I'm still trying to figure out.",
  },
  posts: {
    perPage: 5,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/rafaelbroseghini" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/rafaelbroseghini/",
    },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
