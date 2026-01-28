import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Lock, Mail, Loader2, Info, ArrowRight } from 'lucide-react';
import { InfoCard } from '@/components/InfoCard';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect se già loggato
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Compila tutti i campi');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Login effettuato!');
      navigate('/', { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Compila tutti i campi');
      return;
    }
    if (password.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Registrazione completata!');
      navigate('/', { replace: true });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-info" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/20 float-animation">
              <Database className="h-8 w-8 text-info" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">ProgressVault</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Impara come funziona la persistenza dei dati
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 gradient-card">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-info hover:bg-info/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Accedi
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Minimo 6 caratteri"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-muted/50 border-border/50"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-success hover:bg-success/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Crea Account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Info Card */}
        <InfoCard title="Cosa succede al login?">
          <p className="mb-2">
            Quando accedi, il sistema cerca il tuo account in <code className="text-info">localStorage</code> 
            (che simula un database) e verifica la password.
          </p>
          <p>
            In un vero sistema, questo avverrebbe su un server con crittografia sicura (bcrypt).
          </p>
        </InfoCard>

        {/* Code Comment */}
        <div className="code-block p-3 text-[10px] font-mono">
          <span className="text-muted-foreground">// IN UN VERO DATABASE:</span>
          <br />
          <span className="text-success">SELECT</span> * <span className="text-success">FROM</span>{' '}
          <span className="text-info">auth.users</span>
          <br />
          <span className="text-success">WHERE</span> email = <span className="text-accent">'tu@esempio.com'</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
