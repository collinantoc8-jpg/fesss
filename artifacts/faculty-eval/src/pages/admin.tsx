import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useFacultyQuery, useFacultyMutations } from "@/hooks/use-faculty";
import { useCriteriaQuery, useCriteriaMutations } from "@/hooks/use-criteria";
import { useDepartmentsQuery, useDepartmentsMutations } from "@/hooks/use-departments";
import {
  useLocalAccountsMutations,
  useLocalAccountsQuery,
} from "@/hooks/use-local-accounts";
import { SectionHeader, LoadingSpinner } from "@/components/ui-patterns";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  BookUser,
  Building2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  UserPlus2,
  Users,
  X,
} from "lucide-react";

type AdminTab = "accounts" | "departments" | "faculty" | "criteria";

export default function Admin() {
  const { isAdmin, isLoading: isAuthLoading, login, isLocalAuth } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AdminTab>(
    isLocalAuth ? "accounts" : "departments",
  );

  const tabs = useMemo(() => {
    const base: Array<{ key: AdminTab; label: string }> = [
      { key: "departments", label: "Departments" },
      { key: "faculty", label: "Faculty Members" },
      { key: "criteria", label: "Evaluation Criteria" },
    ];

    if (isLocalAuth) {
      return [{ key: "accounts" as const, label: "Student Accounts" }, ...base];
    }

    return base;
  }, [isLocalAuth]);

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
        description="Manage local student accounts, departments, faculty, and evaluation criteria."
      />

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-t-xl px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "accounts" && <AccountsManagement />}
      {activeTab === "departments" && <DepartmentsManagement />}
      {activeTab === "faculty" && <FacultyManagement />}
      {activeTab === "criteria" && <CriteriaManagement />}
    </div>
  );
}

function AccountsManagement() {
  const { isLocalAuth } = useAuthContext();
  const { toast } = useToast();
  const { data, isLoading } = useLocalAccountsQuery(isLocalAuth);
  const { createAccount, deleteAccount, isCreating, isDeleting } =
    useLocalAccountsMutations();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "peer">("student");

  const accounts = data?.accounts ?? [];
  const studentCount = accounts.filter((account) => account.role === "student").length;
  const peerCount = accounts.filter((account) => account.role === "peer").length;

  async function handleCreateAccount(event: React.FormEvent) {
    event.preventDefault();

    try {
      await createAccount({ firstName, lastName, email, password, role });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("student");
      toast({
        title: "Account created",
        description: "The student account is now available on the login page.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to create account",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleDeleteAccount(id: string, label: string) {
    if (!confirm(`Delete account for ${label}?`)) {
      return;
    }

    try {
      await deleteAccount(id);
      toast({
        title: "Account removed",
        description: "The login has been removed from the student accounts list.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to remove account",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  if (!isLocalAuth) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h3 className="text-xl font-bold">Student Accounts</h3>
        <p className="mt-3 text-muted-foreground">
          Local student account management is only available when the app is
          running in local auth mode.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader
          title="Add Student Account"
          description="Create a student or peer login that appears on the simple login page."
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Accounts" value={accounts.length.toString()} />
          <StatCard label="Students" value={studentCount.toString()} />
          <StatCard label="Peers" value={peerCount.toString()} />
        </div>

        <form className="space-y-4" onSubmit={handleCreateAccount}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              placeholder="First name"
            />
            <Field
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              placeholder="Last name"
            />
          </div>

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="student@example.com"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 6 characters"
            />

            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "student" | "peer")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(data?.allowedRoles ?? ["student", "peer"]).map((allowedRole) => (
                  <option key={allowedRole} value={allowedRole}>
                    {allowedRole === "student" ? "Student" : "Peer"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            <UserPlus2 className="h-4 w-4" />
            {isCreating ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader
          title="Current Student Accounts"
          description="These local accounts can log in, evaluate faculty, and view evaluation stats."
        />

        {accounts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center">
            <BookUser className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No student accounts yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create the first account using the form on the left.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const fullName =
                `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim() ||
                account.email ||
                "Account";

              return (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="truncate text-lg font-semibold">{fullName}</h4>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          account.role === "peer"
                            ? "bg-accent/15 text-accent-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {account.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={isDeleting}
                    onClick={() => handleDeleteAccount(account.id, fullName)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentsManagement() {
  const { data: departments, isLoading } = useDepartmentsQuery();
  const {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDepartmentsMutations();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (dept: {
    id: number;
    name: string;
    code: string;
    description?: string | null;
  }) => {
    setEditingId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description ?? "");
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = { name, code, description: description || undefined };
    if (editingId) {
      await updateDepartment({ id: editingId, data });
    } else {
      await createDepartment({ data });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number, deptName: string) => {
    if (
      confirm(
        `Delete "${deptName}" department? Faculty assigned to it will keep their department label.`,
      )
    ) {
      await deleteDepartment({ id });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {departments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Building2 size={40} className="text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No departments yet.</p>
          <p className="text-sm text-muted-foreground">
            Add your first department to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-foreground">{dept.name}</h4>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                      {dept.code}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(dept)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    disabled={isDeleting}
                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {dept.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dept.description}
                </p>
              )}
              <div className="border-t border-border/50 pt-2 text-xs text-muted-foreground">
                Added {new Date(dept.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-bold">
                {editingId ? "Edit Department" : "Add Department"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <Field
                label="Department Name"
                value={name}
                onChange={setName}
                placeholder="e.g., College of Engineering"
              />
              <Field
                label="Department Code"
                value={code}
                onChange={(value) => setCode(value.toUpperCase())}
                placeholder="e.g., COE"
              />
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this department..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? "Saving..." : editingId ? "Update" : "Save"}
                </Button>
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
  const { createFaculty, deleteFaculty, isCreating, isDeleting } =
    useFacultyMutations();
  const { data: departments } = useDepartmentsQuery();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createFaculty({ data: { name, department, position, email } });
    setShowModal(false);
    setName("");
    setDepartment("");
    setPosition("");
    setEmail("");
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
        <Button type="button" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Department</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Position</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Email</th>
                <th className="p-4 text-right text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faculty?.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-muted/20">
                  <td className="p-4 font-medium">{member.name}</td>
                  <td className="p-4 text-muted-foreground">{member.department}</td>
                  <td className="p-4 text-muted-foreground">{member.position}</td>
                  <td className="p-4 text-muted-foreground">{member.email}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(member.id)}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-bold">Add New Faculty</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Faculty member name"
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Department</label>
                {departments && departments.length > 0 ? (
                  <select
                    required
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Field
                    label=""
                    value={department}
                    onChange={setDepartment}
                    placeholder="e.g., Computer Science"
                  />
                )}
              </div>
              <Field
                label="Position"
                value={position}
                onChange={setPosition}
                placeholder="e.g., Associate Professor"
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="faculty@example.com"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save"}
                </Button>
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
  const { createCriterion, deleteCriterion, isCreating, isDeleting } =
    useCriteriaMutations();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const maxScore = 5;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createCriterion({ data: { name, description, category, maxScore } });
    setShowModal(false);
    setName("");
    setDescription("");
    setCategory("");
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
        <Button type="button" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Criterion
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {criteria?.map((criterion) => (
          <div
            key={criterion.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {criterion.category}
              </span>
              <button
                onClick={() => handleDelete(criterion.id)}
                disabled={isDeleting}
                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h4 className="mb-2 text-lg font-bold">{criterion.name}</h4>
            <p className="flex-1 text-sm text-muted-foreground">
              {criterion.description}
            </p>
            <div className="mt-4 border-t border-border/50 pt-4 text-xs font-medium text-muted-foreground">
              Scale: 1 to {criterion.maxScore}
            </div>
          </div>
        ))}
        {criteria?.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            No criteria defined. Add some to start evaluating.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-xl font-bold">Add Criterion</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <Field
                label="Category"
                value={category}
                onChange={setCategory}
                placeholder="e.g., Teaching, Research, Service"
              />
              <Field
                label="Criterion Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Clarity of Instruction"
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      {label ? <label className="mb-1 block text-sm font-medium">{label}</label> : null}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-display font-bold text-foreground">{value}</div>
    </div>
  );
}
