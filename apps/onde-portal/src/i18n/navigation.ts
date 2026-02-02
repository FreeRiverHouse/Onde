// Simplified navigation exports (next-intl disabled for static export)
import NextLink from 'next/link';
import { redirect as nextRedirect } from 'next/navigation';
import { usePathname as nextUsePathname, useRouter as nextUseRouter } from 'next/navigation';

export const localePrefix = 'never'; // Disabled for static export

export const Link = NextLink;
export const redirect = nextRedirect;
export const usePathname = nextUsePathname;
export const useRouter = nextUseRouter;
