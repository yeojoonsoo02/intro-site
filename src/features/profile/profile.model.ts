export type Interest =
  | string
  | {
      label: string;
      url: string;
    };

export type Profile = {
  name: string;
  tagline: string;
  email: string;
  photo: string;
  interests: Interest[];
  intro: string[];
  region: string;
};
