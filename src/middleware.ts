import { defineMiddleware } from 'astro:middleware';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/за-мен': '/about/',
  '/за-мен/': '/about/',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const target = LEGACY_REDIRECTS[context.url.pathname];
  if (target) {
    return context.redirect(target, 301);
  }
  return next();
});
