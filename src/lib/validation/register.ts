// Sanitizing and validation for the registration form. Kept free of React and
// browser APIs so the register API endpoint can reuse it once Supabase is set up.
// Client-side checks are for the user's benefit only: the server must run them again.

export type RegisterInput = {
  mobile: string
  name: string
  address: string
}

export type RegisterErrors = Partial<Record<keyof RegisterInput, string>>

export type RegisterResult =
  | { ok: true; data: RegisterInput }
  | { ok: false; errors: RegisterErrors }

export const LIMITS = {
  name: { min: 2, max: 100 },
  address: { min: 10, max: 255 },
  // Longest accepted mobile spelling: "+63 912 345 6789" plus some extra spacing.
  mobile: { max: 20 },
} as const

// Control characters, zero-width characters, and bidi overrides. They are invisible,
// can hide or reorder text, and have no place in a name, address, or phone number.
const INVISIBLE_CHARS = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu

// Letters (any language), combining marks, spaces, and the punctuation that real
// names use: O'Brien, Dela Cruz-Santos, Ma. Teresa.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u

// Letters, digits, spaces, and the punctuation used in addresses:
// "Unit 4B, #12 Magsaysay Ave., Brgy. Session Rd. (near UB), Baguio City".
// Anything else, including < > " ` ; = { } \, is rejected.
const ADDRESS_PATTERN = /^[\p{L}\p{M}\p{N} .,#'()/&-]+$/u

// Philippine mobile numbers: 09XXXXXXXXX, 639XXXXXXXXX, or +639XXXXXXXXX.
const MOBILE_PATTERN = /^(?:\+?63|0)(9\d{9})$/

/** Normalizes Unicode, removes invisible characters, and collapses whitespace. */
export function sanitizeText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(INVISIBLE_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Returns the number in E.164 form (+639XXXXXXXXX), or null if it is not a PH mobile number. */
export function normalizeMobile(value: string): string | null {
  const compact = sanitizeText(value).replace(/[\s().-]/g, '')
  const match = MOBILE_PATTERN.exec(compact)
  return match ? `+63${match[1]}` : null
}

export function validateRegister(input: RegisterInput): RegisterResult {
  const errors: RegisterErrors = {}

  const rawMobile = sanitizeText(input.mobile)
  const mobile = normalizeMobile(rawMobile)
  if (!rawMobile) {
    errors.mobile = 'Mobile number is required.'
  } else if (rawMobile.length > LIMITS.mobile.max || !mobile) {
    errors.mobile = 'Enter a valid PH mobile number, e.g. 0912 345 6789.'
  }

  const name = sanitizeText(input.name)
  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    errors.name = `Name must be ${LIMITS.name.min} to ${LIMITS.name.max} characters.`
  } else if (!NAME_PATTERN.test(name)) {
    errors.name = "Name can only contain letters, spaces, and . ' -"
  }

  const address = sanitizeText(input.address)
  if (!address) {
    errors.address = 'Address is required.'
  } else if (address.length < LIMITS.address.min || address.length > LIMITS.address.max) {
    errors.address = `Address must be ${LIMITS.address.min} to ${LIMITS.address.max} characters.`
  } else if (!ADDRESS_PATTERN.test(address)) {
    errors.address = "Address can only contain letters, numbers, spaces, and . , # ' ( ) / & -"
  }

  if (Object.keys(errors).length > 0 || !mobile) {
    return { ok: false, errors }
  }
  return { ok: true, data: { mobile, name, address } }
}
