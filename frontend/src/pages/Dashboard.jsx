import { useNavigate } from 'react-router-dom'

function Dashboard({ session, supabase }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <h1>Welcome to Dashboard</h1>
      <p>Email: <strong>{session.user.email}</strong></p>
      <p>User ID: <strong>{session.user.id}</strong></p>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Dashboard
