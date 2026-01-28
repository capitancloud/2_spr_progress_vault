import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * SIMULAZIONE AUTENTICAZIONE
 * 
 * IN UN VERO DATABASE (Supabase):
 * - auth.users: tabella gestita da Supabase Auth
 * - signUp → supabase.auth.signUp({ email, password })
 * - signIn → supabase.auth.signInWithPassword({ email, password })
 * - signOut → supabase.auth.signOut()
 * - session → supabase.auth.getSession()
 * 
 * QUI SIMULIAMO con localStorage per scopi didattici
 */

const USERS_KEY = 'progressvault_users';
const SESSION_KEY = 'progressvault_session';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

interface StoredUser extends User {
  password_hash: string; // btoa encoded (NON sicuro, solo demo!)
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Simula l'hashing della password
 * 
 * IN PRODUZIONE: Supabase usa bcrypt lato server
 * QUI: usiamo btoa per simulazione (NON SICURO!)
 */
const hashPassword = (password: string): string => {
  return btoa(password + '_salt_demo');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica sessione esistente al mount
  useEffect(() => {
    /**
     * LETTURA: Verifica sessione esistente
     * 
     * IN SUPABASE: supabase.auth.getSession()
     * QUI: leggiamo da localStorage
     */
    const loadSession = () => {
      try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Errore caricamento sessione:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simula delay di rete
    setTimeout(loadSession, 300);
  }, []);

  /**
   * SCRITTURA: Registrazione nuovo utente
   * 
   * IN SUPABASE:
   * INSERT INTO auth.users (email, encrypted_password)
   * VALUES ('email', 'bcrypt_hash')
   * 
   * QUI: salviamo in localStorage
   */
  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    // Simula delay di rete
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      // Verifica se l'email esiste già
      if (users.some(u => u.email === email)) {
        return { error: 'Email già registrata' };
      }

      // Crea nuovo utente
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email,
        password_hash: hashPassword(password),
        created_at: new Date().toISOString(),
      };

      // Salva utente
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Crea sessione
      const { password_hash, ...userWithoutPassword } = newUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userWithoutPassword }));
      setUser(userWithoutPassword);

      return { error: null };
    } catch (error) {
      return { error: 'Errore durante la registrazione' };
    }
  }, []);

  /**
   * LETTURA + VERIFICA: Login utente
   * 
   * IN SUPABASE:
   * SELECT * FROM auth.users WHERE email = 'email'
   * Poi verifica bcrypt del password hash
   * 
   * QUI: leggiamo da localStorage e verifichiamo
   */
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    // Simula delay di rete
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      const storedUser = users.find(u => u.email === email);

      if (!storedUser) {
        return { error: 'Email non trovata' };
      }

      if (!verifyPassword(password, storedUser.password_hash)) {
        return { error: 'Password non corretta' };
      }

      // Crea sessione
      const { password_hash, ...userWithoutPassword } = storedUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userWithoutPassword }));
      setUser(userWithoutPassword);

      return { error: null };
    } catch (error) {
      return { error: 'Errore durante il login' };
    }
  }, []);

  /**
   * SCRITTURA: Logout utente
   * 
   * IN SUPABASE: supabase.auth.signOut()
   * Invalida il token JWT
   * 
   * QUI: rimuoviamo la sessione da localStorage
   */
  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};
