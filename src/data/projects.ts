export type Project = {
  title: string;
  techs: string[];
  link: string;
  isComingSoon?: boolean;
};

const projects: Project[] = [
  {
    title: "Asufilling Machinery - website",
    techs: ["Astro", "ReactJS", "TailwindCSS", "Pocketbase", ],
    link: "https://asufilling.com/"
  },
  {
    title: "Bars Confectionary - website",
    techs: ["Astro", "ReactJS", "Svelte", "TailwindCSS", "Directus", ],
    link: "https://bars.tm/"
  },
];

export default projects;
