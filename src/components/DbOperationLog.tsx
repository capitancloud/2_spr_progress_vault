import React from 'react';
import { DbOperation } from '@/hooks/useProgress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Database, ArrowDownToLine, ArrowUpFromLine, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DbOperationLogProps {
  operations: DbOperation[];
  onClear: () => void;
}

export const DbOperationLog: React.FC<DbOperationLogProps> = ({
  operations,
  onClear,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 p-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold">Log Operazioni DB</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Pulisci
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Nessuna operazione registrata
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/70">
              Interagisci con l'app per vedere le query
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {operations.map((op) => (
              <div
                key={op.id}
                className={cn(
                  'log-entry rounded-md border bg-muted/30 p-2',
                  op.type === 'write' ? 'log-write' : 'log-read'
                )}
              >
                <div className="flex items-center gap-2">
                  {op.type === 'write' ? (
                    <ArrowDownToLine className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowUpFromLine className="h-3 w-3 text-info" />
                  )}
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase',
                      op.type === 'write' ? 'text-success' : 'text-info'
                    )}
                  >
                    {op.type === 'write' ? 'SCRITTURA' : 'LETTURA'}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {formatTime(op.timestamp)}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded bg-primary/50 px-1.5 py-0.5 text-[10px] font-medium">
                    {op.operation}
                  </span>
                  {op.column && (
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                      → {op.column}
                    </span>
                  )}
                </div>

                <div className="code-block mt-2 p-2">
                  <code className="text-[10px] leading-relaxed text-muted-foreground font-mono break-all">
                    {op.query}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Legend */}
      <div className="border-t border-border/50 p-2">
        <div className="flex items-center justify-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Scrittura</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-info" />
            <span className="text-muted-foreground">Lettura</span>
          </div>
        </div>
      </div>
    </div>
  );
};
