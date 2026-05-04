import { defineMiddleware } from 'astro:middleware';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/за-мен': '/about/',
  '/за-мен/': '/about/',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const target = LEGACY_REDIRECTS[path];
  if (target) {
    return new Response(null, {
      status: 301,
      headers: { Location: target, 'x-redirect-by': 'middleware' },
    });
  }
  const response = await next();
  response.headers.set('x-mw-saw-path', path);
  return response;
});
