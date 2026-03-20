import { useState } from "react";
import { Link } from "wouter";
import { useFacultyQuery, useFacultyMutations } from "@/hooks/use-faculty";
import { useCriteriaQuery, useCriteriaMutations } from "@/hooks/use-criteria";
import { useDepartmentsQuery, useDepartmentsMutations } from "@/hooks/use-departments";
import { SectionHeader, LoadingSpinner } from "@/components/ui-patterns";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { Plus, Trash2, Pencil, Building2, ShieldAlert, X } from "lucide-react";

export default function Admin() {
  const { isAdmin, isLoading: isAuthLoading, login, isLocalAuth } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"departments" | "faculty" | "criteria">("departments");

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "departments", label: "Departments" },
    { key: "faculty", label: "Faculty Members" },
    { key: "criteria", label: "Evaluation Criteria" },
  ];

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold">Administrator access required</h1>
        <p className="mt-3 text-muted-foreground">
          This area is limited to administrator accounts. Sign in with admin access or go back to the main evaluation pages.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={login}>
            {isLocalAuth ? "Switch to Admin" : "Admin Sign In"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Administration"
        description="Manage departments, faculty, and evaluation frameworks"
      />

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "departments" && <DepartmentsManagement />}
      {activeTab === "faculty" && <FacultyManagement />}
      {activeTab === "criteria" && <CriteriaManagement />}
    </div>
  );
}

function DepartmentsManagement() {
  const { data: departments, isLoading } = useDepartmentsQuery();
  const { createDepartment, updateDepartment, deleteDepartment, isCreating, isUpdating, isDeleting } =
    useDepartmentsMutations();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setName(""); setCode(""); setDescription("");
    setShowModal(true);
  };

  const openEdit = (dept: { id: number; name: string; code: string; description?: string | null }) => {
    setEditingId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description ?? "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, code, description: description || undefined };
    if (editingId) {
      await updateDepartment({ id: editingId, data });
    } else {
      await createDepartment({ data });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number, deptName: string) => {
    if (confirm(`Delete "${deptName}" department? Faculty assigned to it will keep their department label.`)) {
      await deleteDepartment({ id });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 shadow-sm"
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      {departments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl gap-3 text-center">
          <Building2 size={40} className="text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No departments yet.</p>
          <p className="text-sm text-muted-foreground">Add your first department to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments?.map(dept => (
            <div key={dept.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate">{dept.name}</h4>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {dept.code}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(dept)}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    disabled={isDeleting}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {dept.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{dept.description}</p>
              )}
              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                Added {new Date(dept.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingId ? "Edit Department" : "Add Department"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder="e.g., College of Engineering"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department Code <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder="e.g., COE"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this department..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FacultyManagement() {
  const { data: faculty, isLoading } = useFacultyQuery();
  const { createFaculty, deleteFaculty, isCreating, isDeleting } = useFacultyMutations();
  const { data: departments } = useDepartmentsQuery();
  const [showModal, setShowModal] = useState(false);

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
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No faculty records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">Add New Faculty</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                {departments && departments.length > 0 ? (
                  <select
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background"
                  >
                    <option value="">Select a department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <input required placeholder="e.g., Computer Science" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input required value={position} onChange={e => setPosition(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
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
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider">
                {c.category}
              </span>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">Add Criterion</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required placeholder="e.g., Teaching, Research, Service" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Criterion Name</label>
                <input required placeholder="e.g., Clarity of Instruction" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none bg-background resize-none" />
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
