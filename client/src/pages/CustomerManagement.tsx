import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function CustomerManagement() {
  const { t } = useTranslation();
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Edit Balance Modal State
  const [editBalanceModal, setEditBalanceModal] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceOperation, setBalanceOperation] = useState<"add" | "subtract" | "deposit" | "bonus">("add");
  
  // Deposit Modal State
  const [depositModal, setDepositModal] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [depositReference, setDepositReference] = useState("");
  
  // Bonus Modal State
  const [bonusModal, setBonusModal] = useState<{
    open: boolean;
    customer: any;
  }>({
    open: false,
    customer: null,
  });
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusType, setBonusType] = useState("");
  const [bonusReason, setBonusReason] = useState("");

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
    estimatedNegativeAmount: string;
    taskCommission: string;
  }>({
    open: false,
    taskNumber: 0,
    campaign: null,
    taskPrice: "",
    estimatedNegativeAmount: "",
    taskCommission: ""
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
    requiredTask?: number;
  }>({
    queryKey: ["/api/frontend/combo-tasks", taskDetailsModal.customer?.id, taskDetailsModal.customer?.requiredTask],
    queryFn: async () => {
      if (!taskDetailsModal.customer?.id) return { success: true, data: [], total: 0 };
      console.log("🎯 Fetching combo tasks for customer ID:", taskDetailsModal.customer.id);
      console.log("🎯 Customer requiredTask:", taskDetailsModal.customer.requiredTask);
      
      // Add cache-busting parameter
      const cacheBuster = Date.now();
      const response = await fetch(`/api/frontend/combo-tasks/${taskDetailsModal.customer.id}?t=${cacheBuster}`);
      const data = await response.json();
      console.log("🎯 Combo tasks response:", data);
      console.log("🎯 Combo tasks data length:", data.data?.length);
      console.log("🎯 Combo tasks total:", data.total);
      console.log("🎯 Required task from API:", data.requiredTask);
      console.log("🎯 Expected tasks based on requiredTask:", data.requiredTask || 30);
      console.log("🎯 Debug info from API:", data.debug);
      console.log("🎯 API timestamp:", data.timestamp);
      return data;
    },
    enabled: taskDetailsModal.open && !!taskDetailsModal.customer?.id && taskDetailsModal.activeTab === "comboTaskSetting",
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
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
    try {
      console.log("🎯 Task clicked:", { taskNumber, task });
      console.log("🎯 Task data:", {
        taskCommission: task.taskCommission,
        estimatedNegativeAmount: task.estimatedNegativeAmount,
        priceFrom: task.priceFrom,
        priceTo: task.priceTo,
        hasGoldenEgg: task.hasGoldenEgg,
        expiredDate: task.expiredDate
      });

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
      
      console.log("✅ Task edit modal opened successfully");
    } catch (error) {
      console.error("❌ Error opening task edit modal:", error);
      toast({
        title: "Error",
        description: "Failed to open task editor",
        variant: "destructive",
      });
    }
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
          hasGoldenEgg: false, // Set to false when saving from task edit modal
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
        selectedOption: "",
        hasGoldenEgg: false
      });
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("failedToSaveTaskSettings") || "Failed to save task settings",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async () => {
    if (!taskEditModal.campaign || !taskDetailsModal.customer?.id) return;

    try {
      // Call the save-complete-task endpoint with status: 'completed'
      const response = await apiRequest("PATCH", `/api/frontend/combo-tasks/${taskDetailsModal.customer.id}/save-complete-task`, {
        taskNumber: taskEditModal.taskNumber,
        taskCommission: Number(taskEditModal.taskCommission),
        taskPrice: Number(taskEditModal.campaign?.taskPrice || 0),
        expiredDate: taskEditModal.expiredDate,
        estimatedNegativeAmount: Number(taskEditModal.negativeAmount),
        priceFrom: Number(taskEditModal.priceFrom),
        priceTo: Number(taskEditModal.priceTo),
        hasGoldenEgg: false,
        status: 'completed' // This will trigger the deletion logic
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to complete task");
      }

      toast({
        title: t("success") || "Success",
        description: `Task ${taskEditModal.taskNumber} completed and removed from database`,
      });

      // Close modal
      setTaskEditModal({
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

      // Refresh combo tasks data
      await refetchComboTasks();
      
    } catch (error: any) {
      console.error("❌ Error completing task:", error);
      toast({
        title: t("error") || "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const handleGoldenEggClick = (task: any, taskNumber: number) => {
    setGoldenEggModal({
      open: true,
      taskNumber,
      campaign: task,
      taskPrice: task.taskPrice?.toString() || "0",
      estimatedNegativeAmount: task.estimatedNegativeAmount?.toString() || "0",
      taskCommission: task.taskCommission?.toString() || "0"
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
      // Note: This will be handled by the refetch below

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
    try {
      const taskKey = task._id || `task-${task.taskNumber}`;
      console.log("💰 Task price change:", { taskKey, value, task });
      
      // Allow empty string, negative numbers, and positive numbers
      if (value === '' || value === '-') {
        setTaskPrices(prev => ({
          ...prev,
          [taskKey]: value
        }));
      } else {
        const price = parseFloat(value);
        if (!isNaN(price)) {
          setTaskPrices(prev => ({
            ...prev,
            [taskKey]: price
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error in handleTaskPriceChange:", error);
    }
  };

  const handleSaveTaskPrice = async (task: any) => {
    try {
      const taskKey = task._id || `task-${task.taskNumber}`;
      console.log("💰 Saving task price:", task.taskNumber, "price:", taskPrices[taskKey]);
      
      if (!taskDetailsModal.customer?.id) {
        throw new Error("Customer ID not found");
      }

      const newPrice = taskPrices[taskKey];
      if (newPrice === undefined || newPrice === null) {
        throw new Error("Please enter a valid price");
      }
      
      // Allow negative prices for special cases
      const numericPrice = parseFloat(newPrice.toString());
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

  // Function to refresh combo tasks
  const refreshComboTasks = async () => {
    console.log("🔄 Manually refreshing combo tasks...");
    await refetchComboTasks();
  };

  const handleGoldenEggSave = async () => {
    if (!goldenEggModal.campaign || !taskDetailsModal.customer?.id) return;

    try {
      console.log("🥚 Saving golden egg data:", {
        taskNumber: goldenEggModal.taskNumber,
        taskPrice: goldenEggModal.taskPrice,
        estimatedNegativeAmount: goldenEggModal.estimatedNegativeAmount,
        taskCommission: goldenEggModal.taskCommission
      });
      
      // Call the golden egg price update API endpoint
      const response = await apiRequest("PATCH", `/api/frontend/combo-tasks/${taskDetailsModal.customer.id}/golden-egg-price-update`, {
        taskNumber: goldenEggModal.taskNumber,
        taskPrice: Number(goldenEggModal.taskPrice),
        estimatedNegativeAmount: Number(goldenEggModal.estimatedNegativeAmount),
        taskCommission: Number(goldenEggModal.taskCommission),
        hasGoldenEgg: true // Automatically set golden egg to true when price is saved
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save golden egg data");
      }

      toast({
        title: "Success",
        description: `Golden egg activated and data updated for Task ${goldenEggModal.taskNumber}`,
      });

      // Close modal
      setGoldenEggModal({
        open: false,
        taskNumber: 0,
        campaign: null,
        taskPrice: "",
        estimatedNegativeAmount: "",
        taskCommission: ""
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/frontend/combo-tasks", taskDetailsModal.customer?.id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/frontend/customer-tasks", taskDetailsModal.customer?.id] });
      await refetchComboTasks();
      
    } catch (error: any) {
      console.error("❌ Error saving golden egg data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save golden egg data",
        variant: "destructive",
      });
    }
  };

  // Toggle campaign status (EXACT same as withdrawStatus approach)
  const handleToggleCampaignStatus = async (customer: any) => {
    try {
      const newStatus = customer.allowTask ? 'inactive' : 'active';
      const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}`, {
        campaignStatus: newStatus
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Campaign status updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  // Toggle account status
  const handleToggleAccountStatus = async (customer: any) => {
    try {
      const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}/toggle-status`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Account status updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
    }
  };

  // Toggle withdraw status
  const handleToggleWithdrawStatus = async (customer: any) => {
    try {
      // Check if this is for campaignStatus (allowTask) or withdrawStatus
      const isCampaignStatus = customer.allowWithdraw === customer.allowTask;
      
      if (isCampaignStatus) {
        // This is for campaign status
        const newStatus = customer.allowTask ? 'inactive' : 'active';
        const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}`, {
          campaignStatus: newStatus
        });
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Success",
            description: "Campaign status updated successfully",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
        }
      } else {
        // This is for withdraw status
        const newStatus = customer.allowWithdraw ? 'inactive' : 'active';
        const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}`, {
          withdrawStatus: newStatus
        });
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Success",
            description: "Withdraw status updated successfully",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Toggle referral status
  const handleToggleReferralStatus = async (customer: any) => {
    try {
      const newStatus = customer.allowReferral ? 'inactive' : 'active';
      const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}`, {
        referStatus: newStatus
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Referral status updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update referral status",
        variant: "destructive",
      });
    }
  };

  // Reset task completion count and delete all customer tasks history
  const handleResetTask = async (customer: any) => {
    try {
      // Reset campaignsCompleted to 0 - this will automatically delete customer tasks history
      const response = await apiRequest("PATCH", `/api/frontend/users/${customer.id}`, {
        campaignsCompleted: 0
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.data?.tasksDeleted ? 
            `Task completion count and ${result.data.tasksDeleted} tasks history reset successfully` :
            "Task completion count reset successfully",
        });
        
        // Refresh both users and combo tasks data
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/combo-tasks", customer.id] });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reset task completion count and history",
        variant: "destructive",
      });
    }
  };


  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || !depositMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/frontend/deposits", {
        userId: depositModal.customer.id,
        amount: Number(depositAmount),
        method: depositMethod,
        reference: depositReference,
        status: "completed"
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Deposit recorded successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
        setDepositModal({ open: false, customer: null });
        setDepositAmount("");
        setDepositMethod("");
        setDepositReference("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to record deposit",
        variant: "destructive",
      });
    }
  };

  // Handle bonus
  const handleBonus = async () => {
    if (!bonusAmount || !bonusType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/frontend/bonuses", {
        userId: bonusModal.customer.id,
        amount: Number(bonusAmount),
        type: bonusType,
        reason: bonusReason,
        status: "active"
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Bonus added successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
        setBonusModal({ open: false, customer: null });
        setBonusAmount("");
        setBonusType("");
        setBonusReason("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add bonus",
        variant: "destructive",
      });
    }
  };

  // Fetch customers from local storage (empty now)
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Build query parameters for API using useMemo for proper reactivity
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("limit", itemsPerPage.toString());
    params.append("page", currentPage.toString());
    
    console.log("🔧 Pagination Debug:", { currentPage, itemsPerPage });
    
    // Only apply filters if filter button was clicked (isFiltered is true)
    if (isFiltered) {
      console.log("🔍 Building query params with filters:", filters);
      if (filters.username) {
        params.append("username", filters.username);
        console.log("✅ Added username filter:", filters.username);
      }
      if (filters.code) {
        params.append("membershipId", filters.code);
        console.log("✅ Added code filter:", filters.code);
      }
      if (filters.ipAddress) {
        params.append("ipAddress", filters.ipAddress);
        console.log("✅ Added IP address filter:", filters.ipAddress);
      }
      if (filters.phoneNumber) {
        params.append("phoneNumber", filters.phoneNumber);
        console.log("✅ Added phone number filter:", filters.phoneNumber);
      }
      if (filters.customerStatus && filters.customerStatus !== "all") {
        params.append("isActive", filters.customerStatus === "active" ? "true" : "false");
        console.log("✅ Added customer status filter:", filters.customerStatus);
      }
      if (filters.onlineStatus && filters.onlineStatus !== "all") {
        params.append("onlineStatus", filters.onlineStatus);
        console.log("✅ Added online status filter:", filters.onlineStatus);
      }
    }
    
    return params;
  }, [currentPage, itemsPerPage, isFiltered, filters]);

  // Fetch users from MongoDB frontend database
  const { data: frontendUsers, isLoading: frontendUsersLoading, error: frontendUsersError } = useQuery<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["/api/frontend/users", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/frontend/users?${queryParams.toString()}`;
      console.log("🔍 Frontend users API URL:", url);
      console.log("🔍 Query params:", queryParams.toString());
      console.log("🔍 Is Filtered:", isFiltered);
      console.log("🔍 Current filters state:", filters);
      const response = await fetch(url, {
        cache: 'no-store', // Force fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log("📥 Frontend users response:", data);
      
      // Fallback pagination for Vercel deployment
      if (!data.pagination && data.data) {
        console.log("⚠️ No pagination data, creating fallback");
        data.pagination = {
          page: currentPage,
          limit: itemsPerPage,
          total: data.data.length,
          pages: Math.ceil(data.data.length / itemsPerPage)
        };
      }
      
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
      membershipId: latestCustomer?.membershipId || customer.membershipId || customer.code,
    };
    
    console.log("💰 Current balance:", updatedCustomer.walletBalance);
    console.log("📊 Updated customer data:", {
      id: updatedCustomer.id,
      membershipId: updatedCustomer.membershipId,
      code: updatedCustomer.code,
      walletBalance: updatedCustomer.walletBalance
    });
    
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
      console.log("📤 Using userId type:", typeof userId, "length:", userId?.length);
      console.log("📤 Full API URL:", `/api/frontend/users/${userId}/balance`);
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

    if (balanceOperation === "deposit") {
      setDepositModal({ open: true, customer: editBalanceModal.customer });
      setDepositAmount(balanceAmount);
      setEditBalanceModal({ open: false, customer: null });
      return;
    }

    if (balanceOperation === "bonus") {
      setBonusModal({ open: true, customer: editBalanceModal.customer });
      setBonusAmount(balanceAmount);
      setEditBalanceModal({ open: false, customer: null });
      return;
    }

    const customerId = editBalanceModal.customer.membershipId || editBalanceModal.customer.code || editBalanceModal.customer.id;
    console.log("📤 Customer data:", {
      id: editBalanceModal.customer.id,
      membershipId: editBalanceModal.customer.membershipId,
      code: editBalanceModal.customer.code,
      selectedId: customerId
    });
    
    // Force use membershipId/code instead of ObjectId
    const finalCustomerId = editBalanceModal.customer.membershipId || editBalanceModal.customer.code;
    console.log("🔧 FORCING customer ID to:", finalCustomerId, "instead of ObjectId");
    
    if (!finalCustomerId) {
      toast({
        title: "Error",
        description: "Customer membership ID not found",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      userId: finalCustomerId,
      amount: Number(balanceAmount),
      operation: balanceOperation,
    });
  };

  // Filter functions - Clean and efficient implementation
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Don't reset filter state immediately - let user decide when to apply
  };

  const handleApplyFilter = async () => {
    console.log("🔍 Applying filters:", filters);
    console.log("🔍 Filter details:", {
      username: filters.username,
      code: filters.code,
      ipAddress: filters.ipAddress,
      phoneNumber: filters.phoneNumber,
      customerStatus: filters.customerStatus,
      onlineStatus: filters.onlineStatus
    });
    setIsFiltered(true);
    setCurrentPage(1); // Reset to first page when applying filters
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
    setIsFiltered(false);
    setCurrentPage(1); // Reset to first page when clearing filters
    toast({
      title: "Success",
      description: "Filters cleared successfully",
    });
    // Refetch all data
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: string) => {
    setItemsPerPage(Number(newItemsPerPage));
    setCurrentPage(1); // Reset to first page when changing items per page
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
  const displayCustomers = frontendUsers?.data?.map((user: any) => {
    // Debug: Log user data including phone number
    console.log("🔍 Debug user data:", { 
      username: user.username, 
      phoneNumber: user.phoneNumber,
      number: user.number,
      email: user.email,
      membershipId: user.membershipId
    });
    
    return {
    id: user._id,
    code: user.membershipId,
    username: user.username || user.name,
    email: user.number || user.email,
    actualWalletBalance: user.accountBalance.toString(),
    walletBalance: user.accountBalance.toString(),
    loginPassword: user.password || "N/A",
    payPassword: user.withdrawalPassword || "N/A",
    phoneNumber: user.phoneNumber || user.number || "N/A",
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
    isActive: user.accountStatus === 'active',
    allowTask: user.campaignStatus === 'active',
    allowCompleteTask: user.allowTask,
    allowWithdraw: user.withdrawStatus === 'active',
    allowReferral: user.referStatus === 'active',
    createdBy: "System",
    updatedBy: "System",
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.createdAt),
  };
  }) || [];

  if (isLoading || frontendUsersLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // Handle error state
  if (frontendUsersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">
            {frontendUsersError instanceof Error ? frontendUsersError.message : 'Failed to load customer data'}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
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

        {/* Date fields removed - no longer needed */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {/* User Name */}
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

          {/* Code */}
          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input 
              data-testid="input-code" 
              className={`mt-1 ${filters.code ? 'border-blue-500 bg-blue-50' : ''}`}
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="Enter code"
            />
          </div>

          {/* IP Address */}
          <div>
            <Label className="text-muted-foreground">{t('ipAddress')}:</Label>
            <Input 
              data-testid="input-ip" 
              className={`mt-1 ${filters.ipAddress ? 'border-blue-500 bg-blue-50' : ''}`}
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              placeholder="Enter IP address"
            />
          </div>

          {/* Phone Number */}
          <div>
            <Label className="text-muted-foreground">{t('phoneNumber')}:</Label>
            <Input 
              data-testid="input-phone" 
              className={`mt-1 ${filters.phoneNumber ? 'border-blue-500 bg-blue-50' : ''}`}
              value={filters.phoneNumber}
              onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          {/* Customer Status */}
          <div>
            <Label className="text-muted-foreground">{t('customerStatus')}:</Label>
            <Select value={filters.customerStatus} onValueChange={(value) => handleFilterChange('customerStatus', value)}>
              <SelectTrigger 
                data-testid="select-status" 
                className={`mt-1 ${filters.customerStatus && filters.customerStatus !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <SelectValue placeholder={t('pleaseSelectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Online/Offline Status */}
          <div>
            <Label className="text-muted-foreground">{t('onlineOffline')}:</Label>
            <Select value={filters.onlineStatus} onValueChange={(value) => handleFilterChange('onlineStatus', value)}>
              <SelectTrigger 
                data-testid="select-online-status" 
                className={`mt-1 ${filters.onlineStatus && filters.onlineStatus !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
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
          <Button 
            data-testid="button-filter" 
            className={`px-8 ${isFiltered ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={handleApplyFilter}
          >
            {isFiltered ? '✓ Filters Applied' : t('filter')}
          </Button>
          <Button 
            data-testid="button-clear-filter" 
            variant="outline" 
            className="px-8" 
            onClick={handleClearFilters}
            disabled={!isFiltered && Object.values(filters).every(val => val === '' || val === 'all')}
          >
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
            {displayCustomers && displayCustomers.length > 0 ? (
              displayCustomers.map((customer: any, index: number) => (
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
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handleToggleAccountStatus(customer)}
                    >
                      {customer.isActive ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.isActive ? "text-green-600" : "text-red-600"}>
                        {t('actualAccount')}
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handleToggleWithdrawStatus({...customer, allowWithdraw: customer.allowTask, id: customer.id})}
                    >
                      {customer.allowTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowTask ? "text-blue-600" : "text-red-600"}>
                        {customer.allowTask ? t('allowToStartTask') : t('notAllowedToStartTask')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowCompleteTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowCompleteTask ? "text-blue-600" : ""}>
                        {customer.allowCompleteTask ? t('allowToCompleteTask') : t('notAllowedToCompleteTask')}
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handleToggleWithdrawStatus(customer)}
                    >
                      {customer.allowWithdraw ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowWithdraw ? "text-green-600" : "text-red-600"}>
                        {customer.allowWithdraw ? t('allowedToWithdraw') : t('notAllowedToWithdraw')}
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handleToggleReferralStatus(customer)}
                    >
                      {customer.allowReferral ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowReferral ? "text-green-600" : "text-red-600"}>
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
                    <Button 
                      data-testid={`button-reset-task-${customer.id}`} 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleResetTask(customer)}
                    >
                      {t('resetTask')}
                    </Button>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {isFiltered ? 'No customers found matching your filters' : 'No customers available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('rowsPerPage')}:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {frontendUsers?.pagination ? (
                <>
                  Page {currentPage} of {frontendUsers.pagination.pages} 
                  ({frontendUsers.pagination.total} total customers)
                </>
              ) : (
                `Showing ${displayCustomers?.length || 0} customers (Page ${currentPage})`
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              {frontendUsers?.pagination && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, frontendUsers.pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {frontendUsers.pagination.pages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === frontendUsers.pagination.pages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(frontendUsers.pagination.pages)}
                        className="w-8 h-8 p-0"
                      >
                        {frontendUsers.pagination.pages}
                      </Button>
                    </>
                  )}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={frontendUsers?.pagination ? currentPage >= frontendUsers.pagination.pages : displayCustomers?.length < itemsPerPage}
              >
                Next
              </Button>
            </div>
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
                <Select value={balanceOperation} onValueChange={(value: "add" | "subtract" | "deposit" | "bonus") => setBalanceOperation(value)}>
                  <SelectTrigger id="operation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">{t('add')} (+)</SelectItem>
                    <SelectItem value="subtract">{t('subtract')} (-)</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
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

      {/* Deposit Modal */}
      <Dialog open={depositModal.open} onOpenChange={(open) => setDepositModal({ open, customer: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Deposit</DialogTitle>
          </DialogHeader>
          
          {depositModal.customer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer Information</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                  <div><span className="text-muted-foreground">Name:</span> {depositModal.customer.username}</div>
                  <div><span className="text-muted-foreground">Code:</span> {depositModal.customer.code}</div>
                  <div><span className="text-muted-foreground">Current Balance:</span> ${depositModal.customer.walletBalance}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount *</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="Enter deposit amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositMethod">Payment Method *</Label>
                <Select value={depositMethod} onValueChange={setDepositMethod}>
                  <SelectTrigger id="depositMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">Bkash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositReference">Reference/Transaction ID</Label>
                <Input
                  id="depositReference"
                  placeholder="Enter transaction reference (optional)"
                  value={depositReference}
                  onChange={(e) => setDepositReference(e.target.value)}
                />
              </div>

              {depositAmount && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm">
                    <span className="text-muted-foreground">New Balance Will Be:</span>{" "}
                    <span className="font-semibold text-primary">
                      ${(Number(depositModal.customer.walletBalance) + Number(depositAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepositModal({ open: false, customer: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!depositAmount || !depositMethod}
            >
              Record Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bonus Modal */}
      <Dialog open={bonusModal.open} onOpenChange={(open) => setBonusModal({ open, customer: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bonus</DialogTitle>
          </DialogHeader>
          
          {bonusModal.customer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer Information</Label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                  <div><span className="text-muted-foreground">Name:</span> {bonusModal.customer.username}</div>
                  <div><span className="text-muted-foreground">Code:</span> {bonusModal.customer.code}</div>
                  <div><span className="text-muted-foreground">Current Balance:</span> ${bonusModal.customer.walletBalance}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusAmount">Bonus Amount *</Label>
                <Input
                  id="bonusAmount"
                  type="number"
                  placeholder="Enter bonus amount"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusType">Bonus Type *</Label>
                <Select value={bonusType} onValueChange={setBonusType}>
                  <SelectTrigger id="bonusType">
                    <SelectValue placeholder="Select bonus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Bonus</SelectItem>
                    <SelectItem value="referral">Referral Bonus</SelectItem>
                    <SelectItem value="task">Task Completion Bonus</SelectItem>
                    <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                    <SelectItem value="special">Special Promotion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusReason">Reason/Description</Label>
                <Input
                  id="bonusReason"
                  placeholder="Enter bonus reason (optional)"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                />
              </div>

              {bonusAmount && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm">
                    <span className="text-muted-foreground">New Balance Will Be:</span>{" "}
                    <span className="font-semibold text-primary">
                      ${(Number(bonusModal.customer.walletBalance) + Number(bonusAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBonusModal({ open: false, customer: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBonus}
              disabled={!bonusAmount || !bonusType}
            >
              Add Bonus
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
                  <span className="text-sm text-muted-foreground">{t('requiredTask') || 'Required Task'}:</span>
                  <div className="font-medium">{taskDetailsModal.customer.requiredTask || taskDetailsModal.customer.taskCount || 0}</div>
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
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {comboTasksData?.data?.length || 0} future tasks
                        {taskDetailsModal.customer?.requiredTask && (
                          <span className="ml-2 text-blue-600">
                            (Required: {taskDetailsModal.customer.requiredTask})
                          </span>
                        )}
                        {taskDetailsModal.customer?.completedTasks && (
                          <span className="ml-2 text-green-600">
                            (Completed: {taskDetailsModal.customer.completedTasks})
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={refreshComboTasks}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </Button>
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
                        
                        if (!comboTasksData?.data || !Array.isArray(comboTasksData.data)) {
                          console.error("❌ Invalid combo tasks data:", comboTasksData);
                          return (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-red-500">
                                Error loading tasks data
                              </TableCell>
                            </TableRow>
                          );
                        }
                        
                        return comboTasksData.data.map((task: any, index: number) => {
                          if (!task) {
                            console.error("❌ Invalid task at index:", index);
                            return null;
                          }
                        const commission = task.taskCommission || 0;
                        const taskPrice = task.taskPrice || 0;
                        const estimatedNegative = task.estimatedNegativeAmount || 0;
                        const hasGoldenEgg = task.hasGoldenEgg || false;
                        const expiredDate = task.expiredDate 
                          ? new Date(task.expiredDate).toLocaleDateString() 
                          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

                        return (
                          <TableRow key={task._id || `task-${index}`}>
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
                                  value={taskPrices[task._id || `task-${index}`] !== undefined ? taskPrices[task._id || `task-${index}`] : taskPrice}
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
                                  disabled={taskPrices[task._id || `task-${index}`] === undefined || taskPrices[task._id || `task-${index}`] === null}
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
                              <div className="flex items-center justify-center gap-2">
                                {/* Golden Egg Logo */}
                                <div 
                                  className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center text-lg ${
                                    hasGoldenEgg 
                                      ? 'bg-yellow-400 text-yellow-800 shadow-lg hover:bg-yellow-500' 
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                  onClick={() => handleGoldenEggClick(task, task.taskNumber)}
                                  onDoubleClick={() => handleGoldenEggToggle(task, !hasGoldenEgg)}
                                  title={hasGoldenEgg ? 'Golden Egg Active - Click to edit price, Double-click to deactivate' : 'Golden Egg Inactive - Click to activate'}
                                >
                                  🥚
                                </div>
                                
                                {/* Price Input Field (shown when egg is clicked) */}
                                {goldenEggModal.open && goldenEggModal.taskNumber === task.taskNumber && (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        value={goldenEggModal.taskPrice}
                                        onChange={(e) => setGoldenEggModal({ ...goldenEggModal, taskPrice: e.target.value })}
                                        className="w-20 h-8 text-sm"
                                        placeholder="Price"
                                        step="0.01"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGoldenEggSave}
                                        className="h-8 px-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                                      >
                                        {t('save')}
                                      </Button>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleGoldenEggToggle(task, false)}
                                      className="h-8 px-2 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
                                    >
                                      Deactivate
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Status Text */}
                                <span className={`text-sm font-medium ${
                                  hasGoldenEgg ? 'text-yellow-600' : 'text-gray-500'
                                }`}>
                                  {hasGoldenEgg ? t('active') : t('inactive')}
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

            <div className="flex justify-center gap-4 pt-4">
              <Button
                onClick={handleTaskEditSave}
                className="px-8 bg-yellow-500 hover:bg-yellow-600"
              >
                {t('save')}
              </Button>
              <Button
                onClick={handleCompleteTask}
                className="px-8 bg-green-500 hover:bg-green-600"
              >
                Complete Task
              </Button>
              <Button
                onClick={() => {
                  // Deactivate golden egg for this task
                  const task = {
                    taskNumber: taskEditModal.taskNumber,
                    hasGoldenEgg: false
                  };
                  handleGoldenEggToggle(task, false);
                  setTaskEditModal({ ...taskEditModal, open: false });
                }}
                variant="outline"
                className="px-8 bg-red-500 hover:bg-red-600 text-white border-red-500"
              >
                Deactivate
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

            <div>
              <Label htmlFor="estimatedNegativeAmount">{t('estimatedNegativeAmount') || 'Estimated Negative Amount'} *</Label>
              <Input
                id="estimatedNegativeAmount"
                type="number"
                value={goldenEggModal.estimatedNegativeAmount}
                onChange={(e) => setGoldenEggModal({ ...goldenEggModal, estimatedNegativeAmount: e.target.value })}
                className="mt-2"
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="taskCommission">{t('taskCommission') || 'Task Commission'} *</Label>
              <Input
                id="taskCommission"
                type="number"
                value={goldenEggModal.taskCommission}
                onChange={(e) => setGoldenEggModal({ ...goldenEggModal, taskCommission: e.target.value })}
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
