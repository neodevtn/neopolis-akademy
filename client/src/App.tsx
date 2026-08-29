import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import DeferredCookieConsent from "./components/DeferredCookieConsent";

// ─── Code-splitting: lazy-load all heavy pages ───
const Home = lazy(() => import("./pages/Home"));
const Apply = lazy(() => import("./pages/Apply"));
const AiNews = lazy(() => import("./pages/AiNews"));
const ReferralLanding = lazy(() => import("./pages/ReferralLanding"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminTraining = lazy(() => import("./pages/AdminTraining"));
const AdminContentManager = lazy(() => import("./pages/AdminContentManager"));
const AdminMediaLibrary = lazy(() => import("./pages/AdminMediaLibrary"));
const AdminErrors = lazy(() => import("./pages/AdminErrors"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const TrainingDashboard = lazy(() => import("./pages/TrainingDashboard"));
const TrainingCertification = lazy(() => import("./pages/TrainingCertification"));
const TrainingCourse = lazy(() => import("./pages/TrainingCourse"));
const MockExam = lazy(() => import("./pages/MockExam"));
const Login = lazy(() => import("./pages/Login"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const DiagnosticIA = lazy(() => import("./pages/DiagnosticIA"));
const AdvancedDiagnosticIA = lazy(() => import("./pages/AdvancedDiagnosticIA"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TrainingProgressArea = lazy(() => import("./components/TrainingProgressArea"));
const DeferredAuthenticatedOverlays = lazy(() => import("./components/DeferredAuthenticatedOverlays").then((module) => ({ default: module.DeferredAuthenticatedOverlays })));

// ─── Loading fallback ───
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Chargement...</p>
      </div>
    </div>
  );
}

function TrainingDashboardRoute() { return <TrainingProgressArea><TrainingDashboard /></TrainingProgressArea>; }
function TrainingCertificationRoute() { return <TrainingProgressArea><TrainingCertification /></TrainingProgressArea>; }
function TrainingCourseRoute() { return <TrainingProgressArea><TrainingCourse /></TrainingProgressArea>; }
function MockExamRoute() { return <TrainingProgressArea><MockExam /></TrainingProgressArea>; }

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/ai-news"} component={AiNews} />
        <Route path={"/refer"} component={ReferralLanding} />
        <Route path={"/apply"} component={Apply} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/admin/training"} component={AdminTraining} />
        <Route path={"/admin/content"} component={AdminContentManager} />
        <Route path={"/admin/media"} component={AdminMediaLibrary} />
        <Route path={"/admin/errors"} component={AdminErrors} />
        <Route path={"/mentions-legales"} component={MentionsLegales} />
        <Route path={"/training"} component={TrainingDashboardRoute} />
        <Route path={"/training/:certId"} component={TrainingCertificationRoute} />
        <Route path={"/training/:certId/:courseId"} component={TrainingCourseRoute} />
        <Route path={"/mock-exam/:certId"} component={MockExamRoute} />
        <Route path={"/accept-invitation"} component={AcceptInvitation} />
        <Route path={"/login"} component={Login} />
        <Route path={"/demo-login"} component={Login} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/reset-password"} component={ResetPassword} />
        <Route path={"/diagnostic"} component={DiagnosticIA} />
        <Route path={"/diagnostic-avance"} component={AdvancedDiagnosticIA} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Suspense fallback={null}><DeferredAuthenticatedOverlays /></Suspense>
            <Router />
            <DeferredCookieConsent />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
