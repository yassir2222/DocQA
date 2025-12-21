import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

// Simuler un utilisateur par défaut (en attendant le backend)
const DEFAULT_USER = {
  id: '1',
  name: 'Dr. Martin',
  email: 'dr.martin@docqa.local',
  role: 'medecin',
  avatar: null,
};

/**
 * Provider d'authentification JWT
 * Note: Cette implémentation simule l'authentification côté frontend
 * Un vrai backend JWT serait nécessaire pour la production
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    const storedUser = localStorage.getItem('auth-user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Vérifier si le token n'est pas expiré (simulation)
        const tokenData = parseJwt(storedToken);
        if (tokenData && tokenData.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(userData);
        } else {
          // Token expiré, nettoyer
          logout();
        }
      } catch (e) {
        console.error('Erreur parsing user data:', e);
        logout();
      }
    } else {
      // Mode démo: auto-login avec utilisateur par défaut
      const demoToken = generateDemoToken(DEFAULT_USER);
      setToken(demoToken);
      setUser(DEFAULT_USER);
      localStorage.setItem('auth-token', demoToken);
      localStorage.setItem('auth-user', JSON.stringify(DEFAULT_USER));
    }
    
    setLoading(false);
  }, []);

  // Parser un JWT (simulation)
  const parseJwt = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (e) {
      return null;
    }
  };

  // Générer un token démo (simulation)
  const generateDemoToken = (user) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    }));
    const signature = btoa('demo-signature');
    return `${header}.${payload}.${signature}`;
  };

  // Connexion
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Simulation d'une requête API
      // En production, appeler votre API: const response = await api.login(email, password);
      
      // Pour la démo, accepter n'importe quel email/password
      await new Promise(resolve => setTimeout(resolve, 500)); // Simuler latence

      const userData = {
        id: '1',
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        role: 'medecin',
        avatar: null,
      };

      const newToken = generateDemoToken(userData);
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth-token', newToken);
      localStorage.setItem('auth-user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  }, []);

  // Mettre à jour le profil utilisateur
  const updateProfile = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('auth-user', JSON.stringify(updatedUser));
    return updatedUser;
  }, [user]);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  // Rafraîchir le token (simulation)
  const refreshToken = useCallback(async () => {
    if (!user) return false;
    
    try {
      const newToken = generateDemoToken(user);
      setToken(newToken);
      localStorage.setItem('auth-token', newToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, [user, logout]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateProfile,
    hasRole,
    refreshToken,
  }), [user, token, loading, login, logout, updateProfile, hasRole, refreshToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Composant pour protéger les routes
 */
export function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-800 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de login
    // En prod: return <Navigate to="/login" replace />;
    return null;
  }

  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    // Accès refusé
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
          <p className="text-slate-600 dark:text-slate-400">Accès non autorisé</p>
        </div>
      </div>
    );
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

RequireAuth.defaultProps = {
  roles: [],
};

export default AuthContext;
