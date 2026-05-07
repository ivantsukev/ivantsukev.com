export const config = {
  brevo: {
    listId: 3,
  },
  turnstile: {
    // Public by design — rendered into browser HTML for every visitor.
    // Build-time config lives in code; runtime secrets stay in Cloudflare env.
    siteKey: '0x4AAAAAADIyQSInBgmNfRod',
  },
};
