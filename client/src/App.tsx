import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { TrainingProgressProvider } from "./contexts/TrainingProgressContext";
import Home from "./pages/Home";
import Apply from "./pages/Apply";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTraining from "./pages/AdminTraining";
import MentionsLegales from "./pages/MentionsLegales";
import TrainingDashboard from "./pages/TrainingDashboard";
import TrainingCertification from "./pages/TrainingCertification";
import TrainingCourse from "./pages/TrainingCourse";
import MockExam from "./pages/MockExam";
import DemoLogin from "./pages/DemoLogin";
import DiagnosticIA from "./pages/DiagnosticIA";
import CookieConsent from "./components/CookieConsent";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/apply"} component={Apply} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/training"} component={AdminTraining} />
      <Route path={"/mentions-legales"} component={MentionsLegales} />
      <Route path={"/training"} component={TrainingDashboard} />
      <Route path={"/training/:certId"} component={TrainingCertification} />
      <Route path={"/training/:certId/:courseId"} component={TrainingCourse} />
      <Route path={"/mock-exam/:certId"} component={MockExam} />
      <Route path={"/demo-login"} component={DemoLogin} />
      <Route path={"/diagnostic"} component={DiagnosticIA} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <LanguageProvider>
          <TrainingProgressProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <CookieConsent />
            </TooltipProvider>
          </TrainingProgressProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
