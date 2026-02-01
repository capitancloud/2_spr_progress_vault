import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AccessCodeProvider, useAccessCode } from "@/hooks/useAccessCode";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AccessGate from "./pages/AccessGate";
import CodeExplainer from "./pages/CodeExplainer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * COMPONENTE CHE GESTISCE L'ACCESSO
 * 
 * Verifica se l'utente ha inserito il codice di accesso corretto.
 * Se sì, mostra l'app normale con il sistema di auth.
 * Se no, mostra la schermata di inserimento codice.
 */
const AccessGateWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasAccess, isLoading } = useAccessCode();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-info border-t-transparent" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessGate />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessCodeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <AccessGateWrapper>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/guida" element={<CodeExplainer />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AccessGateWrapper>
        </TooltipProvider>
      </AuthProvider>
    </AccessCodeProvider>
  </QueryClientProvider>
);

export default App;
