import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useFacultyQuery } from "@/hooks/use-faculty";
import { useResultsQuery } from "@/hooks/use-results";
import { SectionHeader, ScoreBadge, LoadingSpinner, EmptyState } from "@/components/ui-patterns";

export default function FacultyList() {
  const { data: faculty, isLoading: facultyLoading } = useFacultyQuery();
  const { data: results, isLoading: resultsLoading } = useResultsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const isLoading = facultyLoading || resultsLoading;

  const departments = faculty 
    ? ["All", ...Array.from(new Set(faculty.map(f => f.department)))]
    : ["All"];

  const filteredFaculty = faculty?.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All" || f.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Faculty Directory" 
        description="Browse and search all university faculty members"
      />

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[200px]"
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredFaculty?.length === 0 ? (
        <EmptyState 
          icon={<GraduationCap size={32} />} 
          title="No faculty found" 
          description="Try adjusting your search or filters to find what you're looking for." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFaculty?.map((person) => {
            const res = results?.find(r => r.facultyId === person.id);
            
            return (
              <Link key={person.id} href={`/faculty/${person.id}`} className="group">
                <div className="bg-card h-full border border-border p-6 rounded-2xl shadow-sm hover-lift flex flex-col items-center text-center relative">
                  {/* Score Badge positioned absolutely */}
                  {res && (
                    <div className="absolute top-4 right-4">
                      <ScoreBadge score={res.averageScore} />
                    </div>
                  )}
                  
                  {/* Generic Avatar */}
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {person.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{person.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <MapPin size={14} /> {person.department}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-secondary-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    <Briefcase size={14} /> {person.position}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
