'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  userRole: string | null;
  isLoading: boolean;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = () => {
    // Optimize by reducing loading time and state updates
    try {
      const token = localStorage.getItem('authToken');
      const storedUserId = localStorage.getItem('userId');
      const storedUserRole = localStorage.getItem('userRole');
      
      if (token && storedUserId) {
        setIsAuthenticated(true);
        setUserId(storedUserId);
        setUserRole(storedUserRole);
        setIsLoading(false);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Immediate check without delay for better performance
    const token = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');
    
    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
      setUserRole(storedUserRole);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userId: string, role: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserId(userId);
      setUserRole(role);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('redirectAfterLogin');
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userId, 
      userRole, 
      isLoading, 
      login, 
      logout, 
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };


// 'use client';
// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface AuthContextProps {
//   isAuthenticated: boolean;
//   userId: string | null;
//   profileImage: string | null; // Add profileImage
//   login: (token: string, userId: string, profileImage: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [profileImage, setProfileImage] = useState<string | null>(null); // Add profileImage state

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     const storedUserId = localStorage.getItem('userId');
//     const storedProfileImage = localStorage.getItem('profileImage'); // Retrieve profileImage
//     if (token && storedUserId) {
//       setIsAuthenticated(true);
//       setUserId(storedUserId);
//       setProfileImage(storedProfileImage || null);
//     }
//   }, []);

//   const login = (token: string, userId: string, profileImage: string) => {
//     localStorage.setItem('authToken', token);
//     localStorage.setItem('userId', userId);
//     localStorage.setItem('profileImage', profileImage); // Store profileImage
//     setIsAuthenticated(true);
//     setUserId(userId);
//     setProfileImage(profileImage);
//   };

//   const logout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('profileImage'); // Clear profileImage
//     setIsAuthenticated(false);
//     setUserId(null);
//     setProfileImage(null);
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, userId, profileImage, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export { AuthProvider, useAuth };


// 'use client';
// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface UserProfile {
//   id: string;
//   name: string;
//   profileImage: string;
// }

// interface AuthContextProps {
//   isAuthenticated: boolean;
//   userId: string | null;
//   userProfile: UserProfile | null;
//   login: (token: string, userId: string) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     const storedUserId = localStorage.getItem('userId');
//     if (token && storedUserId) {
//       setIsAuthenticated(true);
//       setUserId(storedUserId);

//       // Fetch user profile from API
//       fetch(`/http://localhost:5000/api/profile/${storedUserId}`)
//         .then((response) => response.json())
//         .then((data) => setUserProfile(data))
//         .catch((error) => console.error('Error fetching user profile:', error));
//     }
//   }, []);

//   const login = (token: string, userId: string) => {
//     localStorage.setItem('authToken', token);
//     localStorage.setItem('userId', userId);
//     setIsAuthenticated(true);
//     setUserId(userId);
//   };

//   const logout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userId');
//     setIsAuthenticated(false);
//     setUserId(null);
//     setUserProfile(null);
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, userId, userProfile, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export { AuthProvider, useAuth };
