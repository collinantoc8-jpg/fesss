import { useState } from "react";
import { Link } from "wouter";
import { Trophy, Search, ChevronRight, CalendarDays, BookOpen } from "lucide-react";
import { useResultsQuery, useAcademicYearsQuery } from "@/hooks/use-results";
import { SectionHeader, LoadingSpinner, ScoreProgressBar, EmptyState } from "@/components/ui-patterns";
import { motion } from "framer-motion";

const SEMESTERS = ["1st Semester", "2nd Semester", "Summer"];

export default function Results() {
  const { data: availableYears, isLoading: yearsLoading } = useAcademicYearsQuery();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: results, isLoading: resultsLoading } = useResultsQuery({
    academicYear: selectedYear !== "all" ? selectedYear : undefined,
    semester: selectedSemester !== "all" ? selectedSemester : undefined,
  });

  const isLoading = yearsLoading || resultsLoading;

  const filteredResults = results
    ?.filter(r =>
      r.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.overallPercentage - a.overallPercentage);

  const periodLabel =
    selectedYear !== "all" && selectedSemester !== "all"
      ? `${selectedSemester}, ${selectedYear}`
      : selectedYear !== "all"
      ? selectedYear
      : selectedSemester !== "all"
      ? `${selectedSemester} (All Years)`
      : "All Periods";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Evaluation Results"
        description="Ranked faculty performance across the institution"
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
          <CalendarDays size={16} />
          <span>Filter by Period</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* School Year */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">School Year</label>
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); }}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All School Years</option>
              {availableYears?.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* Semester */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active period badge */}
        <div className="flex items-center gap-2 pt-1">
          <BookOpen size={14} className="text-primary" />
          <span className="text-xs text-primary font-semibold">Showing: {periodLabel}</span>
          {(selectedYear !== "all" || selectedSemester !== "all") && (
            <button
              onClick={() => { setSelectedYear("all"); setSelectedSemester("all"); }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search by faculty name or department..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !filteredResults || filteredResults.length === 0 ? (
        <EmptyState
          icon={<Trophy size={32} />}
          title="No results found"
          description={
            selectedYear !== "all" || selectedSemester !== "all"
              ? `No evaluations recorded for ${periodLabel}. Try a different period.`
              : "There are no evaluation results matching your search criteria."
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              {filteredResults.length} faculty member{filteredResults.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm text-muted-foreground">
              {filteredResults.reduce((sum, r) => sum + r.totalEvaluations, 0)} total evaluation{filteredResults.reduce((sum, r) => sum + r.totalEvaluations, 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredResults.map((result, index) => (
            <motion.div
              key={`${result.facultyId}-${selectedYear}-${selectedSemester}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/faculty/${result.facultyId}`} className="block group">
                <div className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6 hover:border-primary/30 transition-colors">

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
                    <p className="text-sm text-muted-foreground">{result.department} · {result.position}</p>

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
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                      <div className="font-bold text-primary">{result.averageScore.toFixed(2)}</div>
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
