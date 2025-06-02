import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userRole: 'student' | 'faculty' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'faculty') => Promise<void>;
  signOut: () => Promise<void>;
  updateUsers: (email: string, password: string, role: 'student' | 'faculty') => void;
  removeUser: (id: string, role: 'student' | 'faculty') => void;
}

// Predefined users for authentication
export const authorizedUsers = {
  students: [
    { email: 'lokesh@gmail.com', password: 'lokesh123', id: 's1' },
    { email: 'gowtham@gmail.com', password: 'gowtham123', id: 's2' },
    { email: 'trinadh@gmail.com', password: 'trinadh123', id: 's3' },
    { email: 'student4@gmail.com', password: 'student012', id: 's4' },
  ],
  faculty: [
    { email: 'zaki@gmail.com', password: 'zaki123', id: 'f1' },
    { email: 'faculty2@example.com', password: 'faculty456', id: 'f2' },
  ],
  admin: [
    { email: 'admin@mbu.com', password: 'admin123', id: 'a1' }
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('userEmail');
    if (token && storedEmail) {
      const isStudent = authorizedUsers.students.some(u => u.email === storedEmail);
      const isFaculty = authorizedUsers.faculty.some(u => u.email === storedEmail);
      const isAdmin = authorizedUsers.admin.some(u => u.email === storedEmail);
      
      if (isStudent || isFaculty || isAdmin) {
        let role: 'student' | 'faculty' | 'admin';
        let userId: string;

        if (isStudent) {
          role = 'student';
          userId = authorizedUsers.students.find(u => u.email === storedEmail)!.id;
        } else if (isFaculty) {
          role = 'faculty';
          userId = authorizedUsers.faculty.find(u => u.email === storedEmail)!.id;
        } else {
          role = 'admin';
          userId = authorizedUsers.admin.find(u => u.email === storedEmail)!.id;
        }
        
        setUser({ id: userId, email: storedEmail });
        setUserRole(role);
      }
    }
    setLoading(false);
  }, []);

  const updateUsers = (email: string, password: string, role: 'student' | 'faculty') => {
    const userExists = [...authorizedUsers.students, ...authorizedUsers.faculty]
      .some(u => u.email === email);

    if (userExists) {
      throw new Error('User with this email already exists');
    }

    const newId = role === 'student' 
      ? `s${authorizedUsers.students.length + 1}`
      : `f${authorizedUsers.faculty.length + 1}`;

    const newUser = { email, password, id: newId };

    if (role === 'student') {
      authorizedUsers.students.push(newUser);
    } else {
      authorizedUsers.faculty.push(newUser);
    }
  };

  const removeUser = (id: string, role: 'student' | 'faculty') => {
    if (role === 'student') {
      const index = authorizedUsers.students.findIndex(s => s.id === id);
      if (index !== -1) {
        authorizedUsers.students.splice(index, 1);
      }
    } else {
      const index = authorizedUsers.faculty.findIndex(f => f.id === id);
      if (index !== -1) {
        authorizedUsers.faculty.splice(index, 1);
      }
    }
  };

  async function signIn(email: string, password: string) {
    const student = authorizedUsers.students.find(
      u => u.email === email && u.password === password
    );
    const faculty = authorizedUsers.faculty.find(
      u => u.email === email && u.password === password
    );
    const admin = authorizedUsers.admin.find(
      u => u.email === email && u.password === password
    );

    const user = student || faculty || admin;
    if (!user) {
      throw new Error('Invalid email or password');
    }

    let role: 'student' | 'faculty' | 'admin';
    if (student) role = 'student';
    else if (faculty) role = 'faculty';
    else role = 'admin';

    localStorage.setItem('authToken', 'auth-token');
    localStorage.setItem('userEmail', email);
    setUser({ id: user.id, email: user.email });
    setUserRole(role);
  }

  async function signUp(email: string, password: string, role: 'student' | 'faculty') {
    throw new Error('New user registration is not allowed. Please use an authorized account.');
  }

  async function signOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setUser(null);
    setUserRole(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signIn,
      signUp,
      signOut,
      updateUsers,
      removeUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}