import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Employee = {
  id: string
  first_name: string
  last_name: string
  middle_initial: string | null
  phone: string | null
  address: string | null
  role: string
  department: 'Management' | 'Delivery' | null
}

function Employee() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdminAndLoadEmployees()
  }, [])

  const checkAdminAndLoadEmployees = async () => {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        window.location.href = '/'
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        window.location.href = '/'
        return
      }

      await getEmployees()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not check admin access.',
      )
    } finally {
      setLoading(false)
    }
  }

  const getEmployees = async () => {
    const { data, error: employeesError } = await supabase
      .from('profiles')
      .select(
        'id, first_name, last_name, middle_initial, phone, address, role, department',
      )
      .eq('role', 'employee')
      .order('last_name', { ascending: true })

    if (employeesError) {
      console.error(employeesError)
      setError('Could not load employees.')
      return
    }

    setEmployees(data || [])
  }

  const handleDelete = async (employee: Employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employeeName}?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('You must be logged in as an admin.')
      return
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || adminProfile?.role !== 'admin') {
      setError('Only admins can delete employees.')
      return
    }

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', employee.id)

    if (deleteError) {
      console.error(deleteError)
      setError('Could not delete employee.')
      return
    }

    setMessage(`${employeeName} was deleted.`)

    await getEmployees()
  }

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase().trim()

    const fullName =
      `${employee.first_name} ${employee.middle_initial || ''} ${employee.last_name}`.toLowerCase()

    const phone = (employee.phone || '').toLowerCase()
    const address = (employee.address || '').toLowerCase()
    const department = (employee.department || '').toLowerCase()

    return (
      fullName.includes(searchText) ||
      phone.includes(searchText) ||
      address.includes(searchText) ||
      department.includes(searchText)
    )
  })

  if (loading) {
    return <p>Checking admin access...</p>
  }

  return (
    <div>
      <h1>Employee Management</h1>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/admin'
        }}
      >
        Back to Admin
      </button>

      <hr />

      <h2>Employees</h2>

      {error && <p role="alert">{error}</p>}

      {message && <p role="status">{message}</p>}

      <label htmlFor="employeeSearch">
        Search Employee
      </label>

      <br />

      <input
        id="employeeSearch"
        type="text"
        placeholder="Search by name, phone, address, or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      <button
        type="button"
        onClick={() => {
          window.location.href = '/admin/employees/add'
        }}
      >
        + Add Employee
      </button>

      <hr />

      <h2>Employee List</h2>

      {filteredEmployees.length === 0 ? (
        <p>
          {search
            ? 'No employees match your search.'
            : 'No employees found.'}
        </p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  {employee.first_name}{' '}
                  {employee.middle_initial
                    ? `${employee.middle_initial} `
                    : ''}
                  {employee.last_name}
                </td>

                <td>{employee.phone || '—'}</td>

                <td>{employee.address || '—'}</td>

                <td>{employee.department || '—'}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        `/admin/employees/edit?id=${employee.id}`
                    }}
                  >
                    Edit
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() => handleDelete(employee)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Employee