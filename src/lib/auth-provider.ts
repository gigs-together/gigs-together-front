import type { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
  login: ({ username, password }) => {
    // Simple demo authentication - in production, validate against your API
    if (username && password) {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          id: username,
          fullName: username,
          email: username,
        }),
      );
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter both username and password'));
  },

  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('auth')
      ? Promise.resolve()
      : Promise.reject(new Error('Not authenticated'));
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject(new Error('Authentication failed'));
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const user = JSON.parse(auth);
        return Promise.resolve(user);
      }
    } catch {
      // Handle parsing errors
    }
    return Promise.reject(new Error('No identity'));
  },

  getPermissions: () => {
    // Return permissions for the user
    return Promise.resolve(['admin']);
  },
};
