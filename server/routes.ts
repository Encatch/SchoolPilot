import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertTeacherSchema,
  insertStudentSchema,
  insertClassSchema,
  insertAttendanceSchema,
  insertAssignmentSchema,
  insertNotificationSchema,
  insertFeeStructureSchema,
  insertFeePaymentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Teacher routes
  app.get('/api/teachers', isAuthenticated, async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get('/api/teachers/:id', isAuthenticated, async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  app.post('/api/teachers', isAuthenticated, async (req, res) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(teacherData);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("Error creating teacher:", error);
      res.status(400).json({ message: "Failed to create teacher" });
    }
  });

  app.put('/api/teachers/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertTeacherSchema.partial().parse(req.body);
      const teacher = await storage.updateTeacher(req.params.id, updates);
      res.json(teacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(400).json({ message: "Failed to update teacher" });
    }
  });

  app.delete('/api/teachers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTeacher(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "Failed to delete teacher" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.get('/api/students/parent/:parentId', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudentsByParent(req.params.parentId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students by parent:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, updates);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      const classData = await storage.getClass(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  app.post('/api/classes', isAuthenticated, async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Failed to create class" });
    }
  });

  app.put('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertClassSchema.partial().parse(req.body);
      const classData = await storage.updateClass(req.params.id, updates);
      res.json(classData);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Failed to update class" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Attendance routes
  app.get('/api/attendance/class/:classId/:date', isAuthenticated, async (req, res) => {
    try {
      const { classId, date } = req.params;
      const attendance = await storage.getAttendanceByClass(classId, date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get('/api/attendance/student/:studentId', isAuthenticated, async (req, res) => {
    try {
      const attendance = await storage.getAttendanceByStudent(req.params.studentId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(400).json({ message: "Failed to mark attendance" });
    }
  });

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/assignments/class/:classId', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByClass(req.params.classId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching class assignments:", error);
      res.status(500).json({ message: "Failed to fetch class assignments" });
    }
  });

  app.get('/api/assignments/teacher/:teacherId', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignmentsByTeacher(req.params.teacherId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching teacher assignments:", error);
      res.status(500).json({ message: "Failed to fetch teacher assignments" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(400).json({ message: "Failed to create assignment" });
    }
  });

  app.put('/api/assignments/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateAssignment(req.params.id, updates);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(400).json({ message: "Failed to update assignment" });
    }
  });

  app.delete('/api/assignments/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAssignment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.query.role as string;
      const notifications = await storage.getNotifications(userId, userRole);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(400).json({ message: "Failed to create notification" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Fee routes
  app.get('/api/fees/structure/:classId', isAuthenticated, async (req, res) => {
    try {
      const feeStructure = await storage.getFeeStructureByClass(req.params.classId);
      res.json(feeStructure);
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      res.status(500).json({ message: "Failed to fetch fee structure" });
    }
  });

  app.get('/api/fees/payments/:studentId', isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getFeePaymentsByStudent(req.params.studentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching fee payments:", error);
      res.status(500).json({ message: "Failed to fetch fee payments" });
    }
  });

  app.post('/api/fees/structure', isAuthenticated, async (req, res) => {
    try {
      const feeStructureData = insertFeeStructureSchema.parse(req.body);
      const feeStructure = await storage.createFeeStructure(feeStructureData);
      res.status(201).json(feeStructure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      res.status(400).json({ message: "Failed to create fee structure" });
    }
  });

  app.post('/api/fees/payments', isAuthenticated, async (req, res) => {
    try {
      const feePaymentData = insertFeePaymentSchema.parse(req.body);
      const payment = await storage.createFeePayment(feePaymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating fee payment:", error);
      res.status(400).json({ message: "Failed to create fee payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
