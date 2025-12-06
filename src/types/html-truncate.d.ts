declare module 'html-truncate' {
  interface Options {
    ellipsis?: string;
  }

  function truncate(html: string, length: number, options?: Options): string;

  export = truncate;
}
