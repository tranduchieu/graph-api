declare var Parse: Object;

declare module 'url' {
  declare class Url {
    parse(imgSrc: string): Object;
  }
  declare module.exports: Url;
}