export const config = {
  brevo: {
    listId: 3,
  },
  turnstile: {
    siteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
  },
};
