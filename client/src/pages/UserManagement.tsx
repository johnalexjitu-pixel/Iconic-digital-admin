import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { type Admin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPen, Key, Settings, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface FrontendUser {
  _id: string;
  name: string;
  email: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  membershipId: string;
  referralCode: string;
  creditScore: number;
  accountBalance: number;
  totalEarnings: number;
  campaignsCompleted: number;
  lastLogin: string;
  createdAt: string;
  isActive: boolean;
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-02");
  const [isFiltered, setIsFiltered] = useState(false);

  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ["/api/admins"],
  });

  // Mutation for toggling user status
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

  // Handle user status toggle
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

  // Filter functions
  const handleFilter = () => {
    setIsFiltered(true);
  };

  // Filter functions - TaskManagement style
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
    } else if (field === 'endDate') {
      setEndDate(value);
    }
  };

  const handleApplyFilter = async () => {
    console.log("🔍 Applying filters with date range:", { startDate, endDate });
    setIsFiltered(true);
    toast({
      title: "Success",
      description: "Filters applied successfully",
    });
    // Refetch with new filters
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  const handleClearFilters = async () => {
    console.log("🔄 Clearing filters");
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

  // Build query parameters for API
  const queryParams = new URLSearchParams();
  queryParams.append("limit", "100");
  
  if (isFiltered && (startDate || endDate)) {
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
  }

  // Frontend users API call
  const { data: frontendUsers, isLoading: frontendUsersLoading } = useQuery<{
    success: boolean;
    data: FrontendUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["/api/frontend/users?" + queryParams.toString()],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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
        <h2 className="text-xl font-semibold mb-6">{t('userManagement')}</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
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
              <TableHead className="text-muted-foreground">{t('createdDate')}</TableHead>
              <TableHead className="text-muted-foreground">{t('adminName')}</TableHead>
              <TableHead className="text-muted-foreground">{t('whatsappUrl')}</TableHead>
              <TableHead className="text-muted-foreground">{t('telegramUrl')}</TableHead>
              <TableHead className="text-muted-foreground">{t('telegramUrl')} 2</TableHead>
              <TableHead className="text-muted-foreground">{t('telegramUrl')} 3</TableHead>
              <TableHead className="text-muted-foreground">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Show frontend users instead of admin users */}
            {frontendUsers?.data?.map((user, index) => (
              <TableRow key={user._id} data-testid={`row-admin-${user._id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{index + 1}</TableCell>
                <TableCell className="text-sm">{user.name}</TableCell>
                <TableCell className="text-sm">{user.email}</TableCell>
                <TableCell className="text-sm">{user.level}</TableCell>
                <TableCell className="text-sm">{user.membershipId}</TableCell>
                <TableCell className="text-sm">{user.accountBalance}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      data-testid={`button-edit-admin-${user._id}`}
                      className="text-primary hover:text-primary/80"
                      title="Edit User"
                    >
                      <UserPen className="w-5 h-5" />
                    </button>
                    <button
                      data-testid={`button-reset-password-${user._id}`}
                      className="text-primary hover:text-primary/80"
                      title="Reset Password"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          data-testid={`button-toggle-status-${user._id}`}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                            user.isActive 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Click to change user status"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`cursor-pointer ${
                            user.isActive 
                              ? 'bg-green-50 text-green-700' 
                              : 'hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span>Active</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`cursor-pointer ${
                            !user.isActive 
                              ? 'bg-red-50 text-red-700' 
                              : 'hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              !user.isActive ? 'bg-red-500' : 'bg-gray-300'
                            }`}></div>
                            <span>Inactive</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{frontendUsers?.data?.length || 0} of {frontendUsers?.pagination?.total || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
