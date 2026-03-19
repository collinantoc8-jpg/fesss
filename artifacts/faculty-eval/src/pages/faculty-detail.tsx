import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { Mail, Briefcase, MapPin, Calendar, Award, MessageSquareQuote } from "lucide-react";
import { useFacultyDetailQuery } from "@/hooks/use-faculty";
import { useFacultyResultDetailQuery } from "@/hooks/use-results";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { LoadingSpinner, ScoreBadge, ScoreProgressBar, EmptyState } from "@/components/ui-patterns";

export default function FacultyDetail() {
  const [, params] = useRoute("/faculty/:id");
  const id = parseInt(params?.id || "0");

  const { data: faculty, isLoading: facultyLoading, error: facultyError } = useFacultyDetailQuery(id);
  const { data: results, isLoading: resultsLoading } = useFacultyResultDetailQuery(id);

  if (facultyLoading || resultsLoading) return <LoadingSpinner />;
  if (facultyError || !faculty) return <div className="p-8 text-center text-red-500">Faculty member not found.</div>;

  const chartData = results?.criteriaScores.map(c => ({
    subject: c.criterionName,
    A: c.averageScore,
    fullMark: c.maxScore,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-card rounded-3xl p-6 md:p-10 shadow-lg border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-0"></div>
        
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center text-5xl font-display font-bold shadow-md shrink-0">
            {faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground">{faculty.name}</h1>
                <p className="text-xl text-primary mt-1">{faculty.position}</p>
              </div>
              
              <Link 
                href={`/evaluate?facultyId=${faculty.id}`}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2 w-fit"
              >
                <Award size={18} /> Evaluate
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-muted rounded-lg"><MapPin size={18} /></div>
                <span>{faculty.department} Department</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-muted rounded-lg"><Mail size={18} /></div>
                <span>{faculty.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-muted rounded-lg"><Calendar size={18} /></div>
                <span>Joined {format(new Date(faculty.createdAt), 'MMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {!results ? (
        <EmptyState 
          icon={<Award size={32} />} 
          title="No evaluations yet" 
          description="Be the first to submit an evaluation for this faculty member." 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats & Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center">
                <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                <div className="text-4xl font-display font-bold text-primary">{results.overallPercentage.toFixed(1)}%</div>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Evaluations</p>
                <div className="text-4xl font-display font-bold text-foreground">{results.totalEvaluations}</div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-6">Criteria Breakdown</h3>
              <div className="space-y-6">
                {results.criteriaScores.map(score => (
                  <div key={score.criterionId}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{score.criterionName}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{score.category}</p>
                      </div>
                      <ScoreBadge score={score.averageScore} maxScore={score.maxScore} />
                    </div>
                    <ScoreProgressBar percentage={(score.averageScore / score.maxScore) * 100} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comments */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquareQuote className="text-primary"/> Recent Feedback</h3>
              {results.recentComments.length > 0 ? (
                <div className="space-y-4">
                  {results.recentComments.map((comment, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-xl border border-border/50 text-foreground/80 italic">
                      "{comment}"
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No comments available.</p>
              )}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-center">Performance Radar</h3>
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                  <Radar name="Score" dataKey="A" stroke="#1E3A8A" fill="#3B82F6" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
