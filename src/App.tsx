
import Login from './pages/Login'
import Register from './pages/Register'
import UserAccounts from './pages/UserAccount'

function App() {
  const path = window.location.pathname

  if (path === '/register') {
    return <Register />
  }

  if (path === '/account') {
    return <UserAccounts />
  }

  return <Login />
}

export default App

