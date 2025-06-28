export type Profile = {
  name: string;
  tagline: string;
  email: string;
  photo: string;
  interests: {
    label: string;
    url: string;
  }[];
  intro: string[];
  region: string;
};
