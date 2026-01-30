// Type definitions for epubjs
declare module 'epubjs' {
  export interface NavItem {
    id: string;
    href: string;
    label: string;
    subitems?: NavItem[];
  }

  export interface PackagingMetadata {
    title: string;
    creator: string;
    description?: string;
    publisher?: string;
    language?: string;
    rights?: string;
    identifier?: string;
    date?: string;
  }

  export interface Navigation {
    toc: NavItem[];
  }

  export interface Section {
    href: string;
    index: number;
    cfiBase: string;
    load(loader: (href: string) => Promise<Document>): Promise<Document>;
  }

  export interface Spine {
    get(cfi: string): Section | null;
    each(callback: (section: Section, index: number) => Promise<void> | void): void;
    items: Section[];
  }

  export interface SpineItem {
    href: string;
    index: number;
    cfiBase: string;
  }

  export interface Locations {
    generate(chars: number): Promise<string[]>;
    length(): number;
    locationFromCfi(cfi: string): number;
    cfiFromLocation(location: number): string;
    cfiFromPercentage(percentage: number): string;
  }

  export interface Theme {
    register(name: string, styles: Record<string, Record<string, string>>): void;
    select(name: string): void;
    override(key: string, value: string): void;
  }

  export interface DisplayedLocation {
    start: {
      cfi: string;
      displayed: { page: number; total: number };
    };
    end: {
      cfi: string;
    };
  }

  export interface Rendition {
    display(target?: string | number): Promise<void>;
    prev(): Promise<void>;
    next(): Promise<void>;
    destroy(): void;
    themes: Theme;
    on(event: 'locationChanged', callback: (location: DisplayedLocation) => void): void;
    on(event: 'keyup', callback: (e: KeyboardEvent) => void): void;
    on(event: 'click', callback: (e: MouseEvent) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
  }

  export interface Book {
    ready: Promise<void>;
    loaded: {
      metadata: Promise<PackagingMetadata>;
      navigation: Promise<Navigation>;
    };
    spine: Spine;
    packaging?: {
      metadata: PackagingMetadata;
    };
    load: (href: string) => Promise<Document>;
    locations: Locations;
    coverUrl(): Promise<string | null>;
    renderTo(element: HTMLElement, options?: {
      width?: string | number;
      height?: string | number;
      spread?: 'none' | 'always' | 'auto';
      flow?: 'paginated' | 'scrolled';
      manager?: string;
    }): Rendition;
    destroy(): void;
  }

  function ePub(url: string | ArrayBuffer, options?: {
    openAs?: 'epub' | 'binary' | 'base64' | 'directory';
    requestHeaders?: Record<string, string>;
    encoding?: string;
  }): Book;

  export default ePub;
}
