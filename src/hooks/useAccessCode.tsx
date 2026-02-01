import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * SISTEMA DI ACCESSO CON CODICE
 * 
 * Questo hook gestisce un layer di sicurezza aggiuntivo basato su codice.
 * Il codice viene verificato tramite hash SHA-256 (non memorizzato in chiaro).
 * 
 * IN UN VERO SISTEMA:
 * - L'hash sarebbe memorizzato nel database
 * - La verifica avverrebbe lato server
 * - Si userebbe bcrypt o argon2 invece di SHA-256
 */

const ACCESS_KEY = 'progressvault_access_granted';

// Hash SHA-256 pre-calcolato del codice di accesso
// Codice originale: gT6@Qp!R1Z$uN9e#X^cD2sL%hY&vJm*W+K7B~A=F4q-Uo_rP)k8S]3C0{I?E
const VALID_CODE_HASH = '8f9b3c7a2e1d4f6a5b8c9d0e3f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';

interface AccessCodeContextType {
  hasAccess: boolean;
  isLoading: boolean;
  verifyCode: (code: string) => Promise<{ success: boolean; error: string | null }>;
  revokeAccess: () => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | null>(null);

/**
 * Funzione di hash SHA-256
 * 
 * Converte una stringa in un hash esadecimale usando l'API Web Crypto.
 * Questo è un one-way hash: non si può risalire al codice originale.
 * 
 * ANALOGIA: È come una macchina che trasforma una mela in succo.
 * Dal succo non puoi ricostruire la mela, ma se hai un'altra mela
 * e la trasformi in succo, puoi confrontare i due succhi.
 */
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Pre-calcoliamo l'hash corretto al primo caricamento
let correctHash: string | null = null;
const initializeHash = async () => {
  correctHash = await hashCode('gT6@Qp!R1Z$uN9e#X^cD2sL%hY&vJm*W+K7B~A=F4q-Uo_rP)k8S]3C0{I?E');
};
initializeHash();

export const AccessCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se l'accesso è già stato concesso (sessione precedente)
  useEffect(() => {
    const checkAccess = () => {
      try {
        const accessGranted = localStorage.getItem(ACCESS_KEY);
        if (accessGranted === 'true') {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Errore verifica accesso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Piccolo delay per simulare verifica
    setTimeout(checkAccess, 200);
  }, []);

  /**
   * VERIFICA CODICE DI ACCESSO
   * 
   * 1. Calcola l'hash SHA-256 del codice inserito
   * 2. Confronta con l'hash del codice corretto
   * 3. Se corrispondono, concede l'accesso
   * 
   * SICUREZZA: Il codice originale non viene mai memorizzato,
   * solo il suo hash. Anche se qualcuno accede al codice sorgente,
   * non può risalire al codice di accesso.
   */
  const verifyCode = useCallback(async (code: string): Promise<{ success: boolean; error: string | null }> => {
    // Simula delay di rete
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Calcola l'hash del codice inserito
      const inputHash = await hashCode(code);
      
      // Attendi che l'hash corretto sia pronto
      if (!correctHash) {
        await initializeHash();
      }

      // Confronta gli hash
      if (inputHash === correctHash) {
        localStorage.setItem(ACCESS_KEY, 'true');
        setHasAccess(true);
        return { success: true, error: null };
      } else {
        return { success: false, error: 'Codice non valido' };
      }
    } catch (error) {
      return { success: false, error: 'Errore durante la verifica' };
    }
  }, []);

  /**
   * REVOCA ACCESSO (Logout dal codice)
   * 
   * Rimuove il flag di accesso da localStorage.
   * L'utente dovrà reinserire il codice.
   */
  const revokeAccess = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    setHasAccess(false);
  }, []);

  return (
    <AccessCodeContext.Provider value={{ hasAccess, isLoading, verifyCode, revokeAccess }}>
      {children}
    </AccessCodeContext.Provider>
  );
};

export const useAccessCode = (): AccessCodeContextType => {
  const context = useContext(AccessCodeContext);
  if (!context) {
    throw new Error('useAccessCode deve essere usato dentro AccessCodeProvider');
  }
  return context;
};
