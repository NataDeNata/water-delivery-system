import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import UserAccounts from './pages/users/UserAccount'

import Admin from './pages/admin/admin'
import Products from './pages/admin/products'
import Employee from './pages/admin/EmployeeManagement/Employee'
import AddEmployee from './pages/admin/EmployeeManagement/AddEmployee'
import EditEmployee from './pages/admin/EmployeeManagement/EditEmployee'
import EmployeeHome from './pages/employees/Employee'

function App() {
  const path = window.location.pathname

  if (path === '/register') {
    return <Register />
  }

  if (path === '/account') {
    return <UserAccounts />
  }

  if (path === '/admin') {
    return <Admin />
  }

  if (path === '/admin/products') {
    return <Products />
  }

  if (path === '/admin/employees') {
    return <Employee />
  }

  if (path === '/admin/employees/add') {
    return <AddEmployee />
  }

  if (path === '/admin/employees/edit') {
    return <EditEmployee />
  }

  if (path === '/employee') {
    return <EmployeeHome />
  }

  return <Login />
}

export default App