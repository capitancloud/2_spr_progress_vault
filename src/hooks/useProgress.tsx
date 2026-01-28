import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * STRUTTURA DATI: user_progress
 * 
 * IN UN VERO DATABASE (PostgreSQL/Supabase):
 * CREATE TABLE user_progress (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   level INTEGER DEFAULT 1,
 *   xp INTEGER DEFAULT 0,
 *   lessons_completed INTEGER DEFAULT 0,
 *   total_lessons INTEGER DEFAULT 10,
 *   last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ROW LEVEL SECURITY:
 * CREATE POLICY "Users can only access their own progress"
 *   ON user_progress FOR ALL
 *   USING (auth.uid() = user_id);
 */

const STORAGE_KEY = 'progressvault_progress';

export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  lessons_completed: number;
  total_lessons: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface DbOperation {
  id: string;
  type: 'read' | 'write';
  operation: string;
  query: string;
  timestamp: string;
  column?: string;
}

interface UseProgressReturn {
  progress: UserProgress | null;
  isLoading: boolean;
  operations: DbOperation[];
  addXp: (amount: number) => Promise<void>;
  completeLesson: () => Promise<void>;
  resetProgress: () => Promise<void>;
  clearOperations: () => void;
}

const XP_PER_LEVEL = 100;

/**
 * Simula un delay di rete per rendere l'esperienza realistica
 * In produzione, questo sarebbe il tempo reale di risposta del server
 */
const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const useProgress = (): UseProgressReturn => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operations, setOperations] = useState<DbOperation[]>([]);

  /**
   * Logga un'operazione nel pannello laterale
   * Mostra la query SQL equivalente che verrebbe eseguita
   */
  const logOperation = useCallback((
    type: 'read' | 'write',
    operation: string,
    query: string,
    column?: string
  ) => {
    const newOp: DbOperation = {
      id: crypto.randomUUID(),
      type,
      operation,
      query,
      timestamp: new Date().toISOString(),
      column,
    };
    setOperations(prev => [newOp, ...prev].slice(0, 20)); // Mantieni solo ultimi 20
  }, []);

  /**
   * LETTURA: Carica i progressi dell'utente
   * 
   * IN SUPABASE:
   * SELECT * FROM user_progress WHERE user_id = auth.uid()
   * 
   * QUI: leggiamo da localStorage filtrando per user_id
   */
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    logOperation(
      'read',
      'SELECT',
      `SELECT * FROM user_progress WHERE user_id = '${user.id.slice(0, 8)}...'`
    );

    await simulateDelay(400);

    try {
      const allProgress = localStorage.getItem(STORAGE_KEY);
      const progressList: UserProgress[] = allProgress ? JSON.parse(allProgress) : [];
      
      let userProgress = progressList.find(p => p.user_id === user.id);

      if (!userProgress) {
        /**
         * SCRITTURA: Crea record iniziale per nuovo utente
         * 
         * IN SUPABASE:
         * INSERT INTO user_progress (user_id) VALUES (auth.uid())
         */
        userProgress = {
          id: crypto.randomUUID(),
          user_id: user.id,
          level: 1,
          xp: 0,
          lessons_completed: 0,
          total_lessons: 10,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        progressList.push(userProgress);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));

        logOperation(
          'write',
          'INSERT',
          `INSERT INTO user_progress (user_id, level, xp) VALUES ('${user.id.slice(0, 8)}...', 1, 0)`
        );
      }

      setProgress(userProgress);
    } catch (error) {
      console.error('Errore caricamento progressi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, logOperation]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  /**
   * SCRITTURA: Aggiunge XP all'utente
   * 
   * IN UN VERO DATABASE:
   * UPDATE user_progress 
   * SET xp = xp + $1, level = CASE WHEN xp >= 100 THEN level + 1 ELSE level END,
   *     updated_at = NOW(), last_activity = NOW()
   * WHERE user_id = auth.uid()
   * 
   * QUI USIAMO localStorage per simulare il comportamento
   */
  const addXp = useCallback(async (amount: number): Promise<void> => {
    if (!progress || !user) return;

    const newXp = progress.xp + amount;
    const levelUps = Math.floor(newXp / XP_PER_LEVEL);
    const newLevel = progress.level + levelUps;
    const remainingXp = newXp % XP_PER_LEVEL;

    logOperation(
      'write',
      'UPDATE',
      `UPDATE user_progress SET xp = ${newXp}, level = ${newLevel}, updated_at = NOW() WHERE user_id = '${user.id.slice(0, 8)}...'`,
      levelUps > 0 ? 'level' : 'xp'
    );

    await simulateDelay(300);

    const allProgress = localStorage.getItem(STORAGE_KEY);
    const progressList: UserProgress[] = allProgress ? JSON.parse(allProgress) : [];
    
    const updatedProgress: UserProgress = {
      ...progress,
      xp: levelUps > 0 ? remainingXp : newXp,
      level: newLevel,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const index = progressList.findIndex(p => p.id === progress.id);
    if (index !== -1) {
      progressList[index] = updatedProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    }

    setProgress(updatedProgress);
  }, [progress, user, logOperation]);

  /**
   * SCRITTURA: Completa una lezione
   * 
   * IN UN VERO DATABASE:
   * UPDATE user_progress 
   * SET lessons_completed = lessons_completed + 1,
   *     xp = xp + 25,
   *     updated_at = NOW(),
   *     last_activity = NOW()
   * WHERE user_id = auth.uid() AND lessons_completed < total_lessons
   * 
   * QUI USIAMO localStorage per simulare il comportamento
   */
  const completeLesson = useCallback(async (): Promise<void> => {
    if (!progress || !user) return;
    if (progress.lessons_completed >= progress.total_lessons) return;

    const newLessons = progress.lessons_completed + 1;
    const xpBonus = 25;
    const newXp = progress.xp + xpBonus;
    const levelUps = Math.floor(newXp / XP_PER_LEVEL);
    const newLevel = progress.level + levelUps;
    const remainingXp = newXp % XP_PER_LEVEL;

    logOperation(
      'write',
      'UPDATE',
      `UPDATE user_progress SET lessons_completed = ${newLessons}, xp = xp + 25 WHERE user_id = '${user.id.slice(0, 8)}...'`,
      'lessons_completed'
    );

    await simulateDelay(350);

    const allProgress = localStorage.getItem(STORAGE_KEY);
    const progressList: UserProgress[] = allProgress ? JSON.parse(allProgress) : [];
    
    const updatedProgress: UserProgress = {
      ...progress,
      lessons_completed: newLessons,
      xp: levelUps > 0 ? remainingXp : newXp,
      level: newLevel,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const index = progressList.findIndex(p => p.id === progress.id);
    if (index !== -1) {
      progressList[index] = updatedProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    }

    setProgress(updatedProgress);
  }, [progress, user, logOperation]);

  /**
   * SCRITTURA: Resetta tutti i progressi
   * 
   * IN UN VERO DATABASE:
   * UPDATE user_progress 
   * SET level = 1, xp = 0, lessons_completed = 0, updated_at = NOW()
   * WHERE user_id = auth.uid()
   * 
   * QUI USIAMO localStorage per simulare il comportamento
   */
  const resetProgress = useCallback(async (): Promise<void> => {
    if (!progress || !user) return;

    logOperation(
      'write',
      'UPDATE',
      `UPDATE user_progress SET level = 1, xp = 0, lessons_completed = 0 WHERE user_id = '${user.id.slice(0, 8)}...'`,
      'level'
    );

    await simulateDelay(400);

    const allProgress = localStorage.getItem(STORAGE_KEY);
    const progressList: UserProgress[] = allProgress ? JSON.parse(allProgress) : [];
    
    const updatedProgress: UserProgress = {
      ...progress,
      level: 1,
      xp: 0,
      lessons_completed: 0,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const index = progressList.findIndex(p => p.id === progress.id);
    if (index !== -1) {
      progressList[index] = updatedProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
    }

    setProgress(updatedProgress);
  }, [progress, user, logOperation]);

  const clearOperations = useCallback(() => {
    setOperations([]);
  }, []);

  return {
    progress,
    isLoading,
    operations,
    addXp,
    completeLesson,
    resetProgress,
    clearOperations,
  };
};
