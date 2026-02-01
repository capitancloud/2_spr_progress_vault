import React, { useState } from 'react';
import { useAccessCode } from '@/hooks/useAccessCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Key, Loader2, Lock, Eye, EyeOff } from 'lucide-react';


const AccessGate: React.FC = () => {
  const { verifyCode, isLoading: accessLoading } = useAccessCode();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Inserisci il codice di accesso');
      return;
    }

    setIsLoading(true);
    const { success, error } = await verifyCode(code);
    setIsLoading(false);

    if (success) {
      toast.success('Accesso concesso! Benvenuto in ProgressVault');
    } else {
      toast.error(error || 'Codice non valido');
    }
  };

  if (accessLoading) {
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/20 float-animation">
              <Shield className="h-8 w-8 text-warning" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">ProgressVault</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inserisci il codice di accesso per continuare
          </p>
        </div>

        {/* Access Card */}
        <Card className="border-border/50 gradient-card">
          <CardHeader className="pb-4 text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Lock className="h-5 w-5 text-warning" />
              Area Protetta
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Questa app richiede un codice speciale per l'accesso
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-sm flex items-center gap-2">
                  <Key className="h-4 w-4 text-warning" />
                  Codice di Accesso
                </Label>
                <div className="relative">
                  <Input
                    id="access-code"
                    type={showCode ? "text" : "password"}
                    placeholder="Inserisci il codice segreto..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pr-10 bg-muted/50 border-border/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Verifica Codice
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessGate;
