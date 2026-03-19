import { useState } from "react";
import { Link } from "wouter";
import { Trophy, Search, ChevronRight } from "lucide-react";
import { useResultsQuery } from "@/hooks/use-results";
import { SectionHeader, LoadingSpinner, ScoreProgressBar, EmptyState } from "@/components/ui-patterns";
import { motion } from "framer-motion";

export default function Results() {
  const { data: results, isLoading } = useResultsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = results?.filter(r => 
    r.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.overallPercentage - a.overallPercentage);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Evaluation Results" 
        description="Ranked overview of faculty performance across the institution"
      />

      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by faculty name or department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !filteredResults || filteredResults.length === 0 ? (
        <EmptyState 
          icon={<Trophy size={32} />} 
          title="No results found" 
          description="There are no evaluation results matching your search criteria." 
        />
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result, index) => (
            <motion.div 
              key={result.facultyId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/faculty/${result.facultyId}`} className="block group">
                <div className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm hover-lift flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-xl
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm' : 
                      index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                      index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                    #{index + 1}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{result.facultyName}</h3>
                    <p className="text-sm text-muted-foreground">{result.department} • {result.position}</p>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1">
                        <ScoreProgressBar percentage={result.overallPercentage} />
                      </div>
                      <div className="font-bold text-right min-w-[60px]">
                        {result.overallPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="shrink-0 flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center md:justify-end">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Evals</div>
                      <div className="font-bold">{result.totalEvaluations}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-bold text-primary">{result.averageScore.toFixed(2)}/5</div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors hidden md:block" />
                  </div>
                  
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
