import {
  users,
  teachers,
  students,
  classes,
  attendance,
  assignments,
  assignmentSubmissions,
  notifications,
  feeStructure,
  feePayments,
  timetable,
  type User,
  type UpsertUser,
  type Teacher,
  type InsertTeacher,
  type Student,
  type InsertStudent,
  type Class,
  type InsertClass,
  type Attendance,
  type InsertAttendance,
  type Assignment,
  type InsertAssignment,
  type Notification,
  type InsertNotification,
  type FeeStructure,
  type InsertFeeStructure,
  type FeePayment,
  type InsertFeePayment,
  type Timetable,
  type InsertTimetable,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Teacher operations
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;

  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByClass(classId: string): Promise<Student[]>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Class operations
  getClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Attendance operations
  getAttendanceByClass(classId: string, date: string): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance>;

  // Assignment operations
  getAssignments(): Promise<Assignment[]>;
  getAssignmentsByClass(classId: string): Promise<Assignment[]>;
  getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;

  // Notification operations
  getNotifications(userId?: string, role?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Fee operations
  getFeeStructureByClass(classId: string): Promise<FeeStructure[]>;
  getFeePaymentsByStudent(studentId: string): Promise<FeePayment[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  createFeePayment(feePayment: InsertFeePayment): Promise<FeePayment>;

  // Timetable operations
  getTimetableByClass(classId: string): Promise<Timetable[]>;
  createTimetableEntry(timetable: InsertTimetable): Promise<Timetable>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    activeClasses: number;
    totalFeeCollection: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Teacher operations
  async getTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers).orderBy(desc(teachers.createdAt));
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    const [updatedTeacher] = await db
      .update(teachers)
      .set({ ...teacher, updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return updatedTeacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.classId, classId));
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Class operations
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes).orderBy(desc(classes.createdAt));
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Attendance operations
  async getAttendanceByClass(classId: string, date: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.classId, classId), eq(attendance.date, date)));
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(attendance.date));
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsByClass(classId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.classId, classId))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.teacherId, teacherId))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  // Notification operations
  async getNotifications(userId?: string, role?: string): Promise<Notification[]> {
    if (userId && role) {
      return await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientId, userId),
            eq(notifications.recipientRole, role)
          )
        )
        .orderBy(desc(notifications.createdAt));
    } else if (role) {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientRole, role))
        .orderBy(desc(notifications.createdAt));
    }
    
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Fee operations
  async getFeeStructureByClass(classId: string): Promise<FeeStructure[]> {
    return await db.select().from(feeStructure).where(eq(feeStructure.classId, classId));
  }

  async getFeePaymentsByStudent(studentId: string): Promise<FeePayment[]> {
    return await db
      .select()
      .from(feePayments)
      .where(eq(feePayments.studentId, studentId))
      .orderBy(desc(feePayments.paymentDate));
  }

  async createFeeStructure(feeStructureData: InsertFeeStructure): Promise<FeeStructure> {
    const [newFeeStructure] = await db.insert(feeStructure).values(feeStructureData).returning();
    return newFeeStructure;
  }

  async createFeePayment(feePayment: InsertFeePayment): Promise<FeePayment> {
    const [newFeePayment] = await db.insert(feePayments).values(feePayment).returning();
    return newFeePayment;
  }

  // Timetable operations
  async getTimetableByClass(classId: string): Promise<Timetable[]> {
    return await db
      .select()
      .from(timetable)
      .where(eq(timetable.classId, classId))
      .orderBy(timetable.dayOfWeek, timetable.startTime);
  }

  async createTimetableEntry(timetableData: InsertTimetable): Promise<Timetable> {
    const [newTimetable] = await db.insert(timetable).values(timetableData).returning();
    return newTimetable;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    activeClasses: number;
    totalFeeCollection: number;
  }> {
    const [studentsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.status, 'active'));

    const [teachersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teachers);

    const [classesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(classes);

    const [feeCollection] = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(feePayments)
      .where(eq(feePayments.status, 'completed'));

    return {
      totalStudents: studentsCount.count,
      totalTeachers: teachersCount.count,
      activeClasses: classesCount.count,
      totalFeeCollection: feeCollection.total || 0,
    };
  }
}

export const storage = new DatabaseStorage();
