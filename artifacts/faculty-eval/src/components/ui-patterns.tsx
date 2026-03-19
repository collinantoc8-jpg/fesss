import { ReactNode } from "react";
import { motion } from "framer-motion";

export function SectionHeader({ title, description, action }: { title: string, description?: string, action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">{title}</h2>
        {description && <p className="text-muted-foreground mt-1 text-lg">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ScoreBadge({ score, maxScore = 5 }: { score: number, maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  
  let colorClass = "bg-green-100 text-green-800 border-green-200";
  if (percentage < 60) colorClass = "bg-red-100 text-red-800 border-red-200";
  else if (percentage < 80) colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
  
  return (
    <div className={`px-3 py-1 rounded-full border font-bold text-sm shadow-sm inline-flex items-center gap-1 ${colorClass}`}>
      {score.toFixed(1)} <span className="text-xs opacity-70 font-normal">/ {maxScore}</span>
    </div>
  );
}

export function ScoreProgressBar({ percentage }: { percentage: number }) {
  let colorClass = "bg-green-500";
  if (percentage < 60) colorClass = "bg-red-500";
  else if (percentage < 80) colorClass = "bg-accent";
  
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${colorClass}`} 
      />
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string, description: string, icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-dashed border-border/60">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-md mt-2">{description}</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
