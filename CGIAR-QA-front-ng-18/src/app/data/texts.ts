interface TextConfig {
  id: number;
  text: string;
  classes: string[];
  attributes?: { name: string; value: string }[];
}

export const TEXTS: TextConfig[] = [
  {
    id: 1,
    text: 'Enter your username to reset your password.',
    classes: ['error']
  }
];
