import type {
  CreateCriterionInput,
  CreateDepartmentInput,
  CreateFacultyInput,
  Criterion,
  CriterionScore,
  Department,
  Evaluation,
  Faculty,
  FacultyResult,
  FacultyResultDetail,
  SubmitEvaluationInput,
} from "@workspace/api-zod";

const useInMemoryData = !process.env.DATABASE_URL;

type EvaluationScoreRecord = {
  id: number;
  evaluationId: number;
  criterionId: number;
  score: number;
};

function makeDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

let departments: Department[] = [
  {
    id: 1,
    name: "College of Engineering",
    code: "COE",
    description: "Engineering, computing, and applied technology programs.",
    createdAt: makeDate("2025-01-15"),
  },
  {
    id: 2,
    name: "College of Business",
    code: "COB",
    description: "Business administration, entrepreneurship, and finance.",
    createdAt: makeDate("2025-01-16"),
  },
  {
    id: 3,
    name: "College of Arts and Sciences",
    code: "CAS",
    description: "Foundational programs in science, humanities, and research.",
    createdAt: makeDate("2025-01-17"),
  },
];

let faculty: Faculty[] = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    department: "College of Engineering",
    position: "Associate Professor",
    email: "maria.santos@example.edu",
    createdAt: makeDate("2025-01-20"),
  },
  {
    id: 2,
    name: "Prof. James Rivera",
    department: "College of Engineering",
    position: "Assistant Professor",
    email: "james.rivera@example.edu",
    createdAt: makeDate("2025-01-21"),
  },
  {
    id: 3,
    name: "Dr. Angela Cruz",
    department: "College of Business",
    position: "Professor",
    email: "angela.cruz@example.edu",
    createdAt: makeDate("2025-01-22"),
  },
  {
    id: 4,
    name: "Prof. Daniel Reyes",
    department: "College of Arts and Sciences",
    position: "Lecturer",
    email: "daniel.reyes@example.edu",
    createdAt: makeDate("2025-01-23"),
  },
];

let criteria: Criterion[] = [
  {
    id: 1,
    name: "Clarity of Instruction",
    description: "Explains lessons clearly and structures classes well.",
    maxScore: 5,
    category: "Teaching",
  },
  {
    id: 2,
    name: "Subject Mastery",
    description: "Demonstrates strong command of the subject matter.",
    maxScore: 5,
    category: "Teaching",
  },
  {
    id: 3,
    name: "Student Engagement",
    description: "Encourages participation and creates an engaging class.",
    maxScore: 5,
    category: "Teaching",
  },
  {
    id: 4,
    name: "Research Contribution",
    description: "Contributes to research, innovation, or scholarly work.",
    maxScore: 5,
    category: "Research",
  },
  {
    id: 5,
    name: "Professional Service",
    description: "Supports the institution through service and collaboration.",
    maxScore: 5,
    category: "Service",
  },
];

let evaluations: Evaluation[] = [];
let evaluationScores: EvaluationScoreRecord[] = [];

let nextDepartmentId = departments.length + 1;
let nextFacultyId = faculty.length + 1;
let nextCriterionId = criteria.length + 1;
let nextEvaluationId = 1;
let nextEvaluationScoreId = 1;

function seedEvaluation(
  input: Omit<SubmitEvaluationInput, "scores"> & {
    createdAt: Date;
    scores: Array<{ criterionId: number; score: number }>;
  },
) {
  const id = nextEvaluationId++;
  const totalScore = input.scores.reduce((sum, item) => sum + item.score, 0);

  evaluations.push({
    id,
    facultyId: input.facultyId,
    evaluatorName: input.evaluatorName,
    evaluatorRole: input.evaluatorRole,
    semester: input.semester,
    academicYear: input.academicYear,
    comments: input.comments,
    totalScore,
    createdAt: input.createdAt,
  });

  evaluationScores.push(
    ...input.scores.map((score) => ({
      id: nextEvaluationScoreId++,
      evaluationId: id,
      criterionId: score.criterionId,
      score: score.score,
    })),
  );
}

seedEvaluation({
  facultyId: 1,
  evaluatorName: "A. Student",
  evaluatorRole: "student",
  semester: "1st Semester",
  academicYear: "2025",
  comments: "Explains complex topics clearly and keeps classes organized.",
  createdAt: makeDate("2025-09-01"),
  scores: [
    { criterionId: 1, score: 5 },
    { criterionId: 2, score: 5 },
    { criterionId: 3, score: 4 },
    { criterionId: 4, score: 4 },
    { criterionId: 5, score: 5 },
  ],
});

seedEvaluation({
  facultyId: 1,
  evaluatorName: "B. Student",
  evaluatorRole: "student",
  semester: "2nd Semester",
  academicYear: "2025",
  comments: "Very approachable and provides practical examples.",
  createdAt: makeDate("2026-01-12"),
  scores: [
    { criterionId: 1, score: 4 },
    { criterionId: 2, score: 5 },
    { criterionId: 3, score: 4 },
    { criterionId: 4, score: 4 },
    { criterionId: 5, score: 4 },
  ],
});

seedEvaluation({
  facultyId: 2,
  evaluatorName: "C. Student",
  evaluatorRole: "student",
  semester: "1st Semester",
  academicYear: "2025",
  comments: "Interactive classes with useful feedback on assignments.",
  createdAt: makeDate("2025-09-03"),
  scores: [
    { criterionId: 1, score: 4 },
    { criterionId: 2, score: 4 },
    { criterionId: 3, score: 5 },
    { criterionId: 4, score: 3 },
    { criterionId: 5, score: 4 },
  ],
});

seedEvaluation({
  facultyId: 3,
  evaluatorName: "Department Chair",
  evaluatorRole: "admin",
  semester: "1st Semester",
  academicYear: "2025",
  comments: "Outstanding leadership and consistently high-quality instruction.",
  createdAt: makeDate("2025-09-10"),
  scores: [
    { criterionId: 1, score: 5 },
    { criterionId: 2, score: 5 },
    { criterionId: 3, score: 5 },
    { criterionId: 4, score: 4 },
    { criterionId: 5, score: 5 },
  ],
});

seedEvaluation({
  facultyId: 4,
  evaluatorName: "Peer Reviewer",
  evaluatorRole: "peer",
  semester: "Summer",
  academicYear: "2025",
  comments: "Connects theory with real examples and supports students well.",
  createdAt: makeDate("2025-06-20"),
  scores: [
    { criterionId: 1, score: 4 },
    { criterionId: 2, score: 3 },
    { criterionId: 3, score: 4 },
    { criterionId: 4, score: 2 },
    { criterionId: 5, score: 4 },
  ],
});

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.name.localeCompare(right.name));
}

function sortByCreatedAtAsc<T extends { createdAt: Date }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
}

function sortByCreatedAtDesc<T extends { createdAt: Date }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function listResultsFromMemory(
  academicYear?: string,
  semester?: string,
): FacultyResult[] {
  const maxPossiblePerEval = criteria.length * 5;

  return faculty
    .map((member) => {
      const matchingEvaluations = evaluations.filter(
        (evaluation) =>
          evaluation.facultyId === member.id &&
          (!academicYear || evaluation.academicYear === academicYear) &&
          (!semester || evaluation.semester === semester),
      );

      const totalEvaluations = matchingEvaluations.length;
      const averageScore =
        totalEvaluations === 0
          ? 0
          : matchingEvaluations.reduce(
              (sum, evaluation) => sum + evaluation.totalScore,
              0,
            ) / totalEvaluations;

      return {
        facultyId: member.id,
        facultyName: member.name,
        department: member.department,
        position: member.position,
        averageScore,
        totalEvaluations,
        overallPercentage:
          maxPossiblePerEval === 0
            ? 0
            : roundToOneDecimal((averageScore / maxPossiblePerEval) * 100),
      };
    })
    .sort((left, right) => right.overallPercentage - left.overallPercentage);
}

async function listFacultyFromDb(): Promise<Faculty[]> {
  const { db, facultyTable } = await import("@workspace/db");
  return db.select().from(facultyTable).orderBy(facultyTable.name);
}

async function createFacultyInDb(data: CreateFacultyInput): Promise<Faculty> {
  const { db, facultyTable } = await import("@workspace/db");
  const [member] = await db.insert(facultyTable).values(data).returning();
  return member;
}

async function getFacultyFromDb(id: number): Promise<Faculty | null> {
  const { db, facultyTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const [member] = await db.select().from(facultyTable).where(eq(facultyTable.id, id));
  return member ?? null;
}

async function updateFacultyInDb(
  id: number,
  data: CreateFacultyInput,
): Promise<Faculty | null> {
  const { db, facultyTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const [member] = await db
    .update(facultyTable)
    .set(data)
    .where(eq(facultyTable.id, id))
    .returning();
  return member ?? null;
}

async function deleteFacultyInDb(id: number): Promise<void> {
  const { db, facultyTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  await db.delete(facultyTable).where(eq(facultyTable.id, id));
}

async function listDepartmentsFromDb(): Promise<Department[]> {
  const { db, departmentsTable } = await import("@workspace/db");
  const rows = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  return rows.map((row) => ({
    ...row,
    description: row.description ?? undefined,
  }));
}

async function createDepartmentInDb(
  data: CreateDepartmentInput,
): Promise<Department> {
  const { db, departmentsTable } = await import("@workspace/db");
  const [department] = await db
    .insert(departmentsTable)
    .values({
      name: data.name,
      code: data.code,
      description: data.description ?? null,
    })
    .returning();
  return {
    ...department,
    description: department.description ?? undefined,
  };
}

async function updateDepartmentInDb(
  id: number,
  data: CreateDepartmentInput,
): Promise<Department | null> {
  const { db, departmentsTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const [department] = await db
    .update(departmentsTable)
    .set({
      name: data.name,
      code: data.code,
      description: data.description ?? null,
    })
    .where(eq(departmentsTable.id, id))
    .returning();
  return department
    ? {
        ...department,
        description: department.description ?? undefined,
      }
    : null;
}

async function deleteDepartmentInDb(id: number): Promise<void> {
  const { db, departmentsTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
}

async function listCriteriaFromDb(): Promise<Criterion[]> {
  const { db, criteriaTable } = await import("@workspace/db");
  return db
    .select()
    .from(criteriaTable)
    .orderBy(criteriaTable.category, criteriaTable.name);
}

async function createCriterionInDb(
  data: CreateCriterionInput,
): Promise<Criterion> {
  const { db, criteriaTable } = await import("@workspace/db");
  const [criterion] = await db.insert(criteriaTable).values(data).returning();
  return criterion;
}

async function deleteCriterionInDb(id: number): Promise<void> {
  const { db, criteriaTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  await db.delete(criteriaTable).where(eq(criteriaTable.id, id));
}

async function listEvaluationsFromDb(
  facultyId?: number,
): Promise<Evaluation[]> {
  const { db, evaluationsTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  const query = db.select().from(evaluationsTable);

  if (facultyId) {
    const rows = await query
      .where(eq(evaluationsTable.facultyId, facultyId))
      .orderBy(evaluationsTable.createdAt);
    return rows.map((row) => ({
      ...row,
      comments: row.comments ?? undefined,
    }));
  }

  const rows = await query.orderBy(evaluationsTable.createdAt);
  return rows.map((row) => ({
    ...row,
    comments: row.comments ?? undefined,
  }));
}

async function submitEvaluationInDb(
  data: SubmitEvaluationInput,
): Promise<Evaluation> {
  const { db, evaluationsTable, evaluationScoresTable } = await import(
    "@workspace/db"
  );
  const { scores, ...evaluationData } = data;
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const [evaluation] = await db
    .insert(evaluationsTable)
    .values({
      ...evaluationData,
      totalScore,
      comments: evaluationData.comments ?? null,
    })
    .returning();

  if (scores.length > 0) {
    await db.insert(evaluationScoresTable).values(
      scores.map((score) => ({
        evaluationId: evaluation.id,
        criterionId: score.criterionId,
        score: score.score,
      })),
    );
  }

  return {
    ...evaluation,
    comments: evaluation.comments ?? undefined,
  };
}

async function listAcademicYearsFromDb(): Promise<string[]> {
  const { db, evaluationsTable } = await import("@workspace/db");
  const { sql } = await import("drizzle-orm");
  const rows = await db
    .selectDistinct({ academicYear: evaluationsTable.academicYear })
    .from(evaluationsTable)
    .orderBy(sql`${evaluationsTable.academicYear} DESC`);

  return rows.map((row) => row.academicYear);
}

async function listResultsFromDb(
  academicYear?: string,
  semester?: string,
): Promise<FacultyResult[]> {
  const { db, criteriaTable, evaluationsTable, facultyTable } = await import(
    "@workspace/db"
  );
  const { and, avg, count, eq } = await import("drizzle-orm");

  const facultyRows = await db.select().from(facultyTable).orderBy(facultyTable.name);
  const totalCriteria = await db.select({ total: count() }).from(criteriaTable);
  const maxPossiblePerEval = (totalCriteria[0]?.total ?? 0) * 5;

  const results = await Promise.all(
    facultyRows.map(async (member) => {
      const conditions = [eq(evaluationsTable.facultyId, member.id)];

      if (academicYear) {
        conditions.push(eq(evaluationsTable.academicYear, academicYear));
      }

      if (semester) {
        conditions.push(eq(evaluationsTable.semester, semester));
      }

      const rows = await db
        .select({ count: count(), avgScore: avg(evaluationsTable.totalScore) })
        .from(evaluationsTable)
        .where(and(...conditions));

      const totalEvaluations = Number(rows[0]?.count ?? 0);
      const averageScore = Number(rows[0]?.avgScore ?? 0);

      return {
        facultyId: member.id,
        facultyName: member.name,
        department: member.department,
        position: member.position,
        averageScore,
        totalEvaluations,
        overallPercentage:
          maxPossiblePerEval === 0
            ? 0
            : roundToOneDecimal((averageScore / maxPossiblePerEval) * 100),
      };
    }),
  );

  return results.sort(
    (left, right) => right.overallPercentage - left.overallPercentage,
  );
}

async function getFacultyResultFromDb(
  facultyId: number,
): Promise<FacultyResultDetail | null> {
  const {
    db,
    criteriaTable,
    evaluationScoresTable,
    evaluationsTable,
    facultyTable,
  } = await import("@workspace/db");
  const { avg, count, eq, sql } = await import("drizzle-orm");

  const [member] = await db
    .select()
    .from(facultyTable)
    .where(eq(facultyTable.id, facultyId));

  if (!member) {
    return null;
  }

  const evaluationStats = await db
    .select({ count: count(), avgScore: avg(evaluationsTable.totalScore) })
    .from(evaluationsTable)
    .where(eq(evaluationsTable.facultyId, facultyId));

  const criteriaRows = await db.select().from(criteriaTable);
  const criteriaScores = await Promise.all(
    criteriaRows.map(async (criterion) => {
      const scoreRows = await db
        .select({ avg: avg(evaluationScoresTable.score) })
        .from(evaluationScoresTable)
        .innerJoin(
          evaluationsTable,
          eq(evaluationScoresTable.evaluationId, evaluationsTable.id),
        )
        .where(
          sql`${evaluationsTable.facultyId} = ${facultyId} AND ${evaluationScoresTable.criterionId} = ${criterion.id}`,
        );

      return {
        criterionId: criterion.id,
        criterionName: criterion.name,
        category: criterion.category,
        averageScore: roundToOneDecimal(Number(scoreRows[0]?.avg ?? 0)),
        maxScore: criterion.maxScore,
      };
    }),
  );

  const recentComments = await db
    .select({ comments: evaluationsTable.comments })
    .from(evaluationsTable)
    .where(eq(evaluationsTable.facultyId, facultyId))
    .orderBy(sql`${evaluationsTable.createdAt} DESC`)
    .limit(5);

  const averageScore = Number(evaluationStats[0]?.avgScore ?? 0);
  const maxPossiblePerEval = criteriaRows.length * 5;

  return {
    facultyId: member.id,
    facultyName: member.name,
    department: member.department,
    position: member.position,
    averageScore,
    totalEvaluations: Number(evaluationStats[0]?.count ?? 0),
    overallPercentage:
      maxPossiblePerEval === 0
        ? 0
        : roundToOneDecimal((averageScore / maxPossiblePerEval) * 100),
    criteriaScores,
    recentComments: recentComments
      .map((row) => row.comments)
      .filter(Boolean) as string[],
  };
}

export async function listFaculty(): Promise<Faculty[]> {
  if (!useInMemoryData) {
    return listFacultyFromDb();
  }

  return sortByName(faculty);
}

export async function createFaculty(data: CreateFacultyInput): Promise<Faculty> {
  if (!useInMemoryData) {
    return createFacultyInDb(data);
  }

  const member: Faculty = {
    id: nextFacultyId++,
    ...data,
    createdAt: new Date(),
  };

  faculty = [...faculty, member];
  return member;
}

export async function getFaculty(facultyId: number): Promise<Faculty | null> {
  if (!useInMemoryData) {
    return getFacultyFromDb(facultyId);
  }

  return faculty.find((member) => member.id === facultyId) ?? null;
}

export async function updateFaculty(
  facultyId: number,
  data: CreateFacultyInput,
): Promise<Faculty | null> {
  if (!useInMemoryData) {
    return updateFacultyInDb(facultyId, data);
  }

  const index = faculty.findIndex((member) => member.id === facultyId);

  if (index === -1) {
    return null;
  }

  faculty[index] = { ...faculty[index], ...data };
  return faculty[index];
}

export async function deleteFaculty(facultyId: number): Promise<void> {
  if (!useInMemoryData) {
    await deleteFacultyInDb(facultyId);
    return;
  }

  const evaluationIds = evaluations
    .filter((evaluation) => evaluation.facultyId === facultyId)
    .map((evaluation) => evaluation.id);

  faculty = faculty.filter((member) => member.id !== facultyId);
  evaluations = evaluations.filter((evaluation) => evaluation.facultyId !== facultyId);
  evaluationScores = evaluationScores.filter(
    (score) => !evaluationIds.includes(score.evaluationId),
  );
}

export async function listDepartments(): Promise<Department[]> {
  if (!useInMemoryData) {
    return listDepartmentsFromDb();
  }

  return sortByName(departments);
}

export async function createDepartment(
  data: CreateDepartmentInput,
): Promise<Department> {
  if (!useInMemoryData) {
    return createDepartmentInDb(data);
  }

  const department: Department = {
    id: nextDepartmentId++,
    name: data.name,
    code: data.code,
    description: data.description,
    createdAt: new Date(),
  };

  departments = [...departments, department];
  return department;
}

export async function updateDepartment(
  departmentId: number,
  data: CreateDepartmentInput,
): Promise<Department | null> {
  if (!useInMemoryData) {
    return updateDepartmentInDb(departmentId, data);
  }

  const index = departments.findIndex(
    (department) => department.id === departmentId,
  );

  if (index === -1) {
    return null;
  }

  departments[index] = {
    ...departments[index],
    name: data.name,
    code: data.code,
    description: data.description,
  };

  return departments[index];
}

export async function deleteDepartment(departmentId: number): Promise<void> {
  if (!useInMemoryData) {
    await deleteDepartmentInDb(departmentId);
    return;
  }

  departments = departments.filter(
    (department) => department.id !== departmentId,
  );
}

export async function listCriteria(): Promise<Criterion[]> {
  if (!useInMemoryData) {
    return listCriteriaFromDb();
  }

  return [...criteria].sort(
    (left, right) =>
      left.category.localeCompare(right.category) ||
      left.name.localeCompare(right.name),
  );
}

export async function createCriterion(
  data: CreateCriterionInput,
): Promise<Criterion> {
  if (!useInMemoryData) {
    return createCriterionInDb(data);
  }

  const criterion: Criterion = {
    id: nextCriterionId++,
    ...data,
  };

  criteria = [...criteria, criterion];
  return criterion;
}

export async function deleteCriterion(criterionId: number): Promise<void> {
  if (!useInMemoryData) {
    await deleteCriterionInDb(criterionId);
    return;
  }

  criteria = criteria.filter((criterion) => criterion.id !== criterionId);
  evaluationScores = evaluationScores.filter(
    (score) => score.criterionId !== criterionId,
  );
}

export async function listEvaluations(
  facultyId?: number,
): Promise<Evaluation[]> {
  if (!useInMemoryData) {
    return listEvaluationsFromDb(facultyId);
  }

  return sortByCreatedAtAsc(
    facultyId
      ? evaluations.filter((evaluation) => evaluation.facultyId === facultyId)
      : evaluations,
  );
}

export async function submitEvaluation(
  data: SubmitEvaluationInput,
): Promise<Evaluation> {
  if (!useInMemoryData) {
    return submitEvaluationInDb(data);
  }

  const evaluation: Evaluation = {
    id: nextEvaluationId++,
    facultyId: data.facultyId,
    evaluatorName: data.evaluatorName,
    evaluatorRole: data.evaluatorRole,
    semester: data.semester,
    academicYear: data.academicYear,
    comments: data.comments,
    totalScore: data.scores.reduce((sum, score) => sum + score.score, 0),
    createdAt: new Date(),
  };

  evaluations = [...evaluations, evaluation];
  evaluationScores = [
    ...evaluationScores,
    ...data.scores.map((score) => ({
      id: nextEvaluationScoreId++,
      evaluationId: evaluation.id,
      criterionId: score.criterionId,
      score: score.score,
    })),
  ];

  return evaluation;
}

export async function listAcademicYears(): Promise<string[]> {
  if (!useInMemoryData) {
    return listAcademicYearsFromDb();
  }

  return Array.from(new Set(evaluations.map((evaluation) => evaluation.academicYear))).sort(
    (left, right) =>
      right.localeCompare(left, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export async function listResults(
  academicYear?: string,
  semester?: string,
): Promise<FacultyResult[]> {
  if (!useInMemoryData) {
    return listResultsFromDb(academicYear, semester);
  }

  return listResultsFromMemory(academicYear, semester);
}

export async function getFacultyResult(
  facultyId: number,
): Promise<FacultyResultDetail | null> {
  if (!useInMemoryData) {
    return getFacultyResultFromDb(facultyId);
  }

  const member = faculty.find((item) => item.id === facultyId);

  if (!member) {
    return null;
  }

  const memberEvaluations = evaluations.filter(
    (evaluation) => evaluation.facultyId === facultyId,
  );
  const averageScore =
    memberEvaluations.length === 0
      ? 0
      : memberEvaluations.reduce(
          (sum, evaluation) => sum + evaluation.totalScore,
          0,
        ) / memberEvaluations.length;

  const criteriaScores: CriterionScore[] = criteria.map((criterion) => {
    const scores = evaluationScores.filter(
      (score) =>
        score.criterionId === criterion.id &&
        memberEvaluations.some(
          (evaluation) => evaluation.id === score.evaluationId,
        ),
    );

    const averageCriterionScore =
      scores.length === 0
        ? 0
        : scores.reduce((sum, score) => sum + score.score, 0) / scores.length;

    return {
      criterionId: criterion.id,
      criterionName: criterion.name,
      category: criterion.category,
      averageScore: roundToOneDecimal(averageCriterionScore),
      maxScore: criterion.maxScore,
    };
  });

  const maxPossiblePerEval = criteria.length * 5;

  return {
    facultyId: member.id,
    facultyName: member.name,
    department: member.department,
    position: member.position,
    averageScore,
    totalEvaluations: memberEvaluations.length,
    overallPercentage:
      maxPossiblePerEval === 0
        ? 0
        : roundToOneDecimal((averageScore / maxPossiblePerEval) * 100),
    criteriaScores,
    recentComments: sortByCreatedAtDesc(memberEvaluations)
      .slice(0, 5)
      .map((evaluation) => evaluation.comments)
      .filter(Boolean) as string[],
  };
}
