import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, Edit, Trash2, Smartphone, RefreshCw, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Admin {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deviceInfo?: {
    currentIP: string;
    currentDeviceId: string;
    deviceCount: number;
    lastLogin: string;
    deviceSessions: Array<{
      deviceId: string;
      ipAddress: string;
      userAgent: string;
      deviceType: string;
      deviceName: string;
      deviceModel: string;
      browserInfo: string;
      osInfo: string;
      loginTime: string;
      isActive: boolean;
    }>;
  };
}

export default function AdminList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAdminForDevices, setSelectedAdminForDevices] = useState<Admin | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [realTimeDeviceStatus, setRealTimeDeviceStatus] = useState<any>(null);
  const [currentUserSessions, setCurrentUserSessions] = useState<any>(null);

  // Function to fetch real-time device status
  const fetchRealTimeDeviceStatus = async () => {
    try {
      const response = await fetch(`/api/admin/device-status?currentUserRole=${currentUserRole}`);
      if (!response.ok) {
        throw new Error('Failed to fetch device status');
      }
      const result = await response.json();
      setRealTimeDeviceStatus(result.data);
      
      // Also fetch current user's sessions if superadmin
      if (currentUserRole === 'superadmin' && currentUsername) {
        await fetchCurrentUserSessions();
      }
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
  };

  // Function to fetch current user's own device sessions
  const fetchCurrentUserSessions = async () => {
    try {
      const response = await fetch(`/api/admin/current-user-sessions?username=${currentUsername}`);
      if (!response.ok) {
        throw new Error('Failed to fetch current user sessions');
      }
      const result = await response.json();
      setCurrentUserSessions(result.data);
    } catch (error) {
      console.error('Error fetching current user sessions:', error);
    }
  };

  // Function to logout from all devices
  const logoutFromAllDevices = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUsername })
      });
      
      if (!response.ok) {
        throw new Error('Failed to logout from all devices');
      }
      
      toast({
        title: "Success",
        description: "Logged out from all devices successfully",
      });
      
      // Refresh device status
      fetchRealTimeDeviceStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout from all devices",
        variant: "destructive",
      });
    }
  };

  // Function to populate device info for existing admins
  const populateDeviceInfo = async () => {
    try {
      const response = await fetch('/api/admin/populate-device-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to populate device info');
      }
      
      const result = await response.json();
      toast({
        title: "Success",
        description: `Updated device info for ${result.updatedCount} admins`,
      });
      
      // Refresh real-time device status and reload page
      if (currentUserRole === 'superadmin') {
        fetchRealTimeDeviceStatus();
      }
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to populate device info",
        variant: "destructive",
      });
    }
  };

  // Get current user info from localStorage
  const adminUser = localStorage.getItem('adminUser');
  const currentUsername = adminUser ? JSON.parse(adminUser).username : null;

  // Fetch current admin role from database
  const { data: currentAdminData } = useQuery<{
    success: boolean;
    data: {
      role: string;
      username: string;
    };
  }>({
    queryKey: ["/api/admin/current", currentUsername],
    queryFn: async () => {
      if (!currentUsername) return { success: false, data: { role: 'team', username: '' } };
      
      const response = await fetch(`/api/admin/current?username=${currentUsername}`);
      if (!response.ok) {
        throw new Error("Failed to fetch current admin info");
      }
      return response.json();
    },
    enabled: !!currentUsername,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const currentUserRole = currentAdminData?.data?.role || 'team';

  // Fetch real-time device status for superadmin
  useEffect(() => {
    if (currentUserRole === 'superadmin') {
      fetchRealTimeDeviceStatus();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchRealTimeDeviceStatus, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUserRole]);

  // Fetch admins data
  const { data: adminsData, isLoading, error } = useQuery<{
    success: boolean;
    data: Admin[];
    total: number;
    pages: number;
  }>({
    queryKey: ["/api/admin/list", { page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter, currentUserRole }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        currentUserRole: currentUserRole,
      });
      
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`/api/admin/list?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      return response.json();
    },
  });

  // Debug: Log admin data to see device info
  console.log("🔍 Admin List Data:", adminsData?.data);
  if (currentUserRole === 'superadmin' && adminsData?.data) {
    adminsData.data.forEach(admin => {
      console.log(`🔍 Admin ${admin.username} device info:`, admin.deviceInfo);
    });
  }

  // Filtered and paginated data
  const filteredAdmins = useMemo(() => {
    if (!adminsData?.data) return [];
    
    let filtered = adminsData.data;
    
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(admin => {
        if (statusFilter === "active") return admin.isActive;
        if (statusFilter === "inactive") return !admin.isActive;
        return true;
      });
    }
    
    return filtered;
  }, [adminsData?.data, searchTerm, statusFilter]);

  const totalPages = Math.ceil((filteredAdmins.length || 0) / itemsPerPage);
  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAdmins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAdmins, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update admin status");
      }

      toast({
        title: t("success") || "Success",
        description: t("adminStatusUpdated") || "Admin status updated successfully",
      });

      // Refetch data
      window.location.reload();
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error instanceof Error ? error.message : "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{t("errorLoadingAdmins") || "Error loading admins"}</p>
              <Button onClick={() => window.location.reload()}>
                {t("retry") || "Retry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("adminList") || "Admin List"}
            </h2>
            <p className="text-muted-foreground">
              {t("manageAdmins") || "Manage all administrators in the system"}
            </p>
          </div>
          {currentUserRole === 'superadmin' && (
            <Button 
              onClick={populateDeviceInfo}
              variant="outline"
              size="sm"
            >
              Populate Device Info
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("filters") || "Filters"}</CardTitle>
          <CardDescription>
            {t("filterAdmins") || "Filter and search administrators"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-muted-foreground">
                {t("search")} :
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  className="pl-10 mt-1"
                  placeholder={t("searchAdmins") || "Search admins..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-muted-foreground">
                {t("status")} :
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("selectStatus") || "Select status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all") || "All"}</SelectItem>
                  <SelectItem value="active">{t("active") || "Active"}</SelectItem>
                  <SelectItem value="inactive">{t("inactive") || "Inactive"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="itemsPerPage" className="text-muted-foreground">
                {t("itemsPerPage") || "Items per page"} :
              </Label>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="px-6">
                {t("applyFilter") || "Apply Filter"}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                {t("clearFilters") || "Clear Filters"}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {t("showing") || "Showing"} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} {t("of") || "of"} {filteredAdmins.length} {t("admins") || "admins"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Device Status Summary (Superadmin only) */}
      {currentUserRole === 'superadmin' && realTimeDeviceStatus && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Device Status
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={fetchRealTimeDeviceStatus}
                className="ml-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* My Current Sessions */}
            {currentUserSessions && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-green-700">My Current Sessions</h4>
                  </div>
                  {currentUserSessions.activeDeviceCount > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={logoutFromAllDevices}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout All Devices
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {currentUserSessions.activeDeviceCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Devices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {currentUserSessions.currentIP}
                    </div>
                    <div className="text-sm text-muted-foreground">Current IP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {currentUserSessions.totalDeviceCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Devices</div>
                  </div>
                </div>
                {currentUserSessions.activeDeviceCount > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <strong>Active Sessions:</strong>
                    <div className="mt-1 space-y-1">
                      {currentUserSessions.activeSessions.map((session: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>{session.deviceName} {session.deviceModel}</span>
                          <span className="text-green-600">• {session.ipAddress}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* System Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeDeviceStatus.summary.totalActiveDevices}
                </div>
                <div className="text-sm text-muted-foreground">Active Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeDeviceStatus.summary.activeAdmins}
                </div>
                <div className="text-sm text-muted-foreground">Active Admins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {realTimeDeviceStatus.summary.totalAdmins}
                </div>
                <div className="text-sm text-muted-foreground">Total Admins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {realTimeDeviceStatus.summary.inactiveAdmins}
                </div>
                <div className="text-sm text-muted-foreground">Offline Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admins") || "Admins"}</CardTitle>
          <CardDescription>
            {t("listOfAllAdmins") || "List of all administrators"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t("loading") || "Loading admins..."}</p>
              </div>
            </div>
          ) : paginatedAdmins.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noAdminsFound") || "No admins found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("username") || "Username"}</TableHead>
                    <TableHead>{t("fullName") || "Full Name"}</TableHead>
                    <TableHead>{t("email") || "Email"}</TableHead>
                    <TableHead>{t("role") || "Role"}</TableHead>
                    <TableHead>{t("status") || "Status"}</TableHead>
                    {currentUserRole === 'superadmin' && (
                      <>
                        <TableHead>Current IP</TableHead>
                        <TableHead>Device Count</TableHead>
                        <TableHead>Last Login</TableHead>
                      </>
                    )}
                    <TableHead>{t("createdAt") || "Created At"}</TableHead>
                    <TableHead>{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAdmins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell className="font-medium">{admin.username}</TableCell>
                      <TableCell>{admin.fullName}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.isActive ? "default" : "destructive"}>
                          {admin.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                        </Badge>
                      </TableCell>
                      {currentUserRole === 'superadmin' && (
                        <>
                          <TableCell className="text-sm">
                            {admin.deviceInfo?.currentIP || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Badge variant="outline" className={realTimeDeviceStatus?.admins?.find((a: any) => a.username === admin.username)?.activeDeviceCount > 0 ? "border-green-500 text-green-700" : ""}>
                              {realTimeDeviceStatus?.admins?.find((a: any) => a.username === admin.username)?.activeDeviceCount || 0} active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {admin.deviceInfo?.lastLogin ? 
                              new Date(admin.deviceInfo.lastLogin).toLocaleString() : 
                              'Never'
                            }
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={admin.isActive ? "destructive" : "default"}
                            onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                          >
                            {admin.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                {t("deactivate") || "Deactivate"}
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                {t("activate") || "Activate"}
                              </>
                            )}
                          </Button>
                          {currentUserRole === 'superadmin' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAdminForDevices(admin);
                                setShowDeviceModal(true);
                              }}
                              title="View Device Information"
                            >
                              <Smartphone className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-sm text-muted-foreground">
                  {t("itemsPerPage") || "Items per page"}:
                </Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous") || "Previous"}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t("next") || "Next"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Information Modal */}
      <Dialog open={showDeviceModal} onOpenChange={setShowDeviceModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Device Information - {selectedAdminForDevices?.username}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAdminForDevices && (
            <div className="space-y-6">
              {/* Current Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Current IP Address</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedAdminForDevices.deviceInfo?.currentIP || 'Not Available'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Device ID</Label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedAdminForDevices.deviceInfo?.currentDeviceId || 'Not Available'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Device</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedAdminForDevices.deviceInfo?.deviceSessions?.[0]?.deviceName || 'Not Available'} {selectedAdminForDevices.deviceInfo?.deviceSessions?.[0]?.deviceModel || ''}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Operating System</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedAdminForDevices.deviceInfo?.deviceSessions?.[0]?.osInfo || 'Not Available'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Active Devices</Label>
                      <Badge variant="outline">
                        {selectedAdminForDevices.deviceInfo?.deviceCount || 0} devices
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedAdminForDevices.deviceInfo?.lastLogin ? 
                          new Date(selectedAdminForDevices.deviceInfo.lastLogin).toLocaleString() : 
                          'Never'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Sessions History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Device Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAdminForDevices.deviceInfo?.deviceSessions && selectedAdminForDevices.deviceInfo.deviceSessions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAdminForDevices.deviceInfo.deviceSessions.map((session, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={session.isActive ? "default" : "secondary"}>
                                  {session.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-sm font-medium">Device ID: {session.deviceId}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                IP: {session.ipAddress} | {session.deviceName} {session.deviceModel} | {session.osInfo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.deviceType} • {session.browserInfo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Login: {new Date(session.loginTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No device sessions found.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
