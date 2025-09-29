// Global type declarations for CSS imports and other modules

// For CSS module imports (when using CSS modules)
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// For global CSS side-effect imports
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
