import { useState } from "react";
import { useFacultyQuery, useFacultyMutations } from "@/hooks/use-faculty";
import { useCriteriaQuery, useCriteriaMutations } from "@/hooks/use-criteria";
import { SectionHeader, LoadingSpinner } from "@/components/ui-patterns";
import { Plus, Trash2, Edit } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"faculty" | "criteria">("faculty");

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Administration" 
        description="Manage institution faculty and evaluation frameworks"
      />

      <div className="flex gap-2 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab("faculty")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "faculty" ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Faculty Members
        </button>
        <button 
          onClick={() => setActiveTab("criteria")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "criteria" ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Evaluation Criteria
        </button>
      </div>

      {activeTab === "faculty" ? <FacultyManagement /> : <CriteriaManagement />}
    </div>
  );
}

function FacultyManagement() {
  const { data: faculty, isLoading } = useFacultyQuery();
  const { createFaculty, deleteFaculty, isCreating, isDeleting } = useFacultyMutations();
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFaculty({ data: { name, department, position, email } });
    setShowModal(false);
    setName(""); setDepartment(""); setPosition(""); setEmail("");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this faculty member?")) {
      await deleteFaculty({ id });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 shadow-sm"
        >
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-muted-foreground">Name</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Department</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Position</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Email</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faculty?.map(f => (
                <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{f.name}</td>
                  <td className="p-4 text-muted-foreground">{f.department}</td>
                  <td className="p-4 text-muted-foreground">{f.position}</td>
                  <td className="p-4 text-muted-foreground">{f.email}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(f.id)}
                      disabled={isDeleting}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {faculty?.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No faculty records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold">Add New Faculty</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input required value={department} onChange={e=>setDepartment(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input required value={position} onChange={e=>setPosition(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-medium">Cancel</button>
                <button type="submit" disabled={isCreating} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50">
                  {isCreating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CriteriaManagement() {
  const { data: criteria, isLoading } = useCriteriaQuery();
  const { createCriterion, deleteCriterion, isCreating, isDeleting } = useCriteriaMutations();
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const maxScore = 5;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCriterion({ data: { name, description, category, maxScore } });
    setShowModal(false);
    setName(""); setDescription(""); setCategory("");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this criterion? It may affect historical results.")) {
      await deleteCriterion({ id });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-accent/90 shadow-sm"
        >
          <Plus size={18} /> Add Criterion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria?.map(c => (
          <div key={c.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider">{c.category}</span>
              <button 
                onClick={() => handleDelete(c.id)}
                disabled={isDeleting}
                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h4 className="text-lg font-bold mb-2">{c.name}</h4>
            <p className="text-sm text-muted-foreground flex-1">{c.description}</p>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground font-medium">
              Scale: 1 to {c.maxScore}
            </div>
          </div>
        ))}
        {criteria?.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            No criteria defined. Add some to start evaluating.
          </div>
        )}
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold">Add Criterion</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required placeholder="e.g., Teaching, Research, Service" value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Criterion Name</label>
                <input required placeholder="e.g., Clarity of Instruction" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-medium">Cancel</button>
                <button type="submit" disabled={isCreating} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50">
                  {isCreating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
