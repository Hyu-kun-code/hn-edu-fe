import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { ROLES } from "../utils/constants";

import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ProfilePage } from "../pages/common/ProfilePage";

import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { TutorManagementPage } from "../pages/admin/TutorManagementPage";
import { ClassManagementPage } from "../pages/admin/ClassManagementPage";
import { ScheduleManagementPage } from "../pages/admin/ScheduleManagementPage";
import { TuitionManagementPage } from "../pages/admin/TuitionManagementPage";
import { RevenueReportPage } from "../pages/admin/RevenueReportPage";

import { TutorDashboardPage } from "../pages/tutor/TutorDashboardPage";
import { TutorClassesPage } from "../pages/tutor/TutorClassesPage";
import { QuizCreatePage } from "../pages/tutor/QuizCreatePage";
import { QuizResultsByClassPage } from "../pages/tutor/QuizResultsByClassPage";
import { TutorSalaryPage } from "../pages/tutor/TutorSalaryPage";

import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { StudentClassesPage } from "../pages/student/StudentClassesPage";
import { QuizTakePage } from "../pages/student/QuizTakePage";
import { QuizResultPage } from "../pages/student/QuizResultPage";
import { ChatbotPage } from "../pages/student/ChatbotPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tutors"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <TutorManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <ClassManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <ScheduleManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tuition"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <TuitionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <RevenueReportPage />
            </ProtectedRoute>
          }
        />

        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/classes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
              <TutorClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/quizzes/new"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
              <QuizCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/quizzes/results"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
              <QuizResultsByClassPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/salary"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
              <TutorSalaryPage />
            </ProtectedRoute>
          }
        />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes/:quizId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <QuizTakePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes/:quizId/result"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/chatbot"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
