/// <reference types="react-scripts" />

declare module '*.tsx' {
  const content: React.ComponentType<any>;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
} 