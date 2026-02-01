import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessCode } from '@/hooks/useAccessCode';
import { useProgress } from '@/hooks/useProgress';
import { ProgressCard } from '@/components/ProgressCard';
import { DbOperationLog } from '@/components/DbOperationLog';
import { DatabaseSimulator } from '@/components/DatabaseSimulator';
import { ConceptCard } from '@/components/ConceptCard';
import { StepByStepGuide } from '@/components/StepByStepGuide';
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
  HardDrive,
  RefreshCw,
  Shield,
  Lightbulb,
  KeyRound,
} from 'lucide-react';

const whatHappensSteps = [
  {
    title: '1. Clicchi il pulsante',
    description: 'Tu premi "Guadagna +10 XP". Questo crea un evento nel browser, come premere un interruttore della luce.',
    tip: 'Ogni click genera un "evento" che il codice JavaScript può intercettare.',
  },
  {
    title: '2. Il codice riceve l\'evento',
    description: 'Una funzione JavaScript chiamata "handleAddXp" viene eseguita. È come un cameriere che riceve il tuo ordine.',
    codeExample: 'const handleAddXp = async () => {\n  await addXp(10);\n};',
  },
  {
    title: '3. Prepariamo i nuovi dati',
    description: 'Leggiamo i tuoi XP attuali, aggiungiamo 10, e creiamo un nuovo oggetto con i dati aggiornati.',
    codeExample: 'const nuovoXP = vecchioXP + 10;\n// Es: 30 + 10 = 40',
  },
  {
    title: '4. Salviamo nel "database"',
    description: 'I nuovi dati vengono salvati in localStorage (il nostro database simulato). È come scrivere su un foglio di carta e metterlo in un cassetto.',
    codeExample: 'localStorage.setItem("chiave", dati);',
  },
  {
    title: '5. L\'interfaccia si aggiorna',
    description: 'React "vede" che i dati sono cambiati e ridisegna automaticamente la pagina con i nuovi valori. Magia! ✨',
    tip: 'Questo si chiama "re-rendering" ed è il superpotere di React.',
  },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { revokeAccess } = useAccessCode();
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
      description: 'I dati sono stati salvati! Guarda il log a destra →',
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
      description: 'Sia le lezioni che gli XP sono stati aggiornati',
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });
  };

  const handleReset = async () => {
    await resetProgress();
    toast.info('Progressi resettati', {
      description: 'Tutti i dati sono stati azzerati nel database',
      icon: <RotateCcw className="h-4 w-4" />,
    });
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Logout effettuato');
    navigate('/auth', { replace: true });
  };

  const handleRevokeAccess = () => {
    signOut(); // Prima logout dall'account
    revokeAccess(); // Poi revoca l'accesso con codice
    toast.success('Accesso revocato. Dovrai reinserire il codice.');
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevokeAccess}
              className="gap-2 text-warning hover:text-warning hover:bg-warning/10"
              title="Esci completamente e torna alla schermata del codice di accesso"
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Revoca Accesso</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column - Dashboard */}
          <div className="space-y-6">
            {/* Welcome Message con spiegazione */}
            <div className="animate-fade-in space-y-3">
              <div>
                <h2 className="text-2xl font-bold">
                  Ciao, <span className="text-gradient-primary">{user.email.split('@')[0]}</span>! 👋
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Benvenuto nel tuo laboratorio di apprendimento sulla persistenza dei dati
                </p>
              </div>
              
              {/* Intro box per principianti */}
              <div className="rounded-xl border-2 border-dashed border-info/30 bg-info/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/20">
                    <Lightbulb className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-info">🎯 Cosa imparerai qui?</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Questa app ti mostra <strong>come i siti web salvano i tuoi dati</strong>. 
                      Quando guadagni XP o completi lezioni, quei numeri vengono salvati in modo che 
                      non spariscano quando chiudi il browser. È la stessa magia che usa Netflix per 
                      ricordare dove hai interrotto un film! 🎬
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards con spiegazioni migliorate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">📊 I tuoi dati salvati</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success">
                  Persistenti nel browser
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <ProgressCard
                  title="Livello"
                  value={progress.level}
                  subtitle={`${progress.xp}/100 XP per salire di livello`}
                  icon={<Trophy className="h-5 w-5" />}
                  column="level"
                  variant="accent"
                  progress={progress.xp}
                  maxProgress={100}
                  explanation="Il tuo livello aumenta ogni 100 XP. Ogni volta che sali di livello, questo numero viene aggiornato nel database."
                />
                <ProgressCard
                  title="Punti Esperienza"
                  value={`${progress.xp} XP`}
                  subtitle="Ogni azione ti dà punti!"
                  icon={<Zap className="h-5 w-5" />}
                  column="xp"
                  variant="info"
                  explanation="Gli XP sono come i punti in un videogioco. Ogni volta che ne guadagni, il numero viene SCRITTO nel database."
                />
                <ProgressCard
                  title="Lezioni"
                  value={`${progress.lessons_completed}/${progress.total_lessons}`}
                  subtitle="Completa tutte le lezioni!"
                  icon={<BookOpen className="h-5 w-5" />}
                  column="lessons_completed"
                  variant="success"
                  progress={progress.lessons_completed}
                  maxProgress={progress.total_lessons}
                  explanation="Conta quante lezioni hai completato. Questo dato viene salvato per tenere traccia dei tuoi progressi."
                />
              </div>
            </div>

            {/* Action Buttons con spiegazioni */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                🎮 Prova questi pulsanti e guarda cosa succede nel log →
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={handleAddXp}
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4" />
                    Guadagna +10 XP
                  </Button>
                  <span className="text-[10px] text-center text-muted-foreground">
                    Scrive: UPDATE xp
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={handleCompleteLesson}
                    className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                    disabled={progress.lessons_completed >= progress.total_lessons}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Completa Lezione
                  </Button>
                  <span className="text-[10px] text-center text-muted-foreground">
                    Scrive: UPDATE lessons + xp
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  <span className="text-[10px] text-center text-muted-foreground">
                    Scrive: UPDATE tutto a 0
                  </span>
                </div>
              </div>
            </div>

            {/* Concept Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <ConceptCard
                icon={<HardDrive className="h-5 w-5" />}
                title="Cos'è un Database?"
                shortExplanation="È come un grande schedario digitale dove i siti web salvano le tue informazioni in modo organizzato."
                fullExplanation="Un database è un sistema per memorizzare e organizzare dati. Invece di salvare tutto in un unico file, i dati vengono organizzati in 'tabelle' (come fogli Excel) con righe e colonne. Ogni riga è un 'record' (es: un utente), ogni colonna è un 'campo' (es: nome, email, XP)."
                realWorldExample="Pensa alla rubrica del telefono: ogni contatto è una 'riga' con campi come nome, numero, email. Il database di un social network funziona allo stesso modo, ma con milioni di utenti!"
                variant="info"
              />
              <ConceptCard
                icon={<RefreshCw className="h-5 w-5" />}
                title="Cos'è la Persistenza?"
                shortExplanation="È la capacità di ricordare i dati anche dopo aver chiuso il browser. Senza persistenza, tutto sparirebbe!"
                fullExplanation="La persistenza significa che i dati sopravvivono alla chiusura dell'applicazione. Una variabile JavaScript normale scompare quando ricarichi la pagina. I dati persistenti invece rimangono salvati (nel browser con localStorage, o su un server con un database reale)."
                realWorldExample="È come la differenza tra scrivere su una lavagna (si cancella) e scrivere su un quaderno (rimane). I tuoi progressi in un videogioco sono persistenti: puoi spegnere la console e ritrovarli!"
                variant="success"
              />
            </div>

            {/* Step by Step Guide */}
            <StepByStepGuide
              title="🔍 Cosa succede quando clicchi un pulsante?"
              description="Segui il viaggio dei tuoi dati dal click al salvataggio"
              steps={whatHappensSteps}
              variant="accent"
            />

            {/* Database Simulator */}
            <DatabaseSimulator
              progress={progress}
              latestOperation={latestOperation}
            />

            {/* Prova importante */}
            <ConceptCard
              icon={<Shield className="h-5 w-5" />}
              title="🧪 Prova Tu! Esperimento sulla Persistenza"
              shortExplanation="Vuoi vedere la magia in azione? Guadagna qualche XP, poi RICARICA LA PAGINA (F5). I tuoi progressi saranno ancora lì!"
              fullExplanation="Questo dimostra che localStorage funziona davvero come un database. I dati non sono solo nella memoria temporanea del browser, ma sono scritti su disco. Anche se chiudi completamente il browser e lo riapri, troverai i tuoi XP!"
              realWorldExample="È esattamente come quando accedi a Instagram dopo giorni: i tuoi follower, like e post sono tutti ancora lì perché sono salvati nei server di Instagram (un database gigante!)."
              variant="accent"
              defaultExpanded={true}
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
