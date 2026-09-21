import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { LoadingIndicator } from "../components/common/LoadingIndicator";
import { ROLES } from "../utils/constants";

import { LandingPage } from "../pages/public/LandingPage";

const LoginPage = lazy(() => import("../pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import("../pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const ProfilePage = lazy(() =>
  import("../pages/common/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);

const AdminDashboardPage = lazy(() =>
  import("../pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const TutorManagementPage = lazy(() =>
  import("../pages/admin/TutorManagementPage").then((m) => ({ default: m.TutorManagementPage })),
);
const ClassManagementPage = lazy(() =>
  import("../pages/admin/ClassManagementPage").then((m) => ({ default: m.ClassManagementPage })),
);
const AdminClassSchedulePage = lazy(() =>
  import("../pages/admin/AdminClassSchedulePage").then((m) => ({
    default: m.AdminClassSchedulePage,
  })),
);
const ScheduleManagementPage = lazy(() =>
  import("../pages/admin/ScheduleManagementPage").then((m) => ({
    default: m.ScheduleManagementPage,
  })),
);
const TuitionManagementPage = lazy(() =>
  import("../pages/admin/TuitionManagementPage").then((m) => ({ default: m.TuitionManagementPage })),
);
const RevenueReportPage = lazy(() =>
  import("../pages/admin/RevenueReportPage").then((m) => ({ default: m.RevenueReportPage })),
);

const TutorDashboardPage = lazy(() =>
  import("../pages/tutor/TutorDashboardPage").then((m) => ({ default: m.TutorDashboardPage })),
);
const TutorClassesPage = lazy(() =>
  import("../pages/tutor/TutorClassesPage").then((m) => ({ default: m.TutorClassesPage })),
);
const TutorClassSchedulePage = lazy(() =>
  import("../pages/tutor/TutorClassSchedulePage").then((m) => ({
    default: m.TutorClassSchedulePage,
  })),
);
const QuizCreatePage = lazy(() =>
  import("../pages/tutor/QuizCreatePage").then((m) => ({ default: m.QuizCreatePage })),
);
const QuizResultsByClassPage = lazy(() =>
  import("../pages/tutor/QuizResultsByClassPage").then((m) => ({
    default: m.QuizResultsByClassPage,
  })),
);
const TutorSalaryPage = lazy(() =>
  import("../pages/tutor/TutorSalaryPage").then((m) => ({ default: m.TutorSalaryPage })),
);

const StudentDashboardPage = lazy(() =>
  import("../pages/student/StudentDashboardPage").then((m) => ({ default: m.StudentDashboardPage })),
);
const StudentClassesPage = lazy(() =>
  import("../pages/student/StudentClassesPage").then((m) => ({ default: m.StudentClassesPage })),
);
const StudentClassQuizzesPage = lazy(() =>
  import("../pages/student/StudentClassQuizzesPage").then((m) => ({
    default: m.StudentClassQuizzesPage,
  })),
);
const StudentClassMaterialsPage = lazy(() =>
  import("../pages/student/StudentClassMaterialsPage").then((m) => ({
    default: m.StudentClassMaterialsPage,
  })),
);
const QuizTakePage = lazy(() =>
  import("../pages/student/QuizTakePage").then((m) => ({ default: m.QuizTakePage })),
);
const QuizResultPage = lazy(() =>
  import("../pages/student/QuizResultPage").then((m) => ({ default: m.QuizResultPage })),
);
const ChatbotPage = lazy(() =>
  import("../pages/student/ChatbotPage").then((m) => ({ default: m.ChatbotPage })),
);

function RouteFallback() {
  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <LoadingIndicator />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
            path="/admin/classes/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminClassSchedulePage />
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
            path="/tutor/classes/:id"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
                <TutorClassSchedulePage />
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
            path="/student/classes/:id/quizzes"
            element={
              <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentClassQuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/classes/:id/materials"
            element={
              <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentClassMaterialsPage />
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
    </Suspense>
  );
}
