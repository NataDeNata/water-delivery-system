import { useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabase'

type Department = 'Management' | 'Delivery'

type Employee = {
  id: string
  first_name: string
  last_name: string
  middle_initial: string | null
  phone: string | null
  address: string | null
  role: string
  department: Department | null
}

function capitalizeWords(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (!word) return ''
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function EditEmployee() {
  const [employee, setEmployee] =
    useState<Employee | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadEmployee()
  }, [])

  const loadEmployee = async () => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams(
      window.location.search,
    )

    const employeeId = params.get('id')

    if (!employeeId) {
      setError('Employee ID was not provided.')
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        window.location.href = '/'
        return
      }

      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (
        adminError ||
        adminProfile?.role !== 'admin'
      ) {
        window.location.href = '/'
        return
      }

      const {
        data,
        error: employeeError,
      } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, middle_initial, phone, address, role, department',
        )
        .eq('id', employeeId)
        .eq('role', 'employee')
        .single()

      if (employeeError || !data) {
        setError('Employee could not be found.')
        return
      }

      setEmployee(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load employee.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: keyof Employee,
    value: string,
  ) => {
    if (!employee) return

    let newValue = value

    if (
      field === 'first_name' ||
      field === 'last_name'
    ) {
      newValue = capitalizeWords(value)
    }

    if (field === 'middle_initial') {
      newValue = value.toUpperCase()
    }

    setEmployee({
      ...employee,
      [field]: newValue,
    })

    setError('')
    setMessage('')
  }

  const handleDepartmentChange = (
    value: Department,
  ) => {
    if (!employee) return

    setEmployee({
      ...employee,
      department: value,
    })

    setError('')
    setMessage('')
  }

  const handleSave = async () => {
    if (!employee || saving) return

    if (
      !employee.first_name.trim() ||
      !employee.last_name.trim()
    ) {
      setError(
        'First name and last name are required.',
      )
      return
    }

    if (!employee.department) {
      setError('Please select a department.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError(
          'You must be logged in as an admin.',
        )
        return
      }

      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (
        adminError ||
        adminProfile?.role !== 'admin'
      ) {
        setError(
          'Only admins can edit employees.',
        )
        return
      }

      const {
        error: updateError,
      } = await supabase
        .from('profiles')
        .update({
          first_name:
            employee.first_name.trim(),

          last_name:
            employee.last_name.trim(),

          middle_initial:
            employee.middle_initial?.trim() || null,

          phone:
            employee.phone?.trim() || null,

          address:
            employee.address?.trim() || null,

          department:
            employee.department,
        })
        .eq('id', employee.id)
        .eq('role', 'employee')

      if (updateError) {
        console.error(updateError)

        setError(
          'Could not update employee.',
        )

        return
      }

      setMessage(
        'Employee updated successfully.',
      )

      setTimeout(() => {
        window.location.href = '/admin/employees'
      }, 1000)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update employee.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading employee...</p>
  }

  if (!employee) {
    return (
      <div>
        <h1>Edit Employee</h1>

        <p role="alert">
          {error || 'Employee not found.'}
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              '/admin/employees'
          }}
        >
          Back to Employees
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Edit Employee</h1>

      <button
        type="button"
        onClick={() => {
          window.location.href =
            '/admin/employees'
        }}
      >
        Back to Employees
      </button>

      <hr />

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {message && (
        <p role="status">
          {message}
        </p>
      )}

      <div>
        <label htmlFor="firstName">
          First Name
        </label>

        <br />

        <input
          id="firstName"
          type="text"
          value={employee.first_name}
          onChange={(e) =>
            handleChange(
              'first_name',
              e.target.value,
            )
          }
          required
        />
      </div>

      <br />

      <div>
        <label htmlFor="lastName">
          Last Name
        </label>

        <br />

        <input
          id="lastName"
          type="text"
          value={employee.last_name}
          onChange={(e) =>
            handleChange(
              'last_name',
              e.target.value,
            )
          }
          required
        />
      </div>

      <br />

      <div>
        <label htmlFor="middleInitial">
          Middle Initial
        </label>

        <br />

        <input
          id="middleInitial"
          type="text"
          value={
            employee.middle_initial || ''
          }
          onChange={(e) =>
            handleChange(
              'middle_initial',
              e.target.value,
            )
          }
          maxLength={1}
        />
      </div>

      <br />

      <div>
        <label htmlFor="phone">
          Phone
        </label>

        <br />

        <input
          id="phone"
          type="tel"
          value={employee.phone || ''}
          onChange={(e) =>
            handleChange(
              'phone',
              e.target.value,
            )
          }
        />
      </div>

      <br />

      <div>
        <label htmlFor="address">
          Address
        </label>

        <br />

        <input
          id="address"
          type="text"
          value={employee.address || ''}
          onChange={(e) =>
            handleChange(
              'address',
              e.target.value,
            )
          }
        />
      </div>

      <br />

      <div>
        <label htmlFor="department">
          Department
        </label>

        <br />

        <select
          id="department"
          value={
            employee.department || ''
          }
          onChange={(e) =>
            handleDepartmentChange(
              e.target.value as Department,
            )
          }
          required
        >
          <option value="">
            Select Department
          </option>

          <option value="Management">
            Management
          </option>

          <option value="Delivery">
            Delivery
          </option>
        </select>
      </div>

      <br />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? 'Saving...'
          : 'Save Changes'}
      </button>

      {' '}

      <button
        type="button"
        onClick={() => {
          window.location.href =
            '/admin/employees'
        }}
        disabled={saving}
      >
        Cancel
      </button>
    </div>
  )
}

export default EditEmployee