import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
  username: string;
  email: string;
  number: string;
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
  status: 'active' | 'inactive';
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [membershipIdFilter, setMembershipIdFilter] = useState("");
  const [phoneNumberFilter, setPhoneNumberFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      console.log("🔄 Frontend: Toggling user status", { userId, currentStatus });
      const result = await toggleUserStatusMutation.mutateAsync(userId);
      console.log("✅ Frontend: Status toggle result", result);
      
      toast({
        title: "Success",
        description: `User ${currentStatus ? 'suspended' : 'activated'} successfully`,
      });
    } catch (error: any) {
      console.error("❌ Frontend: Error toggling user status:", error);
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

  // Filter functions for membershipId, number, username
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'membershipId') {
      setMembershipIdFilter(value);
    } else if (field === 'phoneNumber') {
      setPhoneNumberFilter(value);
    } else if (field === 'username') {
      setUsernameFilter(value);
    }
  };

  const handleApplyFilter = async () => {
    console.log("🔍 Applying filters:", { membershipIdFilter, phoneNumberFilter, usernameFilter });
    setIsFiltered(true);
    setCurrentPage(1); // Reset to first page when applying filters
    toast({
      title: "Success",
      description: "Filters applied successfully",
    });
    // Refetch with new filters
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  const handleClearFilters = async () => {
    console.log("🔄 Clearing filters");
    setMembershipIdFilter("");
    setPhoneNumberFilter("");
    setUsernameFilter("");
    setIsFiltered(false);
    setCurrentPage(1); // Reset to first page when clearing filters
    toast({
      title: "Success",
      description: "Filters cleared successfully",
    });
    // Refetch all data
    await queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
  };

  // Build query parameters for API
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("limit", itemsPerPage.toString());
    params.append("page", currentPage.toString());
    
    if (isFiltered && (membershipIdFilter || phoneNumberFilter || usernameFilter)) {
      if (membershipIdFilter) params.append("membershipId", membershipIdFilter);
      if (phoneNumberFilter) params.append("phoneNumber", phoneNumberFilter);
      if (usernameFilter) params.append("username", usernameFilter);
    }
    
    console.log('🔍 UserManagement queryParams:', params.toString());
    return params;
  }, [currentPage, itemsPerPage, isFiltered, membershipIdFilter, phoneNumberFilter, usernameFilter]);

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

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*Membership ID:</Label>
            <Input
              data-testid="input-membership-id"
              type="text"
              placeholder="Enter Membership ID"
              value={membershipIdFilter}
              onChange={(e) => handleFilterChange('membershipId', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">*Number:</Label>
            <Input
              data-testid="input-number"
              type="tel"
              placeholder="Enter Number"
              value={phoneNumberFilter}
              onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">*Username:</Label>
            <Input
              data-testid="input-username"
              type="text"
              placeholder="Enter Username"
              value={usernameFilter}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              className="mt-1"
            />
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
              <TableHead className="text-muted-foreground">username</TableHead>
              <TableHead className="text-muted-foreground">number</TableHead>
              <TableHead className="text-muted-foreground">{t('level')}</TableHead>
              <TableHead className="text-muted-foreground">{t('membershipId')}</TableHead>
              <TableHead className="text-muted-foreground">{t('accountBalance')}</TableHead>
              <TableHead className="text-muted-foreground">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Show frontend users instead of admin users */}
            {frontendUsers?.data?.map((user, index) => (
              <TableRow key={user._id} data-testid={`row-admin-${user._id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{index + 1}</TableCell>
                <TableCell className="text-sm">{user.username}</TableCell>
                <TableCell className="text-sm">{user.number|| 'N/A'}</TableCell>
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
                            (user.status === 'active' || user.isActive) 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Click to change user status"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {(user.status === 'active' || user.isActive) ? 'Active' : 'Inactive'}
                          </span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user._id, user.status === 'active' || user.isActive)}
                          className={`cursor-pointer ${
                            (user.status === 'active' || user.isActive) 
                              ? 'bg-green-50 text-green-700' 
                              : 'hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              (user.status === 'active' || user.isActive) ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span>Active</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user._id, user.status === 'active' || user.isActive)}
                          className={`cursor-pointer ${
                            !(user.status === 'active' || user.isActive) 
                              ? 'bg-red-50 text-red-700' 
                              : 'hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              !(user.status === 'active' || user.isActive) ? 'bg-red-500' : 'bg-gray-300'
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
                  ({frontendUsers.pagination.total} total users)
                </>
              ) : (
                `Showing ${frontendUsers?.data?.length || 0} users (Page ${currentPage})`
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
                disabled={frontendUsers?.pagination ? currentPage >= frontendUsers.pagination.pages : (frontendUsers?.data?.length || 0) < itemsPerPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
