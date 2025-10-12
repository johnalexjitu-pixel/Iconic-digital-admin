import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { FileText, Plus, Edit, Trash2, Loader2, Shield } from "lucide-react";

interface DeveloperNotice {
  _id: string;
  content: string;
  visibleToRoles: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function DeveloperNoticeManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<DeveloperNotice | null>(null);
  
  const [formData, setFormData] = useState({
    content: "",
    visibleToRoles: [] as string[]
  });

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

  // Check user permission on component mount
  useEffect(() => {
    if (currentUserRole && currentUserRole !== 'superadmin') {
      toast({
        title: t("accessDenied") || "Access Denied",
        description: t("insufficientPermissions") || "You don't have permission to perform this action",
        variant: "destructive",
      });
    }
  }, [currentUserRole, t, toast]);

  // Fetch all notices for management (only superadmin)
  const { data: noticesData, isLoading, error } = useQuery<{
    success: boolean;
    data: DeveloperNotice[];
  }>({
    queryKey: ["/api/developer-notice/all", currentUsername],
    queryFn: async () => {
      const response = await fetch(`/api/developer-notice/all?currentUserUsername=${currentUsername}`);
      if (!response.ok) {
        throw new Error("Failed to fetch developer notices");
      }
      return response.json();
    },
    enabled: !!currentUsername && currentUserRole === 'superadmin',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (noticeData: {
      content: string;
      visibleToRoles: string[];
      createdByUsername: string;
    }) => {
      const response = await fetch("/api/developer-notice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create notice");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("success") || "Success",
        description: t("noticeCreatedSuccessfully") || "Developer notice created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData({ content: "", visibleToRoles: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/developer-notice/all"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateNoticeMutation = useMutation({
    mutationFn: async ({ noticeId, noticeData }: {
      noticeId: string;
      noticeData: {
        content: string;
        visibleToRoles: string[];
        updatedByUsername: string;
      };
    }) => {
      const response = await fetch(`/api/developer-notice/update/${noticeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update notice");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("success") || "Success",
        description: t("noticeUpdatedSuccessfully") || "Developer notice updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingNotice(null);
      queryClient.invalidateQueries({ queryKey: ["/api/developer-notice/all"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: async ({ noticeId, deletedByUsername }: {
      noticeId: string;
      deletedByUsername: string;
    }) => {
      const response = await fetch(`/api/developer-notice/delete/${noticeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deletedByUsername }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete notice");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("success") || "Success",
        description: t("noticeDeletedSuccessfully") || "Developer notice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/developer-notice/all"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      visibleToRoles: prev.visibleToRoles.includes(role)
        ? prev.visibleToRoles.filter(r => r !== role)
        : [...prev.visibleToRoles, role]
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content || formData.visibleToRoles.length === 0) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseFillAllFields") || "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    createNoticeMutation.mutate({
      content: formData.content,
      visibleToRoles: formData.visibleToRoles,
      createdByUsername: currentUsername!
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content || formData.visibleToRoles.length === 0 || !editingNotice) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseFillAllFields") || "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    updateNoticeMutation.mutate({
      noticeId: editingNotice._id,
      noticeData: {
        content: formData.content,
        visibleToRoles: formData.visibleToRoles,
        updatedByUsername: currentUsername!
      }
    });
  };

  const handleEdit = (notice: DeveloperNotice) => {
    setEditingNotice(notice);
    setFormData({
      content: notice.content,
      visibleToRoles: notice.visibleToRoles
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (noticeId: string) => {
    deleteNoticeMutation.mutate({
      noticeId,
      deletedByUsername: currentUsername!
    });
  };

  const notices = noticesData?.data || [];

  // Show access denied message for non-superadmin roles
  if (currentUserRole !== 'superadmin') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('accessDenied') || 'Access Denied'}
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                {t('insufficientPermissions') || 'You don\'t have permission to perform this action'}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {t('developerNoticeAccessNote') || 'Only Super Admin can manage developer notices.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t("developerNoticeManagement") || "Developer Notice Management"}
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t("createNotice") || "Create Notice"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("createNotice") || "Create Developer Notice"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-muted-foreground">
                    {t("noticeContent") || "Notice Content"} *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder={t("enterNoticeContent") || "Enter notice content..."}
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-muted-foreground">
                    {t("visibleToRoles") || "Visible To Roles"} *
                  </Label>
                  <div className="mt-2 space-y-2">
                    {['superadmin', 'admin', 'team'].map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`role-${role}`}
                          checked={formData.visibleToRoles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`role-${role}`} className="text-sm">
                          {t(role) || role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    {t("cancel") || "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createNoticeMutation.isPending}
                  >
                    {createNoticeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {t("createNotice") || "Create Notice"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-40 flex items-center justify-center">
              {t("errorFetchingNotices") || `Error: ${error.message}`}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("content") || "Content"}</TableHead>
                    <TableHead>{t("visibleToRoles") || "Visible To"}</TableHead>
                    <TableHead>{t("createdBy") || "Created By"}</TableHead>
                    <TableHead>{t("createdAt") || "Created At"}</TableHead>
                    <TableHead className="text-center">{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <TableRow key={notice._id}>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={notice.content}>
                            {notice.content}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {notice.visibleToRoles.map((role) => (
                              <span
                                key={role}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {t(role) || role}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{notice.createdBy}</TableCell>
                        <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(notice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("confirmDeleteNotice") || "Are you sure you want to delete this developer notice? This action cannot be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(notice._id)}>
                                    {deleteNoticeMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      t("delete") || "Delete"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {t("noNoticesFound") || "No developer notices found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("editNotice") || "Edit Developer Notice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-content" className="text-muted-foreground">
                {t("noticeContent") || "Notice Content"} *
              </Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder={t("enterNoticeContent") || "Enter notice content..."}
                className="mt-1 min-h-[120px]"
                required
              />
            </div>
            
            <div>
              <Label className="text-muted-foreground">
                {t("visibleToRoles") || "Visible To Roles"} *
              </Label>
              <div className="mt-2 space-y-2">
                {['superadmin', 'admin', 'team'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-role-${role}`}
                      checked={formData.visibleToRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`edit-role-${role}`} className="text-sm">
                      {t(role) || role}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={updateNoticeMutation.isPending}
              >
                {updateNoticeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("updateNotice") || "Update Notice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
