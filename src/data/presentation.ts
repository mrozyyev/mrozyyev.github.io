type Social = {
  label: string;
  link: string;
};

type Presentation = {
  mail: string;
  title: string;
  description: string;
  socials: Social[];
};

const presentation: Presentation = {
  mail: "rozyyevmuhammet@gmail.com",
  title: "Hello there! I'm mrozyyev 👋",
  description:
    "I'm a passionate web developer with a background in UI/UX design. Originally from Turkmenistan, I've recently embarked on a new chapter of my journey in Romania, where I'm pursuing a Masters degree in Information Technology. With a keen eye for detail and a strong foundation in creating seamless user experiences, I bring a unique blend of technical expertise and design sensibility to the world of web development. Currently, I'm on the lookout for hybrid or remote job opportunities that align with my academic pursuits, offering my skills and dedication as a work-student. Let's connect and explore the possibilities of crafting innovative digital experiences together!",
  socials: [
    {
      label: "Twitter",
      link: "https://twitter.com/m_rozyyev",
    },
    {
      label: "Bento",
      link: "https://bento.me/mrozyyev",
    },
    {
      label: "Github",
      link: "https://github.com/mrozyyev",
    },
  ],
};

export default presentation;
