import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CustomerManagement from "@/pages/CustomerManagement";
import TaskManagement from "@/pages/TaskManagement";
import WithdrawalManagement from "@/pages/WithdrawalManagement";
import UserManagement from "@/pages/UserManagement";
import MasterData from "@/pages/MasterData";
import VIPLevel from "@/pages/VIPLevel";
import TasklistExpiration from "@/pages/TasklistExpiration";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/customer-management" component={CustomerManagement} />
        <Route path="/task-management" component={TaskManagement} />
        <Route path="/withdrawal-management" component={WithdrawalManagement} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/master-data" component={MasterData} />
        <Route path="/vip-level" component={VIPLevel} />
        <Route path="/tasklist-expiration" component={TasklistExpiration} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
