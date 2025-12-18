import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import RoleSelect from "./pages/RoleSelect";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import BrandOnboarding from "./pages/BrandOnboarding";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import Marketplace from "./pages/Marketplace";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import ContractView from "./pages/ContractView";
import AdminDashboard from "./pages/AdminDashboard";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import DevLogin from "./pages/DevLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={DevLogin} />
      <Route path="/select-role" component={RoleSelect} />
      <Route path="/onboarding/creator" component={CreatorOnboarding} />
      <Route path="/onboarding/brand" component={BrandOnboarding} />
      <Route path="/dashboard/creator" component={CreatorDashboard} />
      <Route path="/dashboard/brand" component={BrandDashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/campaign/create" component={CreateCampaign} />
      <Route path="/campaign/:id" component={CampaignDetail} />
      <Route path="/contract/:id" component={ContractView} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={Messages} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
