import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function CustomerManagement() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-02");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    username: "",
    code: "",
    ipAddress: "",
    phoneNumber: "",
    customerStatus: "all",
    onlineStatus: "all"
  });
  const [isFiltered, setIsFiltered] = useState(false);
  
  // Edit Balance Modal State
  const [editBalanceModal, setEditBalanceModal] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceOperation, setBalanceOperation] = useState<"add" | "subtract">("add");

  // Task Details Modal State
  const [taskDetailsModal, setTaskDetailsModal] = useState<{
    open: boolean;
    customer: any;
    activeTab: string;
  }>({
    open: false,
    customer: null,
    activeTab: "allTask"
  });

  // Task Edit Modal State
  const [taskEditModal, setTaskEditModal] = useState<{
    open: boolean;
    taskNumber: number;
    campaign: any;
    taskCommission: string;
    expiredDate: string;
    negativeAmount: string;
    priceFrom: string;
    priceTo: string;
    selectedOption: string;
    hasGoldenEgg: boolean;
  }>({
    open: false,
    taskNumber: 0,
    campaign: null,
    taskCommission: "",
    expiredDate: "",
    negativeAmount: "",
    priceFrom: "",
    priceTo: "",
    selectedOption: "",
    hasGoldenEgg: false
  });

  // Task Price Editing State
  const [taskPrices, setTaskPrices] = useState<Record<string, number>>({});

  // Golden Egg Edit Modal State
  const [goldenEggModal, setGoldenEggModal] = useState<{
    open: boolean;
    taskNumber: number;
    campaign: any;
    taskPrice: string;
  }>({
    open: false,
    taskNumber: 0,
    campaign: null,
    taskPrice: ""
  });

  // Fetch customer-specific tasks
  const { data: customerTasksData, refetch: refetchCustomerTasks } = useQuery<{
    success: boolean;
    data: any[];
    total: number;
  }>({
    queryKey: ["/api/frontend/customer-tasks", taskDetailsModal.customer?.id],
    queryFn: async () => {
      if (!taskDetailsModal.customer?.id) return { success: true, data: [], total: 0 };
      console.log("📋 Fetching tasks for customer ID:", taskDetailsModal.customer.id);
      const response = await fetch(`/api/frontend/customer-tasks/${taskDetailsModal.customer.id}`);
      if (!response.ok) {
        console.error("❌ API response not ok:", response.status, response.statusText);
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      console.log("📥 Customer tasks response:", data);
      console.log("📊 Data length:", data.data?.length);
      console.log("📊 Total:", data.total);
      return data;
    },
    enabled: taskDetailsModal.open && !!taskDetailsModal.customer?.id,
  });

  // Fetch combo tasks for combo task setting
  const { data: comboTasksData, refetch: refetchComboTasks } = useQuery<{
    success: boolean;
    data: any[];
    total: number;
  }>({
    queryKey: ["/api/frontend/combo-tasks", taskDetailsModal.customer?.id],
    queryFn: async () => {
      if (!taskDetailsModal.customer?.id) return { success: true, data: [], total: 0 };
      console.log("🎯 Fetching combo tasks for customer ID:", taskDetailsModal.customer.id);
      const response = await fetch(`/api/frontend/combo-tasks/${taskDetailsModal.customer.id}`);
      const data = await response.json();
      console.log("🎯 Combo tasks response:", data);
      console.log("🎯 Combo tasks data length:", data.data?.length);
      console.log("🎯 Combo tasks total:", data.total);
      console.log("🎯 Expected: 30 combo tasks");
      return data;
    },
    enabled: taskDetailsModal.open && !!taskDetailsModal.customer?.id && taskDetailsModal.activeTab === "comboTaskSetting",
  });

  // Mutation for updating customer task settings
  const updateCustomerTaskMutation = useMutation({
    mutationFn: async ({ customerId, taskNumber, data }: { customerId: string; taskNumber: number; data: any }) => {
      const response = await fetch(`/api/frontend/customer-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          taskNumber,
          ...data
        }),
      });
      if (!response.ok) throw new Error("Failed to update customer task");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate customer tasks query to force refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/customer-tasks"] });
    },
  });

  // Mutation for toggling user account status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/frontend/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to toggle user status");
      return response.json();
    },
    onSuccess: () => {
      // Refresh user list to show updated status
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
    },
  });

  const handleTaskClick = (task: any, taskNumber: number) => {
    setTaskEditModal({
      open: true,
      taskNumber,
      campaign: task,
      taskCommission: task.taskCommission?.toString() || "0",
      expiredDate: task.expiredDate 
        ? new Date(task.expiredDate).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      negativeAmount: task.estimatedNegativeAmount?.toString() || "0",
      priceFrom: task.priceFrom?.toString() || "0",
      priceTo: task.priceTo?.toString() || "0",
      selectedOption: "",
      hasGoldenEgg: task.hasGoldenEgg || false
    });
  };

  const handleTaskEditSave = async () => {
    if (!taskEditModal.campaign || !taskDetailsModal.customer?.id) return;

    try {
      await updateCustomerTaskMutation.mutateAsync({
        customerId: taskDetailsModal.customer.id,
        taskNumber: taskEditModal.taskNumber,
        data: {
          taskCommission: Number(taskEditModal.taskCommission),
          taskPrice: Number(taskEditModal.campaign?.taskPrice || 0),
          expiredDate: taskEditModal.expiredDate,
          estimatedNegativeAmount: Number(taskEditModal.negativeAmount),
          priceFrom: Number(taskEditModal.priceFrom),
          priceTo: Number(taskEditModal.priceTo),
          hasGoldenEgg: taskEditModal.hasGoldenEgg,
        },
      });

      toast({
        title: t("success") || "Success",
        description: t("taskSettingsSaved") || "Task settings saved successfully",
      });

      setTaskEditModal({
        open: false,
        taskNumber: 0,
        campaign: null,
        taskCommission: "",
        expiredDate: "",
        negativeAmount: "",
        priceFrom: "",
        priceTo: "",
        selectedOption: ""
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("failedToSaveTaskSettings") || "Failed to save task settings",
        variant: "destructive",
      });
    }
  };

  const handleGoldenEggClick = (task: any, taskNumber: number) => {
    setGoldenEggModal({
      open: true,
      taskNumber,
      campaign: task,
      taskPrice: task.taskPrice?.toString() || "0"
    });
  };

  const handleGoldenEggToggle = async (task: any, checked: boolean) => {
    try {
      console.log("🟡 Toggling golden egg for task:", task.taskNumber, "to:", checked);
      
      if (!taskDetailsModal.customer?.id) {
        throw new Error("Customer ID not found");
      }

      // Call API to toggle golden egg
      const response = await apiRequest("PATCH", `/api/frontend/combo-tasks/${taskDetailsModal.customer.id}/toggle-golden-egg`, {
        taskNumber: task.taskNumber,
        hasGoldenEgg: checked
      });

      const result = await response.json();
      
      console.log("🟡 Golden egg toggle response:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle golden egg");
      }

      // Update the task data in the current combo tasks
      setComboTasksData(prevData => 
        prevData.map(t => 
          t.taskNumber === task.taskNumber 
            ? { ...t, hasGoldenEgg: checked }
            : t
        )
      );

      // Show success message
      toast({
        title: "Success",
        description: `Golden egg ${checked ? 'activated' : 'deactivated'} for Task ${task.taskNumber}`,
      });

      // Invalidate queries to refresh data
      console.log("🔄 Invalidating combo tasks query after golden egg toggle");
      await queryClient.invalidateQueries({ queryKey: ["/api/frontend/combo-tasks", taskDetailsModal.customer?.id] });
      
      // Also refetch the combo tasks data
      console.log("🔄 Refetching combo tasks data");
      await refetchComboTasks();
      
    } catch (error: any) {
      console.error("❌ Error toggling golden egg:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle golden egg",
        variant: "destructive",
      });
    }
  };

  const handleTaskPriceChange = (task: any, value: string) => {
    // Allow empty string, negative numbers, and positive numbers
    if (value === '' || value === '-') {
      setTaskPrices(prev => ({
        ...prev,
        [task._id]: value
      }));
    } else {
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setTaskPrices(prev => ({
          ...prev,
          [task._id]: price
        }));
      }
    }
  };

  const handleSaveTaskPrice = async (task: any) => {
    try {
      console.log("💰 Saving task price:", task.taskNumber, "price:", taskPrices[task._id]);
      
      if (!taskDetailsModal.customer?.id) {
        throw new Error("Customer ID not found");
      }

      const newPrice = taskPrices[task._id];
      if (newPrice === undefined || newPrice === null || newPrice === '') {
        throw new Error("Please enter a valid price");
      }
      
      // Allow negative prices for special cases
      const numericPrice = parseFloat(newPrice);
      if (isNaN(numericPrice)) {
        throw new Error("Please enter a valid numeric price");
      }

      // Call API to save task price
      const response = await apiRequest("PATCH", `/api/frontend/combo-tasks/${taskDetailsModal.customer.id}/save-task-price`, {
        taskNumber: task.taskNumber,
        taskPrice: numericPrice,
        customerId: taskDetailsModal.customer.id
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save task price");
      }

      // Show success message
      toast({
        title: "Success",
        description: `Task ${task.taskNumber} price updated to ${numericPrice}`,
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/frontend/combo-tasks"] });
      
    } catch (error: any) {
      console.error("❌ Error saving task price:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save task price",
        variant: "destructive",
      });
    }
  };

  const handleGoldenEggSave = async () => {
    if (!goldenEggModal.campaign || !taskDetailsModal.customer?.id) return;

    try {
      await updateCustomerTaskMutation.mutateAsync({
        customerId: taskDetailsModal.customer.id,
        taskNumber: goldenEggModal.taskNumber,
        data: {
          taskCommission: goldenEggModal.campaign.taskCommission || 0,
          taskPrice: goldenEggModal.taskPrice,
          expiredDate: goldenEggModal.campaign.expiredDate || new Date(),
          negativeAmount: goldenEggModal.campaign.estimatedNegativeAmount || 0,
          priceFrom: goldenEggModal.campaign.priceFrom || 0,
          priceTo: goldenEggModal.campaign.priceTo || 0,
        },
      });

      toast({
        title: t("success") || "Success",
        description: t("taskPriceUpdated") || "Task price updated successfully",
      });

      setGoldenEggModal({
        open: false,
        taskNumber: 0,
        campaign: null,
        taskPrice: ""
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("failedToUpdateTaskPrice") || "Failed to update task price",
        variant: "destructive",
      });
    }
  };

  const handleAllowTask = async (customer: any) => {
    console.log("🎯 Allow task clicked for customer:", customer);
    
    try {
      // Call API to allow customer and initialize 30 tasks
      const response = await fetch(`/api/frontend/customer-tasks/allow/${customer.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Failed to allow tasks");
      }
      
      const data = await response.json();
      console.log("✅ Customer tasks initialized:", data);
      
      // Show success message
      toast({
        title: t("success") || "Success",
        description: `${data.tasksInitialized} tasks have been initialized and ${customer.username} is now allowed to start tasks!`,
      });
      
      // Refresh customer list to show updated allowTask status
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/customer-tasks"] });
      
    } catch (error: any) {
      console.error("❌ Error allowing tasks:", error);
      toast({
        title: t("error") || "Error",
        description: error.message || "Failed to allow tasks",
        variant: "destructive",
      });
    }
  };

  // Fetch customers from local storage (empty now)
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Build query parameters for API
  const queryParams = new URLSearchParams();
  queryParams.append("limit", "100");
  
  // Always include filters if they have values (like TaskManagement style)
  if (filters.username) queryParams.append("search", filters.username);
  if (filters.code) queryParams.append("membershipId", filters.code);
  if (filters.phoneNumber) queryParams.append("phoneNumber", filters.phoneNumber);
  if (filters.customerStatus && filters.customerStatus !== "all") {
    queryParams.append("isActive", filters.customerStatus === "active" ? "true" : "false");
  }
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  // Fetch users from MongoDB frontend database
  const { data: frontendUsers, isLoading: frontendUsersLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/users", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/frontend/users?${queryParams.toString()}`;
      console.log("🔍 Frontend users API URL:", url);
      console.log("🔍 Query params:", queryParams.toString());
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log("📥 Frontend users response:", data);
      return data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const handleCreateCustomer = () => {
    setLocation("/customer/create");
  };

  const handleEditBalance = async (customer: any) => {
    console.log("📝 Opening edit balance modal for customer:", customer);
    
    // Refetch latest data before opening modal
    await queryClient.refetchQueries({ queryKey: ["/api/frontend/users"] });
    
    // Find the latest customer data
    const latestUsers = queryClient.getQueryData(["/api/frontend/users"]) as any;
    const latestCustomer = latestUsers?.data?.find((u: any) => u._id === customer.id);
    
    console.log("📊 Latest customer data:", latestCustomer);
    
    // Update customer object with latest balance
    const updatedCustomer = {
      ...customer,
      walletBalance: latestCustomer?.accountBalance?.toString() || customer.walletBalance,
      actualWalletBalance: latestCustomer?.accountBalance?.toString() || customer.actualWalletBalance,
    };
    
    console.log("💰 Current balance:", updatedCustomer.walletBalance);
    
    setEditBalanceModal({
      open: true,
      customer: updatedCustomer,
    });
    setBalanceAmount("");
    setBalanceOperation("add");
  };

  const handleOpenTaskDetails = (customer: any) => {
    console.log("📋 Opening task details for customer:", customer);
    setTaskDetailsModal({
      open: true,
      customer,
      activeTab: "allTask"
    });
  };

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: string; amount: number; operation: string }) => {
      console.log("📤 Updating balance:", { userId, amount, operation });
      const response = await apiRequest("PATCH", `/api/frontend/users/${userId}/balance`, { amount, operation });
      console.log("📥 Balance update response:", response);
      return response;
    },
    onSuccess: async (data: any) => {
      console.log("✅ Balance updated successfully:", data);
      
      // Force refetch to get updated data
      await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      await queryClient.refetchQueries({ queryKey: ["/api/frontend/users"] });
      
      toast({
        title: "✅ Success!",
        description: `Balance updated successfully. Old: $${data.oldBalance} → New: $${data.newBalance}`,
        duration: 5000,
      });
      
      // Close modal after a short delay to show success
      setTimeout(() => {
        setEditBalanceModal({ open: false, customer: null });
        setBalanceAmount("");
      }, 500);
    },
    onError: (error: any) => {
      console.error("❌ Error updating balance:", error);
      toast({
        title: "❌ Error!",
        description: error?.message || "Failed to update balance",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleBalanceSubmit = () => {
    if (!balanceAmount || Number(balanceAmount) <= 0) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      userId: editBalanceModal.customer.id,
      amount: Number(balanceAmount),
      operation: balanceOperation,
    });
  };

  // Filter functions - TaskManagement style
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
    } else if (field === 'endDate') {
      setEndDate(value);
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleApplyFilter = async () => {
    console.log("🔍 Applying filters:", filters);
    console.log("🔍 Date range:", { startDate, endDate });
    setIsFiltered(true);
    toast({
      title: "Success",
      description: "Filters applied successfully",
    });
    // Refetch with new filters - the query will automatically use new queryParams
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  const handleClearFilters = async () => {
    console.log("🔄 Clearing filters");
    setFilters({
      username: "",
      code: "",
      ipAddress: "",
      phoneNumber: "",
      customerStatus: "all",
      onlineStatus: "all"
    });
    setStartDate("2025-10-01");
    setEndDate("2025-10-02");
    setIsFiltered(false);
    toast({
      title: "Success",
      description: "Filters cleared successfully",
    });
    // Refetch all data
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatusMutation.mutateAsync(userId);
      toast({
        title: "Success",
        description: `User ${currentStatus ? 'suspended' : 'activated'} successfully`,
      });
    } catch (error: any) {
      console.error("❌ Error toggling user status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle user status",
        variant: "destructive",
      });
    }
  };

  // Use frontend users as customers
  const displayCustomers = frontendUsers?.data?.map((user: any) => ({
    id: user._id,
    code: user.membershipId,
    username: user.name,
    email: user.email,
    actualWalletBalance: user.accountBalance.toString(),
    walletBalance: user.accountBalance.toString(),
    loginPassword: user.password || "N/A",
    payPassword: user.withdrawalPassword || "N/A",
    phoneNumber: user.phoneNumber || "N/A",
    referralCode: user.referralCode,
    ipAddress: "N/A",
    ipCountry: "N/A",
    ipRegion: "N/A",
    ipISP: "N/A",
    vipLevel: user.level,
    taskCount: user.campaignsCompleted,
    completedTasks: user.campaignsCompleted,
    todayCompleted: 0,
    totalDeposit: "0",
    todayCommission: "0",
    totalCommission: user.totalEarnings.toString(),
    creditScore: user.creditScore,
    isActive: true,
    allowTask: true,
    allowCompleteTask: true,
    allowWithdraw: true,
    allowReferral: true,
    createdBy: "System",
    updatedBy: "System",
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.createdAt),
  })) || [];

  if (isLoading || frontendUsersLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('customerManagement')}</h2>
          <Button 
            data-testid="button-create-customer"
            onClick={handleCreateCustomer}
          >
            {t('createCustomer')}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*{t('createdDate')}:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('loginUserName')}:</Label>
            <Input 
              data-testid="input-username" 
              className="mt-1" 
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input 
              data-testid="input-code" 
              className="mt-1" 
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="Enter code"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('ipAddress')}:</Label>
            <Input 
              data-testid="input-ip" 
              className="mt-1" 
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              placeholder="Enter IP address"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('phoneNumber')}:</Label>
            <Input 
              data-testid="input-phone" 
              className="mt-1" 
              value={filters.phoneNumber}
              onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('customerStatus')}:</Label>
            <Select value={filters.customerStatus} onValueChange={(value) => handleFilterChange('customerStatus', value)}>
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue placeholder={t('pleaseSelectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('onlineOffline')}:</Label>
            <Select value={filters.onlineStatus} onValueChange={(value) => handleFilterChange('onlineStatus', value)}>
              <SelectTrigger data-testid="select-online-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="online">{t('online')}</SelectItem>
                <SelectItem value="offline">{t('offline')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button data-testid="button-filter" className="px-8" onClick={handleApplyFilter}>{t('filter')}</Button>
          <Button data-testid="button-clear-filter" variant="outline" className="px-8" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">{t('details')}</TableHead>
              <TableHead className="text-muted-foreground">{t('accountManagement')}</TableHead>
              <TableHead className="text-muted-foreground">{t('bankAccountDetails')}</TableHead>
              <TableHead className="text-muted-foreground">IP</TableHead>
              <TableHead className="text-muted-foreground">{t('taskPlan')}</TableHead>
              <TableHead className="text-muted-foreground">{t('setting')}</TableHead>
              <TableHead className="text-muted-foreground">{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCustomers?.map((customer: any, index: number) => (
              <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{28009 - index}</TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">{t('code')}:</span> {customer.code}</div>
                    <div><span className="text-muted-foreground">{t('userName')}:</span> {customer.username}</div>
                    <div><span className="text-muted-foreground">{t('email')}:</span> {customer.email}</div>
                    <div><span className="text-muted-foreground">{t('actualWalletBalance')}:</span> {customer.actualWalletBalance}</div>
                    <div><span className="text-muted-foreground">{t('walletBalance')}:</span> {customer.walletBalance}</div>
                    <div><span className="text-muted-foreground">{t('loginPassword')}:</span> {customer.loginPassword}</div>
                    <div><span className="text-muted-foreground">{t('payPassword')}:</span> {customer.payPassword}</div>
                    <div><span className="text-muted-foreground">{t('phoneNumber')}:</span> {customer.phoneNumber}</div>
                    <div><span className="text-muted-foreground">{t('referralCode')}:</span> {customer.referralCode}</div>
                    <div className="text-blue-600">{t('by')}: {customer.createdBy} {t('created')}</div>
                    <div><span className="text-muted-foreground">{t('by')}:</span> {customer.updatedBy} {t('updated')}</div>
                    <div><span className="text-muted-foreground">{t('updatedAt')}:</span> {customer.updatedAt?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{t('actualAccount')}</span>
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handleAllowTask(customer)}
                    >
                      {customer.allowTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowTask ? "text-blue-600" : ""}>
                        {customer.allowTask ? t('allowToStartTask') : t('notAllowedToStartTask')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowCompleteTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowCompleteTask ? "text-blue-600" : ""}>
                        {customer.allowCompleteTask ? t('allowToCompleteTask') : t('notAllowedToCompleteTask')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowWithdraw ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>{customer.allowWithdraw ? t('allowedToWithdraw') : t('notAllowedToWithdraw')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowReferral ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowReferral ? "text-blue-600" : ""}>
                        {customer.allowReferral ? t('allowToUseReferralCode') : t('notAllowedToUseReferralCode')}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">{t('phoneNumber')}:</span> {customer.phoneNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">{t('ipAddress')}:</span> {customer.ipAddress}</div>
                    <div><span className="text-muted-foreground">{t('ipCountry')}:</span> {customer.ipCountry}</div>
                    <div><span className="text-muted-foreground">{t('ipRegion')}:</span> {customer.ipRegion}</div>
                    <div><span className="text-muted-foreground">{t('ipISP')}:</span> {customer.ipISP}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">{t('level')}:</span> {customer.vipLevel}</div>
                    <div><span className="text-muted-foreground">{t('everyday')}:</span> {customer.taskCount}</div>
                    <div><span className="text-muted-foreground">{t('today')}:</span> {t('completed')}: {customer.todayCompleted} {t('task')}</div>
                    <div>{t('completed')}: {customer.completedTasks}</div>
                    <div><span className="text-muted-foreground">{t('totalDeposit')}:</span> $ {customer.totalDeposit}</div>
                    <div><span className="text-muted-foreground">{t('todayCommission')}:</span> $ {customer.todayCommission}</div>
                    <div><span className="text-muted-foreground">{t('totalCommission')}:</span> $ {customer.totalCommission}</div>
                    <div><span className="text-muted-foreground">{t('creditScore')}:</span> {customer.creditScore}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button 
                      data-testid={`button-task-${customer.id}`} 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleOpenTaskDetails(customer)}
                    >
                      {t('task')}
                    </Button>
                    <Button 
                      data-testid={`button-combo-${customer.id}`} 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setTaskDetailsModal({ open: true, customer, activeTab: "comboTaskSetting" })}
                    >
                      {t('comboTask')}
                    </Button>
                    <Button data-testid={`button-level-${customer.id}`} size="sm" className="text-xs">{t('level')}</Button>
                    <Button 
                      data-testid={`button-edit-balance-${customer.id}`} 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleEditBalance(customer)}
                    >
                      {t('editBalance')}
                    </Button>
                    <Button data-testid={`button-reset-task-${customer.id}`} size="sm" className="text-xs">{t('resetTask')}</Button>
                    <Button 
                      data-testid={`button-edit-profile-${customer.id}`} 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setLocation(`/customer/edit/${customer.id}`)}
                    >
                      {t('editProfile')}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    data-testid={`button-status-${customer.id}`}
                    variant={customer.isActive ? "default" : "destructive"}
                    size="sm"
                    className={customer.isActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
                    onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                  >
                    {customer.isActive ? t('activate') : t('suspend')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('rowsPerPage')}:</span>
            <Select defaultValue="100">
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{displayCustomers?.length} of {displayCustomers?.length}
          </div>
        </div>
      </div>

      {/* Edit Balance Modal */}
      <Dialog open={editBalanceModal.open} onOpenChange={(open) => setEditBalanceModal({ open, customer: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editCustomerBalance')}</DialogTitle>
          </DialogHeader>
          
          {editBalanceModal.customer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('customerInformation')}</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                  <div><span className="text-muted-foreground">{t('name')}:</span> {editBalanceModal.customer.username}</div>
                  <div><span className="text-muted-foreground">{t('code')}:</span> {editBalanceModal.customer.code}</div>
                  <div><span className="text-muted-foreground">{t('email')}:</span> {editBalanceModal.customer.email}</div>
                  <div className="font-semibold text-primary">
                    <span className="text-muted-foreground">{t('currentBalance')}:</span> ${editBalanceModal.customer.walletBalance}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation">{t('operation')}</Label>
                <Select value={balanceOperation} onValueChange={(value: "add" | "subtract") => setBalanceOperation(value)}>
                  <SelectTrigger id="operation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">{t('add')} (+)</SelectItem>
                    <SelectItem value="subtract">{t('subtract')} (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={t('enterAmount')}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {balanceAmount && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('newBalanceWillBe')}:</span>{" "}
                    <span className="font-semibold text-primary">
                      ${balanceOperation === "add" 
                        ? (Number(editBalanceModal.customer.walletBalance) + Number(balanceAmount)).toFixed(2)
                        : (Number(editBalanceModal.customer.walletBalance) - Number(balanceAmount)).toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditBalanceModal({ open: false, customer: null })}
              disabled={updateBalanceMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleBalanceSubmit}
              disabled={updateBalanceMutation.isPending}
            >
              {updateBalanceMutation.isPending ? t('updating') : t('updateBalance')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={taskDetailsModal.open} onOpenChange={(open) => setTaskDetailsModal({ ...taskDetailsModal, open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-semibold">{t('customerTaskDetails')}</DialogTitle>
              <button
                onClick={() => setTaskDetailsModal({ open: false, customer: null, activeTab: "allTask" })}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {taskDetailsModal.customer && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    taskDetailsModal.activeTab === "allTask"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setTaskDetailsModal({ ...taskDetailsModal, activeTab: "allTask" })}
                >
                  {t('allTask') || 'All Task'}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    taskDetailsModal.activeTab === "comboTaskSetting"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setTaskDetailsModal({ ...taskDetailsModal, activeTab: "comboTaskSetting" })}
                >
                  {t('comboTaskSetting') || 'Combo Task Setting'}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    taskDetailsModal.activeTab === "comboTaskHistory"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setTaskDetailsModal({ ...taskDetailsModal, activeTab: "comboTaskHistory" })}
                >
                  {t('comboTaskHistory') || 'Combo Task History'}
                </button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm text-muted-foreground">{t('code')}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.code}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t('loginUserName')}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.username}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t('completed')}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.completedTasks || 0}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t('currentTask') || 'Current Task'}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.taskCount || 0}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t('actualWalletBalance')}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.actualWalletBalance || 0}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t('walletBalance')}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.walletBalance || 0}</div>
                </div>
              </div>

              {/* Tab Content */}
              {taskDetailsModal.activeTab === "allTask" && (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('details')}</TableHead>
                        <TableHead>{t('price')}</TableHead>
                        <TableHead>{t('profit')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        console.log("🔍 Rendering table body with data:", customerTasksData?.data?.length);
                        console.log("🔍 First task:", customerTasksData?.data?.[0]);
                        return customerTasksData?.data?.map((task: any) => (
                        <TableRow key={task._id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">Task {task.taskNumber}</div>
                              <div className="text-sm text-muted-foreground">Code: {task.customerCode}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{task.taskPrice || 0}</TableCell>
                          <TableCell className="font-medium">{task.taskCommission || 0}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : task.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status || 'pending'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ));
                      })()}
                      {!customerTasksData?.data?.length && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            {t('noTasksFound') || 'No tasks found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {taskDetailsModal.activeTab === "comboTaskSetting" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{t('comboTaskNumber') || 'Combo Task Number'}</div>
                    <div className="text-sm text-muted-foreground">
                      Showing {comboTasksData?.data?.length || 0} future tasks
                      {taskDetailsModal.customer?.currentTask && (
                        <span className="ml-2 text-blue-600">
                          (Current: {taskDetailsModal.customer.currentTask})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>{t('taskCommission') || 'Task Commission'}</TableHead>
                        <TableHead>{t('taskPrice') || 'Task Price'}</TableHead>
                        <TableHead>{t('estimatedNegativeAmount') || 'Estimated Negative Amount'}</TableHead>
                        <TableHead className="text-center">{t('goldenEgg') || 'Golden Egg'}</TableHead>
                        <TableHead>{t('expiredDate') || 'Expired Date'}</TableHead>
                        <TableHead className="w-48"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        console.log("🎯 Rendering combo tasks table with data:", comboTasksData?.data?.length);
                        console.log("🎯 Combo tasks data:", comboTasksData?.data);
                        return comboTasksData?.data?.map((task: any) => {
                        const commission = task.taskCommission || 0;
                        const taskPrice = task.taskPrice || 0;
                        const estimatedNegative = task.estimatedNegativeAmount || 0;
                        const hasGoldenEgg = task.hasGoldenEgg || false;
                        const expiredDate = task.expiredDate 
                          ? new Date(task.expiredDate).toLocaleDateString() 
                          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

                        return (
                          <TableRow key={task._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span>Task {task.taskNumber}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Future
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {commission > 0 ? (
                                <span className="font-medium">{commission}</span>
                              ) : (
                                <span className="text-red-600">{t('notSet') || 'Not Set'}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={taskPrices[task._id] !== undefined ? taskPrices[task._id] : taskPrice}
                                  onChange={(e) => handleTaskPriceChange(task, e.target.value)}
                                  className="w-20 h-8 text-sm"
                                  placeholder="0"
                                  step="0.01"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveTaskPrice(task)}
                                  className="h-8 px-2 text-xs"
                                  disabled={taskPrices[task._id] === undefined || taskPrices[task._id] === null || taskPrices[task._id] === ''}
                                >
                                  {t('save')}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {estimatedNegative < 0 ? (
                                <span className="font-medium">{estimatedNegative}</span>
                              ) : (
                                <span className="text-red-600">{t('notSet') || 'Not Set'}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={hasGoldenEgg}
                                  onCheckedChange={(checked) => handleGoldenEggToggle(task, checked)}
                                  className="data-[state=checked]:bg-yellow-500"
                                />
                                <span className={`ml-2 text-sm font-medium ${
                                  hasGoldenEgg ? 'text-yellow-600' : 'text-gray-500'
                                }`}>
                                  {hasGoldenEgg ? t('activate') : t('inactive')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{expiredDate}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-primary"
                                  onClick={() => handleTaskClick(task, task.taskNumber)}
                                >
                                  {t('task')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      });
                      })()}
                      {!comboTasksData?.data?.length && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            {t('noTasksAvailable') || 'No tasks available'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}

              {taskDetailsModal.activeTab === "comboTaskHistory" && (
                <div className="p-4 text-center text-muted-foreground">
                  {t('comboTaskHistory') || 'Combo Task History'}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Edit Modal */}
      <Dialog open={taskEditModal.open} onOpenChange={(open) => setTaskEditModal({ ...taskEditModal, open })}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTaskEditModal({ ...taskEditModal, open: false })}
                className="flex items-center gap-2"
              >
                ← {t('back') || 'Back'}
              </Button>
              <DialogTitle className="text-lg">
                {t('task')} {taskEditModal.taskNumber} {t('comboTask')} (?)
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskCommission">{t('taskCommission') || 'Task Commission'} *</Label>
                <Input
                  id="taskCommission"
                  type="number"
                  value={taskEditModal.taskCommission}
                  onChange={(e) => setTaskEditModal({ ...taskEditModal, taskCommission: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="taskPrice">{t('taskPrice') || 'Task Price'} *</Label>
                <Input
                  id="taskPrice"
                  type="number"
                  value={taskEditModal.campaign?.taskPrice || 0}
                  onChange={(e) => setTaskEditModal({ 
                    ...taskEditModal, 
                    campaign: { ...taskEditModal.campaign, taskPrice: Number(e.target.value) }
                  })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiredDate">{t('expiredDate') || 'Expired Date'}</Label>
                <Input
                  id="expiredDate"
                  type="date"
                  value={taskEditModal.expiredDate}
                  onChange={(e) => setTaskEditModal({ ...taskEditModal, expiredDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="negativeAmount">{t('negativeAmountFrom') || 'Negative Amount From'} *</Label>
                <Input
                  id="negativeAmount"
                  type="number"
                  value={taskEditModal.negativeAmount}
                  onChange={(e) => setTaskEditModal({ ...taskEditModal, negativeAmount: e.target.value })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('searchTaskPriceFrom') || 'Search Task Price From'} *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={taskEditModal.priceFrom}
                    onChange={(e) => setTaskEditModal({ ...taskEditModal, priceFrom: e.target.value })}
                    placeholder="0"
                  />
                  <span className="flex items-center px-2">-</span>
                  <Input
                    type="number"
                    value={taskEditModal.priceTo}
                    onChange={(e) => setTaskEditModal({ ...taskEditModal, priceTo: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="taskOption"> </Label>
                <Select 
                  value={taskEditModal.selectedOption} 
                  onValueChange={(value) => setTaskEditModal({ ...taskEditModal, selectedOption: value })}
                >
                  <SelectTrigger id="taskOption" className="mt-1">
                    <SelectValue placeholder={t('select') || 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">{t('option1') || 'Option 1'}</SelectItem>
                    <SelectItem value="option2">{t('option2') || 'Option 2'}</SelectItem>
                    <SelectItem value="option3">{t('option3') || 'Option 3'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleTaskEditSave}
                className="px-12"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Golden Egg Edit Modal */}
      <Dialog open={goldenEggModal.open} onOpenChange={(open) => setGoldenEggModal({ ...goldenEggModal, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGoldenEggModal({ ...goldenEggModal, open: false })}
                className="flex items-center gap-2"
              >
                ← {t('back') || 'Back'}
              </Button>
              <DialogTitle className="text-lg">
                {t('task')} {goldenEggModal.taskNumber} {t('comboTask')} (?)
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="goldenEggPrice">{t('taskPrice') || 'Task Price'} *</Label>
              <Input
                id="goldenEggPrice"
                type="number"
                value={goldenEggModal.taskPrice}
                onChange={(e) => setGoldenEggModal({ ...goldenEggModal, taskPrice: e.target.value })}
                className="mt-2"
                placeholder="0"
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleGoldenEggSave}
                className="px-12 bg-yellow-500 hover:bg-yellow-600"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
