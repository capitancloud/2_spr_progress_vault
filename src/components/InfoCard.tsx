import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20">
            <Lightbulb className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-accent">{title}</h4>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
