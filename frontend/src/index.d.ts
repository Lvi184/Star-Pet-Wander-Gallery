declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}