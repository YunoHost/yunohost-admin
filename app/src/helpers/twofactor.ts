export type TwoFactorSetup = {
  secret: string
  uri: string
  recovery_codes: string[]
  setup_token: string
}

export type TwoFactorChallenge = {
  error:
    | 'twofactor_code_required'
    | 'twofactor_code_invalid'
    | 'twofactor_setup_required'
    | 'twofactor_setup_token_expired'
    | 'twofactor_setup_token_invalid'
  message: string
} & Partial<TwoFactorSetup>

/**
 * During /login, the API answers 2FA challenges with a 401 whose body is a
 * JSON document `{ error: 'twofactor_…', message, …extra }`.
 * Returns null for any other error (eg. invalid password).
 */
export function parseTwoFactorChallenge(
  data: unknown,
): TwoFactorChallenge | null {
  let parsed = data
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return null
    }
  }
  if (
    parsed &&
    typeof parsed === 'object' &&
    typeof (parsed as { error?: unknown }).error === 'string' &&
    (parsed as { error: string }).error.startsWith('twofactor_')
  ) {
    return parsed as TwoFactorChallenge
  }
  return null
}

/** Group the base32 secret by 4 chars, for manual entry */
export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') ?? secret
}
