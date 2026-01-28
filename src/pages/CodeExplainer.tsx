import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Database,
  Layers,
  Lock,
  RefreshCw,
  Shield,
  Zap,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Monitor,
  Server,
  Code,
  User,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Architecture layers data
const architectureLayers = [
  {
    id: 'ui',
    name: 'UI (React)',
    icon: Monitor,
    color: 'info',
    description: 'Componenti visivi che l\'utente vede e con cui interagisce. Gestisce lo stato locale e renderizza i dati.',
    files: ['pages/Index.tsx', 'components/ProgressCard.tsx'],
  },
  {
    id: 'hooks',
    name: 'Hooks (Logica)',
    icon: Code,
    color: 'accent',
    description: 'Contengono la logica di business. Gestiscono lo stato globale, chiamano le API e trasformano i dati.',
    files: ['hooks/useProgress.tsx', 'hooks/useAuth.tsx'],
  },
  {
    id: 'client',
    name: 'Client (localStorage)',
    icon: Server,
    color: 'warning',
    description: 'Simula le chiamate API. In produzione sarebbe il client Supabase che parla con il server.',
    files: ['localStorage API', 'Simulated delay'],
  },
  {
    id: 'database',
    name: 'Database (Storage)',
    icon: Database,
    color: 'success',
    description: 'Dove i dati sono persistiti. Qui usiamo localStorage, in produzione sarebbe PostgreSQL.',
    files: ['localStorage', 'progressvault_data'],
  },
];

// Auth flow steps
const authFlowSteps = [
  { id: 1, title: 'Input Credenziali', description: 'Utente inserisce email e password nel form' },
  { id: 2, title: 'Validazione', description: 'Controllo lato client: email valida, password ≥6 caratteri' },
  { id: 3, title: 'Hash Password', description: 'Password convertita con btoa() (in produzione: bcrypt)' },
  { id: 4, title: 'Query Database', description: 'Cerca utente con email corrispondente' },
  { id: 5, title: 'Crea Sessione', description: 'Salva token in localStorage, aggiorna stato React' },
];

// CRUD operations
const crudOperations = [
  {
    id: 'create',
    name: 'Create',
    color: 'success',
    sql: `INSERT INTO user_progress (user_id, level, xp)
VALUES (auth.uid(), 1, 0)
RETURNING *;`,
    js: `const newProgress = {
  id: crypto.randomUUID(),
  user_id: user.id,
  level: 1,
  xp: 0
};
localStorage.setItem(KEY, JSON.stringify([...list, newProgress]));`,
  },
  {
    id: 'read',
    name: 'Read',
    color: 'info',
    sql: `SELECT * FROM user_progress
WHERE user_id = auth.uid();`,
    js: `const allData = JSON.parse(localStorage.getItem(KEY) || '[]');
const userProgress = allData.find(p => p.user_id === user.id);`,
  },
  {
    id: 'update',
    name: 'Update',
    color: 'accent',
    sql: `UPDATE user_progress
SET xp = xp + 10, updated_at = NOW()
WHERE user_id = auth.uid();`,
    js: `const index = list.findIndex(p => p.user_id === user.id);
list[index] = { ...list[index], xp: list[index].xp + 10 };
localStorage.setItem(KEY, JSON.stringify(list));`,
  },
  {
    id: 'delete',
    name: 'Delete',
    color: 'destructive',
    sql: `DELETE FROM user_progress
WHERE user_id = auth.uid();`,
    js: `const filtered = list.filter(p => p.user_id !== user.id);
localStorage.setItem(KEY, JSON.stringify(filtered));`,
  },
];

// XP flow steps
const xpFlowSteps = [
  { step: 1, action: 'Click', description: 'Utente clicca "Guadagna +10 XP"' },
  { step: 2, action: 'Hook', description: 'useProgress.addXp(10) chiamato' },
  { step: 3, action: 'Validazione', description: 'Verifica utente loggato (simula RLS)' },
  { step: 4, action: 'Calcolo', description: 'Nuovo XP = attuale + 10, check level up' },
  { step: 5, action: 'Query', description: 'UPDATE user_progress SET xp = ...' },
  { step: 6, action: 'Risposta', description: 'Dati aggiornati ritornati' },
  { step: 7, action: 'Re-render', description: 'React aggiorna UI con nuovi valori' },
];

const CodeExplainer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUser, setSelectedUser] = useState('user-a');
  const [selectedRow, setSelectedRow] = useState('row-a');
  const [rlsResult, setRlsResult] = useState<boolean | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const checkRls = () => {
    // Simula RLS: accesso consentito solo se user e row appartengono allo stesso utente
    const hasAccess = selectedUser === selectedRow;
    setRlsResult(hasAccess);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-info" />
            <h1 className="text-lg font-bold">Guida al Codice</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-12">
        {/* Section 1: Architecture */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-info" />
              1. Architettura dell'App
            </h2>
            <p className="mt-2 text-muted-foreground">
              Passa il mouse sui livelli per vedere i dettagli. I dati fluiscono dall'alto verso il basso (scrittura) e dal basso verso l'alto (lettura).
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                {architectureLayers.map((layer, index) => (
                  <div key={layer.id}>
                    <div
                      className={cn(
                        'diagram-node flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all',
                        hoveredLayer === layer.id
                          ? 'border-info bg-info/10 scale-[1.02]'
                          : 'border-border/50 bg-card'
                      )}
                      onMouseEnter={() => setHoveredLayer(layer.id)}
                      onMouseLeave={() => setHoveredLayer(null)}
                    >
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        layer.color === 'info' && 'bg-info/20',
                        layer.color === 'accent' && 'bg-accent/20',
                        layer.color === 'warning' && 'bg-warning/20',
                        layer.color === 'success' && 'bg-success/20',
                      )}>
                        <layer.icon className={cn(
                          'h-6 w-6',
                          layer.color === 'info' && 'text-info',
                          layer.color === 'accent' && 'text-accent',
                          layer.color === 'warning' && 'text-warning',
                          layer.color === 'success' && 'text-success',
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{layer.name}</h3>
                        {hoveredLayer === layer.id && (
                          <div className="mt-2 animate-fade-in">
                            <p className="text-sm text-muted-foreground">{layer.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {layer.files.map(file => (
                                <code key={file} className="rounded bg-muted px-2 py-0.5 text-xs">
                                  {file}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < architectureLayers.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Authentication */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6 text-accent" />
              2. Flusso Autenticazione
            </h2>
            <p className="mt-2 text-muted-foreground">
              Clicca su ogni step per vedere i dettagli del processo di login.
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {authFlowSteps.map((step, index) => (
                  <Button
                    key={step.id}
                    variant={activeStep === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      'gap-2',
                      activeStep === index && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-xs">
                      {step.id}
                    </span>
                    {step.title}
                  </Button>
                ))}
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 animate-scale-in">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                    {authFlowSteps[activeStep].id}
                  </div>
                  <div>
                    <h4 className="font-semibold">{authFlowSteps[activeStep].title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {authFlowSteps[activeStep].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password hashing explanation */}
              <div className="mt-4 code-block p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  // Simulazione hashing (NON sicuro per produzione!)
                </p>
                <code className="text-sm font-mono">
                  <span className="text-success">const</span> hash = <span className="text-info">btoa</span>(password + '_salt');
                </code>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  In produzione: Supabase usa bcrypt con salt randomico
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: CRUD Operations */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-success" />
              3. Operazioni CRUD
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create, Read, Update, Delete - le 4 operazioni fondamentali su un database.
            </p>
          </div>

          <Card className="border-border/50">
            <Tabs defaultValue="create">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-4">
                  {crudOperations.map(op => (
                    <TabsTrigger key={op.id} value={op.id}>
                      {op.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                {crudOperations.map(op => (
                  <TabsContent key={op.id} value={op.id} className="space-y-4 mt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Database className="h-4 w-4 text-info" />
                          SQL (PostgreSQL)
                        </h4>
                        <div className="code-block p-3">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {op.sql}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Code className="h-4 w-4 text-accent" />
                          JavaScript (localStorage)
                        </h4>
                        <div className="code-block p-3">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {op.js}
                          </pre>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <div className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium',
                        op.color === 'success' && 'bg-success/20 text-success',
                        op.color === 'info' && 'bg-info/20 text-info',
                        op.color === 'accent' && 'bg-accent/20 text-accent',
                        op.color === 'destructive' && 'bg-destructive/20 text-destructive',
                      )}>
                        ← Direzione dati →
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </CardContent>
            </Tabs>
          </Card>
        </section>

        {/* Section 4: RLS Simulator */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-destructive" />
              4. Row Level Security (RLS)
            </h2>
            <p className="mt-2 text-muted-foreground">
              Simula come PostgreSQL protegge i dati: ogni utente può accedere solo alle proprie righe.
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Utente Loggato (auth.uid())
                  </label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user-a">Utente A (abc123...)</SelectItem>
                      <SelectItem value="user-b">Utente B (xyz789...)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Riga Database (user_id)
                  </label>
                  <Select value={selectedRow} onValueChange={setSelectedRow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row-a">Riga di Utente A</SelectItem>
                      <SelectItem value="row-b">Riga di Utente B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={checkRls} className="gap-2 bg-info hover:bg-info/90">
                  <Shield className="h-4 w-4" />
                  Verifica Accesso
                </Button>
              </div>

              {rlsResult !== null && (
                <div className={cn(
                  'rounded-lg border p-4 text-center animate-scale-in',
                  rlsResult 
                    ? 'border-success/50 bg-success/10'
                    : 'border-destructive/50 bg-destructive/10'
                )}>
                  <div className="flex justify-center mb-2">
                    {rlsResult ? (
                      <Check className="h-8 w-8 text-success" />
                    ) : (
                      <X className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                  <h4 className={cn(
                    'font-bold',
                    rlsResult ? 'text-success' : 'text-destructive'
                  )}>
                    {rlsResult ? 'ACCESSO CONSENTITO' : 'ACCESSO NEGATO'}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rlsResult 
                      ? 'auth.uid() = user_id → Policy soddisfatta'
                      : 'auth.uid() ≠ user_id → Violazione RLS'}
                  </p>
                </div>
              )}

              <div className="code-block p-3">
                <p className="text-xs text-muted-foreground mb-2">-- Policy RLS</p>
                <code className="text-xs font-mono">
                  <span className="text-success">CREATE POLICY</span> "users_own_data"<br/>
                  <span className="text-success">ON</span> user_progress<br/>
                  <span className="text-success">USING</span> (<span className="text-info">auth.uid()</span> = user_id);
                </code>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: XP Flow */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-accent" />
              5. Flusso Completo XP
            </h2>
            <p className="mt-2 text-muted-foreground">
              Segui il percorso di un click dal browser al database e ritorno.
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                {xpFlowSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                        index < 4 
                          ? 'bg-success/20 text-success' 
                          : 'bg-info/20 text-info'
                      )}>
                        {step.step}
                      </div>
                      {index < xpFlowSteps.length - 1 && (
                        <div className={cn(
                          'w-0.5 h-8 mt-2',
                          index < 3 ? 'bg-success/30' : 'bg-info/30'
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          index < 4 
                            ? 'bg-success/20 text-success' 
                            : 'bg-info/20 text-info'
                        )}>
                          {step.action}
                        </span>
                        {index === 3 && (
                          <ArrowRight className="h-4 w-4 text-success" />
                        )}
                        {index === 5 && (
                          <ArrowLeft className="h-4 w-4 text-info" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Tempo totale simulato</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ~300ms (in produzione dipende dalla latenza di rete verso il database)
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default CodeExplainer;
