import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useFacultyQuery } from "@/hooks/use-faculty";
import { useCriteriaQuery } from "@/hooks/use-criteria";
import { useSubmitEvaluationMutation } from "@/hooks/use-evaluations";
import { SectionHeader, LoadingSpinner } from "@/components/ui-patterns";
import { CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

type Role = "student" | "peer" | "admin";

export default function Evaluate() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialFacultyId = searchParams.get("facultyId");

  const { data: facultyList, isLoading: facultyLoading } = useFacultyQuery();
  const { data: criteriaList, isLoading: criteriaLoading } = useCriteriaQuery();
  const { mutateAsync: submitEvaluation, isPending } = useSubmitEvaluationMutation();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [facultyId, setFacultyId] = useState<string>(initialFacultyId || "");
  const [evaluatorName, setEvaluatorName] = useState("");
  const [evaluatorRole, setEvaluatorRole] = useState<Role>("student");
  const [semester, setSemester] = useState("Fall");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  
  // Criteria scores mapping: criterionId -> score
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comments, setComments] = useState("");

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!facultyId || !evaluatorName || !academicYear) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 2) {
      if (criteriaList && Object.keys(scores).length < criteriaList.length) {
        setError("Please rate all criteria before proceeding.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      await submitEvaluation({
        data: {
          facultyId: parseInt(facultyId),
          evaluatorName,
          evaluatorRole,
          semester,
          academicYear,
          comments: comments || undefined,
          scores: Object.entries(scores).map(([id, score]) => ({
            criterionId: parseInt(id),
            score,
          })),
        }
      });
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message || "Failed to submit evaluation");
    }
  };

  if (facultyLoading || criteriaLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SectionHeader title="Evaluate Faculty" description="Provide your honest and constructive feedback" />

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map(num => (
          <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
            step >= num ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'
          }`}>
            {step > num || num === 4 && step === 4 ? <CheckCircle2 size={20} /> : num}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border shadow-lg rounded-3xl p-6 md:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-bold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Faculty *</label>
                <select 
                  value={facultyId} 
                  onChange={e => setFacultyId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose a faculty member --</option>
                  {facultyList?.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your Name *</label>
                <input 
                  type="text" 
                  value={evaluatorName}
                  onChange={e => setEvaluatorName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Your Role</label>
                  <select 
                    value={evaluatorRole} 
                    onChange={e => setEvaluatorRole(e.target.value as Role)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="student">Student</option>
                    <option value="peer">Peer / Colleague</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Semester</label>
                    <select 
                      value={semester} 
                      onChange={e => setSemester(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Year *</label>
                    <input 
                      type="text" 
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button onClick={handleNext} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90">
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Scoring */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">Rating Criteria</h3>
              <p className="text-muted-foreground text-sm">Please rate the faculty member on the following dimensions (1 = Poor, 5 = Excellent).</p>
            </div>

            <div className="space-y-8">
              {criteriaList?.map(criterion => (
                <div key={criterion.id} className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{criterion.category}</span>
                    <h4 className="text-lg font-semibold">{criterion.name}</h4>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => setScores(prev => ({ ...prev, [criterion.id]: val }))}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                          scores[criterion.id] === val 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                            : 'bg-background text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-semibold text-muted-foreground hover:bg-muted">
                Back
              </button>
              <button onClick={handleNext} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90">
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Comments */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-bold mb-4">Additional Comments</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Do you have any specific feedback, strengths, or areas of improvement? (Optional)
              </label>
              <textarea 
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={6}
                placeholder="Share your thoughts here..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="pt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-semibold text-muted-foreground hover:bg-muted" disabled={isPending}>
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isPending}
                className="bg-accent text-accent-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                {isPending ? "Submitting..." : "Submit Evaluation"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="text-center py-12 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-display font-bold mb-2">Thank You!</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Your evaluation has been successfully submitted. Your feedback helps our institution maintain its high academic standards.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setLocation("/")} className="bg-muted text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted/80">
                Go to Dashboard
              </button>
              <button onClick={() => {
                setStep(1);
                setFacultyId("");
                setScores({});
                setComments("");
              }} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90">
                Submit Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
