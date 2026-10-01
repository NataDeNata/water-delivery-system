import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  LIMITS,
  validateRegister,
  type RegisterErrors,
  type RegisterInput,
} from '../../lib/validation/register'

const EMPTY: RegisterInput = { mobile: '', name: '', address: '' }

export default function Register() {
  const [values, setValues] = useState<RegisterInput>(EMPTY)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState<RegisterInput | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as keyof RegisterInput
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const result = validateRegister(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setSubmitting(true)
    try {
      // TODO: send result.data to the register API endpoint once Supabase is set up.
      // The endpoint must validate again with validateRegister; never trust the client.
      setRegistered(result.data)
      setValues(EMPTY)
    } finally {
      setSubmitting(false)
    }
  }

  if (registered) {
    // Rendered as plain text by React, which escapes it; never use dangerouslySetInnerHTML here.
    return (
      <section>
        <h1>Register</h1>
        <p role="status">
          Thanks, {registered.name}. Your details are valid. Saving accounts is not connected yet.
        </p>
        <button type="button" onClick={() => setRegistered(null)}>
          Register another
        </button>
      </section>
    )
  }

  return (
    <section>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="mobile">Mobile number</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0912 345 6789"
            maxLength={LIMITS.mobile.max}
            required
            value={values.mobile}
            onChange={handleChange}
            aria-invalid={errors.mobile ? true : undefined}
            aria-describedby={errors.mobile ? 'mobile-error' : undefined}
          />
          {errors.mobile && (
            <p id="mobile-error">
              {errors.mobile}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name.max}
            required
            value={values.name}
            onChange={handleChange}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="address">Delivery address</label>
          <textarea
            id="address"
            name="address"
            autoComplete="street-address"
            rows={3}
            maxLength={LIMITS.address.max}
            required
            value={values.address}
            onChange={handleChange}
            aria-invalid={errors.address ? true : undefined}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && (
            <p id="address-error">
              {errors.address}
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </section>
  )
}
