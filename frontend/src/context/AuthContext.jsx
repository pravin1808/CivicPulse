import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (token) => {
    localStorage.setItem('civicpulse_token', token);
    const decoded = decodeJwt(token);
    if (decoded) {
      let role = '';
      if (decoded.role === 'ROLE_ADMIN') role = 'admin';
      else if (decoded.role === 'ROLE_CITIZEN') role = 'citizen';
      else if (decoded.role === 'ROLE_WORKER') role = 'worker';
      
      setUser({
        email: decoded.sub,
        role: role,
        rawRole: decoded.role
      });
      return role;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('civicpulse_token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('civicpulse_token');
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        let role = '';
        if (decoded.role === 'ROLE_ADMIN') role = 'admin';
        else if (decoded.role === 'ROLE_CITIZEN') role = 'citizen';
        else if (decoded.role === 'ROLE_WORKER') role = 'worker';

        setUser({
          email: decoded.sub,
          role: role,
          rawRole: decoded.role
        });
      } else {
        localStorage.removeItem('civicpulse_token');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
