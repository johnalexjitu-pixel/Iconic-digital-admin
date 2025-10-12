import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import "./i18n/config";
import { useEffect } from "react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CustomerManagement from "@/pages/CustomerManagement";
import CreateCustomer from "@/pages/CreateCustomer";
import EditCustomerProfile from "@/pages/EditCustomerProfile";
import TaskManagement from "@/pages/TaskManagement";
import WithdrawalManagement from "@/pages/WithdrawalManagement";
import UserManagement from "@/pages/UserManagement";
import AdminCreate from "@/pages/AdminCreate";
import AdminList from "@/pages/AdminList";
import DeveloperNoticeManagement from "@/pages/DeveloperNoticeManagement";
import MasterData from "@/pages/MasterData";
import VIPLevel from "@/pages/VIPLevel";
import TasklistExpiration from "@/pages/TasklistExpiration";
import NotFound from "@/pages/not-found";

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) {
    return null;
  }

  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  // If not logged in and not on login page, redirect to login
  useEffect(() => {
    if (!isLoggedIn && location !== "/login") {
      window.location.href = "/login";
    }
  }, [isLoggedIn, location]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/">
              <ProtectedRoute component={Dashboard} />
            </Route>
            <Route path="/customer-management">
              <ProtectedRoute component={CustomerManagement} />
            </Route>
            <Route path="/customer/create">
              <ProtectedRoute component={CreateCustomer} />
            </Route>
            <Route path="/customer/edit/:id">
              <ProtectedRoute component={EditCustomerProfile} />
            </Route>
            <Route path="/task-management">
              <ProtectedRoute component={TaskManagement} />
            </Route>
            <Route path="/withdrawal-management">
              <ProtectedRoute component={WithdrawalManagement} />
            </Route>
            <Route path="/user-management">
              <ProtectedRoute component={UserManagement} />
            </Route>
            <Route path="/admin-create">
              <ProtectedRoute component={AdminCreate} />
            </Route>
            <Route path="/admin-list">
              <ProtectedRoute component={AdminList} />
            </Route>
            <Route path="/developer-notice-management">
              <ProtectedRoute component={DeveloperNoticeManagement} />
            </Route>
            <Route path="/master-data">
              <ProtectedRoute component={MasterData} />
            </Route>
            <Route path="/vip-level">
              <ProtectedRoute component={VIPLevel} />
            </Route>
            <Route path="/tasklist-expiration">
              <ProtectedRoute component={TasklistExpiration} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
