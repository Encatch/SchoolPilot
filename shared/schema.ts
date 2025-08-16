import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default('parent'), // admin, teacher, parent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  subject: varchar("subject").notNull(),
  experience: integer("experience").notNull(),
  phone: varchar("phone"),
  qualifications: text("qualifications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "Grade 10-A"
  grade: integer("grade").notNull(), // 1-12
  section: varchar("section").notNull(), // A, B, C, etc.
  teacherId: varchar("teacher_id").references(() => teachers.id),
  academicYear: varchar("academic_year").notNull(),
  maxStudents: integer("max_students").default(30),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  classId: varchar("class_id").references(() => classes.id),
  parentId: varchar("parent_id").references(() => users.id),
  admissionDate: date("admission_date").notNull(),
  status: varchar("status").notNull().default('active'), // active, inactive, transferred
  rollNumber: integer("roll_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  classId: varchar("class_id").notNull().references(() => classes.id),
  date: date("date").notNull(),
  status: varchar("status").notNull(), // present, absent, late
  markedBy: varchar("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee structure table
export const feeStructure = pgTable("fee_structure", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => classes.id),
  feeType: varchar("fee_type").notNull(), // tuition, transport, library, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency").notNull(), // monthly, quarterly, annual
  academicYear: varchar("academic_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee payments table
export const feePayments = pgTable("fee_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  feeStructureId: varchar("fee_structure_id").notNull().references(() => feeStructure.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method").notNull(), // cash, card, online
  status: varchar("status").notNull().default('completed'), // pending, completed, failed
  receiptNumber: varchar("receipt_number").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  classId: varchar("class_id").notNull().references(() => classes.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  subject: varchar("subject").notNull(),
  dueDate: date("due_date").notNull(),
  maxMarks: integer("max_marks").notNull(),
  status: varchar("status").notNull().default('active'), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignment submissions table
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => assignments.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  submissionText: text("submission_text"),
  marksObtained: integer("marks_obtained"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at"),
  gradedAt: timestamp("graded_at"),
  status: varchar("status").notNull().default('pending'), // pending, submitted, graded
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  recipientId: varchar("recipient_id").references(() => users.id),
  recipientRole: varchar("recipient_role"), // admin, teacher, parent, student
  type: varchar("type").notNull(), // academic, fee, attendance, general
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timetable table
export const timetable = pgTable("timetable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => classes.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  subject: varchar("subject").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 7=Sunday
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  room: varchar("room"),
  academicYear: varchar("academic_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  teachers: many(teachers),
  students: many(students),
  notifications: many(notifications),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  classes: many(classes),
  assignments: many(assignments),
  timetable: many(timetable),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(teachers, { fields: [classes.teacherId], references: [teachers.id] }),
  students: many(students),
  attendance: many(attendance),
  feeStructure: many(feeStructure),
  assignments: many(assignments),
  timetable: many(timetable),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  parent: one(users, { fields: [students.parentId], references: [users.id] }),
  attendance: many(attendance),
  feePayments: many(feePayments),
  assignmentSubmissions: many(assignmentSubmissions),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  class: one(classes, { fields: [attendance.classId], references: [classes.id] }),
  markedByUser: one(users, { fields: [attendance.markedBy], references: [users.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  class: one(classes, { fields: [assignments.classId], references: [classes.id] }),
  teacher: one(teachers, { fields: [assignments.teacherId], references: [teachers.id] }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, { fields: [assignmentSubmissions.assignmentId], references: [assignments.id] }),
  student: one(students, { fields: [assignmentSubmissions.studentId], references: [students.id] }),
}));

export const feeStructureRelations = relations(feeStructure, ({ one, many }) => ({
  class: one(classes, { fields: [feeStructure.classId], references: [classes.id] }),
  payments: many(feePayments),
}));

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  student: one(students, { fields: [feePayments.studentId], references: [students.id] }),
  feeStructure: one(feeStructure, { fields: [feePayments.feeStructureId], references: [feeStructure.id] }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  class: one(classes, { fields: [timetable.classId], references: [classes.id] }),
  teacher: one(teachers, { fields: [timetable.teacherId], references: [teachers.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertFeeStructureSchema = createInsertSchema(feeStructure).omit({
  id: true,
  createdAt: true,
});

export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeeStructure = typeof feeStructure.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type FeePayment = typeof feePayments.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetable.$inferSelect;
