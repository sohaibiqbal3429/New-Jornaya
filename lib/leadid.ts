export const LEADID_CAMPAIGN_KEY = 'f3982147-9948-8ae0-9315-8ceb32269185';
export const LEADID_SCRIPT_ID = 'LeadiDscript_campaign';
export const LEADID_SCRIPT_SRC = `https://create.lidstatic.com/campaign/${LEADID_CAMPAIGN_KEY}.js?snippet_version=2`;
export const LEADID_CANONICAL_FIELD_ID = 'leadid_token';
export const LEADID_FORM_FIELD_ID = 'leadid_token_form';
export const LEADID_FIELD_NAME = 'universal_leadid';
export const LEADID_TOKEN_REGEX = /^[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}$/i;

export function normalizeLeadiDToken(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isValidLeadiDToken(value: unknown) {
  return LEADID_TOKEN_REGEX.test(normalizeLeadiDToken(value));
}
