 declare module "troika-three-text" {
  import type { Mesh } from "three";
  export class Text extends Mesh {
    text: string;
    sync(callback?: () => void): void;
    dispose(): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}