// Type declarations for this TypeScript projecte provides type declarations for JSX files that haven't been converted to TypeScript yet
declare module "*.jsx" {
  import { ComponentType } from "react";
  const Component: ComponentType<any>;
  export default Component;
}

declare module "*.js" {
  const content: any;
  export default content;
}
