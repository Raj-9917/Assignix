import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Landing          from './pages/Landing'
import Login            from './pages/auth/Login'
import Signup           from './pages/auth/Signup'
import Dashboard        from './pages/dashboard/Dashboard'
import Classrooms       from './pages/classrooms/Classrooms'
import ClassroomDetail  from './pages/classrooms/ClassroomDetail'
import Problems         from './pages/problems/Problems'
import ProblemDetail    from './pages/problems/ProblemDetail'
import Assignments      from './pages/assignments/Assignments'
import Practice         from './pages/practice/Practice'
import TopicDetail      from './pages/practice/TopicDetail'
import Friends          from './pages/friends/Friends'
import Challenge        from './pages/challenge/Challenge'
import Room             from './pages/challenge/Room'
import Progress         from './pages/progress/Progress'
import Settings         from './pages/settings/Settings'
import AdminDashboard   from './pages/admin/AdminDashboard'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public route — no sidebar/navbar */}
      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      {/* Authenticated shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/classrooms"     element={<Classrooms />} />
        <Route path="/classroom/:id"  element={<ClassroomDetail />} />
        <Route path="/problems"       element={<Problems />} />
        <Route path="/problem/:id"    element={<ProblemDetail />} />
        <Route path="/assignments"    element={<Assignments />} />
        <Route path="/practice"       element={<Practice />} />
        <Route path="/practice/topic/:topic" element={<TopicDetail />} />
        <Route path="/friends"        element={<Friends />} />
        <Route path="/challenge"      element={<Challenge />} />
        <Route path="/room/:id"       element={<Room />} />
        <Route path="/progress"       element={<Progress />} />
        <Route path="/settings"       element={<Settings />} />
        
        {/* Admin only route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  )
}
