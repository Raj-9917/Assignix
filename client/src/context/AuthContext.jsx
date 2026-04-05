import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  getIdToken
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import API_URL from '../config/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('assignix_token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return;
    try {
      const response = await fetch(`${API_URL}/auth/notifications`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Fetch notifications failed:', error);
      setNotifications([]);
    }
  }, [token]);

  const fetchFriends = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return;
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(Array.isArray(data.friends) ? data.friends : []);
      }
    } catch (error) {
      console.error('Fetch friends failed:', error);
      setFriends([]);
    }
  }, [token]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/notifications/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Mark read failed:', error);
    }
  }, [token]);

  const addFriend = useCallback(async (friendId) => {
    if (!token) return { success: false };
    try {
      const response = await fetch(`${API_URL}/auth/friends/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ friendId })
      });
      if (response.ok) {
        await fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Add friend failed:', error);
      return { success: false };
    }
  }, [token, fetchFriends]);

  // Sync Firebase Auth with Backend Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('assignix_token', idToken);

          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setFriends(Array.isArray(userData.friends) ? userData.friends : []);
            fetchNotifications(idToken);
          } else {
            console.error('Failed to sync profile with backend');
          }
        } catch (error) {
          console.error('Auth sync error:', error);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('assignix_token');
        setFriends([]);
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchNotifications, fetchFriends]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('assignix_token', idToken);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (name, username, email, password, role) => {
    try {
      // 1. Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // 2. Initial Register on Backend to create DB record
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ name, username, email, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed on server');
      }

      setToken(idToken);
      localStorage.setItem('assignix_token', idToken);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setUser(null);
      setFriends([]);
      setNotifications([]);
      localStorage.removeItem('assignix_token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }

      const updatedUser = await response.json();
      setUser(prev => ({ ...prev, ...updatedUser }));
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register, 
      logout, 
      updateProfile, 
      loading,
      friends,
      notifications,
      fetchFriends,
      fetchNotifications,
      addFriend,
      markAllNotificationsRead,
      setNotifications
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)
