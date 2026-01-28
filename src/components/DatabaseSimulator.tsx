import React, { useState, useEffect } from 'react';
import { UserProgress, DbOperation } from '@/hooks/useProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Monitor, 
  Server, 
  Database, 
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseSimulatorProps {
  progress: UserProgress | null;
  latestOperation: DbOperation | null;
}

interface Particle {
  id: string;
  type: 'read' | 'write';
}

export const DatabaseSimulator: React.FC<DatabaseSimulatorProps> = ({
  progress,
  latestOperation,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);

  // Trigger particle animation when operation occurs
  useEffect(() => {
    if (latestOperation) {
      const newParticle: Particle = {
        id: latestOperation.id,
        type: latestOperation.type,
      };
      
      setParticles(prev => [...prev, newParticle]);
      
      if (latestOperation.column) {
        setHighlightedColumn(latestOperation.column);
      }

      // Remove particle after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1500);

      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedColumn(null);
      }, 2000);
    }
  }, [latestOperation]);

  const columns = [
    { key: 'id', label: 'id', value: progress?.id.slice(0, 8) + '...' || '-' },
    { key: 'user_id', label: 'user_id', value: progress?.user_id.slice(0, 8) + '...' || '-' },
    { key: 'level', label: 'level', value: progress?.level || '-' },
    { key: 'xp', label: 'xp', value: progress?.xp || '-' },
    { key: 'lessons_completed', label: 'lessons_completed', value: progress?.lessons_completed || '-' },
    { key: 'total_lessons', label: 'total_lessons', value: progress?.total_lessons || '-' },
  ];

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-info" />
          Simulatore Database
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Data Flow Diagram */}
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Flusso Dati
          </h4>
          <div className="relative flex items-center justify-between rounded-lg bg-muted/30 p-4">
            {/* Frontend */}
            <div className="diagram-node flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/20">
                <Monitor className="h-6 w-6 text-info" />
              </div>
              <span className="text-[10px] font-medium">Frontend</span>
            </div>

            {/* Arrow 1 */}
            <div className="relative flex-1 mx-2">
              <div className="h-0.5 w-full bg-border" />
              <ArrowRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              
              {/* Particles */}
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full',
                    particle.type === 'write' ? 'bg-success particle-write' : 'bg-info particle-read'
                  )}
                />
              ))}
            </div>

            {/* API */}
            <div className="diagram-node flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Server className="h-6 w-6 text-accent" />
              </div>
              <span className="text-[10px] font-medium">API</span>
            </div>

            {/* Arrow 2 */}
            <div className="relative flex-1 mx-2">
              <div className="h-0.5 w-full bg-border" />
              <ArrowRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              
              {/* Particles */}
              {particles.map(particle => (
                <div
                  key={`${particle.id}-2`}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full',
                    particle.type === 'write' ? 'bg-success particle-write' : 'bg-info particle-read'
                  )}
                  style={{ animationDelay: '0.2s' }}
                />
              ))}
            </div>

            {/* Database */}
            <div className="diagram-node flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
                <Database className="h-6 w-6 text-success" />
              </div>
              <span className="text-[10px] font-medium">Database</span>
            </div>
          </div>
        </div>

        {/* Database Table Visualization */}
        <div className="mb-4">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tabella: user_progress
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="db-table w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-2 py-1.5 text-left text-[10px] font-mono font-medium text-muted-foreground"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'db-cell px-2 py-2 text-xs font-mono',
                        highlightedColumn === col.key && 'db-cell-write shimmer-effect'
                      )}
                    >
                      {col.value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-info" />
            <span className="text-xs font-medium">Legenda Animazioni</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">
                Particelle VERDI → SCRITTURA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-info animate-pulse" />
              <span className="text-muted-foreground">
                Particelle BLU → LETTURA
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <div className="h-2 w-4 rounded bg-success/50" />
              <span className="text-muted-foreground">
                Cella illuminata = colonna appena modificata
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
