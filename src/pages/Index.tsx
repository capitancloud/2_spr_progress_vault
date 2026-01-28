import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { ProgressCard } from '@/components/ProgressCard';
import { DbOperationLog } from '@/components/DbOperationLog';
import { DatabaseSimulator } from '@/components/DatabaseSimulator';
import { InfoCard } from '@/components/InfoCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Database,
  Trophy,
  Zap,
  BookOpen,
  Plus,
  CheckCircle,
  RotateCcw,
  LogOut,
  Loader2,
  Code,
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const {
    progress,
    isLoading: progressLoading,
    operations,
    addXp,
    completeLesson,
    resetProgress,
    clearOperations,
  } = useProgress();

  // Redirect se non loggato
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleAddXp = async () => {
    await addXp(10);
    toast.success('+10 XP guadagnati!', {
      description: 'Dati salvati in localStorage',
      icon: <Zap className="h-4 w-4 text-accent" />,
    });
  };

  const handleCompleteLesson = async () => {
    if (progress && progress.lessons_completed >= progress.total_lessons) {
      toast.info('Hai completato tutte le lezioni!');
      return;
    }
    await completeLesson();
    toast.success('Lezione completata! +25 XP', {
      description: 'Progresso aggiornato nel database',
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });
  };

  const handleReset = async () => {
    await resetProgress();
    toast.info('Progressi resettati', {
      description: 'Tutti i dati sono stati azzerati',
      icon: <RotateCcw className="h-4 w-4" />,
    });
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Logout effettuato');
    navigate('/auth', { replace: true });
  };

  if (authLoading || progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-info" />
          <p className="text-sm text-muted-foreground">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  if (!user || !progress) {
    return null;
  }

  const latestOperation = operations[0] || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/20">
              <Database className="h-4 w-4 text-info" />
            </div>
            <h1 className="text-lg font-bold">ProgressVault</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/guida">
              <Button variant="outline" size="sm" className="gap-2 border-border/50">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Guida Codice</span>
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column - Dashboard */}
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold">
                Ciao, <span className="text-gradient-primary">{user.email.split('@')[0]}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ogni azione che fai viene "salvata" nel database simulato
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ProgressCard
                title="Livello"
                value={progress.level}
                subtitle={`${progress.xp}/100 XP per il prossimo`}
                icon={<Trophy className="h-5 w-5" />}
                column="level"
                variant="accent"
                progress={progress.xp}
                maxProgress={100}
              />
              <ProgressCard
                title="Esperienza"
                value={`${progress.xp} XP`}
                subtitle="Guadagna XP completando azioni"
                icon={<Zap className="h-5 w-5" />}
                column="xp"
                variant="info"
              />
              <ProgressCard
                title="Lezioni"
                value={`${progress.lessons_completed}/${progress.total_lessons}`}
                subtitle="Completa tutte le lezioni"
                icon={<BookOpen className="h-5 w-5" />}
                column="lessons_completed"
                variant="success"
                progress={progress.lessons_completed}
                maxProgress={progress.total_lessons}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAddXp}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="h-4 w-4" />
                Guadagna +10 XP
              </Button>
              <Button
                onClick={handleCompleteLesson}
                className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                disabled={progress.lessons_completed >= progress.total_lessons}
              >
                <CheckCircle className="h-4 w-4" />
                Completa Lezione
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Info Card */}
            <InfoCard title="Come funziona la persistenza?">
              <p className="mb-2">
                Ogni volta che clicchi un pulsante, i dati vengono <strong>salvati in localStorage</strong>.
                Questo simula ciò che accadrebbe con un vero database (PostgreSQL/Supabase).
              </p>
              <p>
                Prova a <strong>ricaricare la pagina</strong>: i tuoi progressi saranno ancora lì!
                Questo perché sono <strong>persistenti</strong>, non volatili come le variabili JavaScript.
              </p>
            </InfoCard>

            {/* Database Simulator */}
            <DatabaseSimulator
              progress={progress}
              latestOperation={latestOperation}
            />
          </div>

          {/* Right Column - Operation Log */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
            <DbOperationLog
              operations={operations}
              onClear={clearOperations}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
