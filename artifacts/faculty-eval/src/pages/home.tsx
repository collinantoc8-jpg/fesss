import { Link } from "wouter";
import { Users, FileText, Star, ArrowRight } from "lucide-react";
import { useFacultyQuery } from "@/hooks/use-faculty";
import { useResultsQuery } from "@/hooks/use-results";
import { SectionHeader, LoadingSpinner } from "@/components/ui-patterns";

export default function Home() {
  const { data: faculty, isLoading: facultyLoading } = useFacultyQuery();
  const { data: results, isLoading: resultsLoading } = useResultsQuery();

  const isLoading = facultyLoading || resultsLoading;

  const totalEvaluations = results?.reduce((acc, curr) => acc + curr.totalEvaluations, 0) || 0;
  const avgOverallScore = results && results.length > 0 
    ? results.reduce((acc, curr) => acc + curr.overallPercentage, 0) / results.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-primary">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="University Campus" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 p-8 md:p-12 lg:p-16 text-white">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Academic Excellence Through Feedback
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl text-lg mb-8">
            Welcome to the centralized Faculty Evaluation System. Contribute to our institution's growth by participating in the current evaluation cycle.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/evaluate" 
              className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              Start Evaluation <ArrowRight size={18} />
            </Link>
            <Link 
              href="/results" 
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
            >
              View Results
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<Users className="text-blue-500" size={24} />} 
              title="Total Faculty" 
              value={faculty?.length.toString() || "0"} 
              trend="+2 this semester"
            />
            <StatCard 
              icon={<FileText className="text-purple-500" size={24} />} 
              title="Evaluations Submitted" 
              value={totalEvaluations.toString()} 
              trend="Active cycle"
            />
            <StatCard 
              icon={<Star className="text-amber-500" size={24} />} 
              title="Institution Average" 
              value={`${avgOverallScore.toFixed(1)}%`} 
              trend="Based on all criteria"
            />
          </div>

          {/* Quick Access / Top Performers */}
          <div className="mt-12">
            <SectionHeader title="Top Performing Faculty" description="Faculty members with highest overall satisfaction" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results?.sort((a, b) => b.overallPercentage - a.overallPercentage).slice(0, 3).map((res) => (
                <Link key={res.facultyId} href={`/faculty/${res.facultyId}`} className="group block">
                  <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover-lift relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{res.facultyName}</h3>
                        <p className="text-sm text-muted-foreground">{res.department}</p>
                      </div>
                      <div className="bg-accent/20 text-accent-foreground font-bold px-3 py-1 rounded-full text-sm">
                        {res.overallPercentage.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText size={14} /> {res.totalEvaluations} reviews
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-start gap-4">
      <div className="p-3 bg-muted rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-display font-bold text-foreground mt-1">{value}</h3>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </div>
    </div>
  );
}
