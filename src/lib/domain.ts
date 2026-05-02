/**
 * Domain configuration for Kaftan Queens.
 *
 * When admin.kaftanqueens.com is live, set VITE_ADMIN_DOMAIN in your .env:
 *   VITE_ADMIN_DOMAIN=admin.kaftanqueens.com
 *
 * The admin dashboard will then only be accessible from that subdomain,
 * and the main site will hide all admin navigation links.
 */

export const MAIN_DOMAIN = import.meta.env.VITE_MAIN_DOMAIN || 'kaftanqueens.com';
export const ADMIN_DOMAIN = import.meta.env.VITE_ADMIN_DOMAIN || null;

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

/** True when running on the admin subdomain (or in dev with no ADMIN_DOMAIN set) */
export const isAdminDomain =
  ADMIN_DOMAIN ? hostname === ADMIN_DOMAIN : true;

/** True when running on the main storefront domain */
export const isMainDomain = !ADMIN_DOMAIN || hostname !== ADMIN_DOMAIN;
