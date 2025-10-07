import { useQuery, useMutation } from "@tanstack/react-query";
import { type VipLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function VIPLevel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [editModal, setEditModal] = useState<{
    open: boolean;
    level: any | null;
  }>({
    open: false,
    level: null,
  });

  const [formData, setFormData] = useState<any>({});
  
  // Fetch from MongoDB
  const { data: vipLevelsResponse, isLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/vip-levels"],
    queryFn: async () => {
      const response = await fetch("/api/frontend/vip-levels");
      return response.json();
    }
  });

  const vipLevels = vipLevelsResponse?.data || [];

  // Update VIP Level mutation
  const updateVIPLevelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/frontend/vip-levels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update VIP level");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/vip-levels"] });
      toast({
        title: t("success") || "Success",
        description: "VIP level updated successfully",
      });
      setEditModal({ open: false, level: null });
    },
    onError: (error: any) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (level: any) => {
    setEditModal({ open: true, level });
    setFormData({
      minAmount: level.minAmount,
      taskCount: level.taskCount,
      threeTask: level.threeTask,
      commissionPercentage: level.commissionPercentage,
      comboCommissionPercentage: level.comboCommissionPercentage,
      productRangeMin: level.productRangeMin,
      productRangeMax: level.productRangeMax,
      minWithdrawal: level.minWithdrawal,
      maxWithdrawal: level.maxWithdrawal,
      completedTasksToWithdraw: level.completedTasksToWithdraw,
      withdrawalFees: level.withdrawalFees,
    });
  };

  const handleSave = () => {
    if (!editModal.level) return;
    const levelId = editModal.level._id || editModal.level.id;
    updateVIPLevelMutation.mutate({ id: levelId, data: formData });
  };

  // Check all users VIP levels
  const checkAllVIPLevelsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/frontend/vip-levels/check-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to check VIP levels");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("success") || "Success",
        description: `Checked ${data.totalUsers} users, updated ${data.updatedCount} VIP levels`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
    },
    onError: (error: any) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{t('vipLevel')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            VIP levels are automatically updated based on user's balance. Higher balance = Higher VIP level.
          </p>
        </div>
        <Button 
          onClick={() => checkAllVIPLevelsMutation.mutate()}
          disabled={checkAllVIPLevelsMutation.isPending}
          className="bg-primary"
        >
          {checkAllVIPLevelsMutation.isPending ? "Checking..." : "Check All Users VIP Levels"}
        </Button>
      </div>
      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">{t('vipLevel')}</TableHead>
              <TableHead className="text-muted-foreground">{t('task')}</TableHead>
              <TableHead className="text-muted-foreground">{t('withdrawalLimitation')}</TableHead>
              <TableHead className="text-muted-foreground">{t('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vipLevels?.map((level: any) => {
              const levelId = level._id || level.id;
              return (
                <TableRow key={levelId} data-testid={`row-vip-${levelId}`} className="hover:bg-muted/50">
                  <TableCell className="px-6 py-6">
                    <div className="text-lg font-semibold">{level.name}</div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="text-sm space-y-1">
                      <div>{t('minAmount')}: {level.minAmount}</div>
                      <div>{t('taskCount')}: {level.taskCount}</div>
                      <div>3{t('task')} {t('set')}: {level.threeTask}</div>
                      <div>{t('commissionPercentage')}: {level.commissionPercentage}</div>
                      <div>{t('comboCommissionPercentage')}: {level.comboCommissionPercentage}</div>
                      <div>
                        {t('productRange')} %: {level.productRangeMin}% {t('productRange')} %: {level.productRangeMax}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="text-sm space-y-1">
                      <div>{t('minWithdrawalAmount')}: {level.minWithdrawal}</div>
                      <div>{t('maxWithdrawalAmount')}: {level.maxWithdrawal}</div>
                      <div>{t('completedTaskDayToWithdraw')}: {level.completedTasksToWithdraw}</div>
                      <div>{t('withdrawalFees')}: {level.withdrawalFees}%</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <Button 
                      data-testid={`button-edit-vip-${levelId}`}
                      onClick={() => handleEditClick(level)}
                    >
                      {t('edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
            1-{vipLevels?.length} of {vipLevels?.length}
          </div>
        </div>
      </div>

      {/* Edit VIP Level Dialog */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, level: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('edit')} {editModal.level?.name} VIP Level</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('minAmount')}</Label>
                <Input
                  type="number"
                  value={formData.minAmount || ""}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('taskCount')}</Label>
                <Input
                  type="number"
                  value={formData.taskCount || ""}
                  onChange={(e) => setFormData({ ...formData, taskCount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>3 {t('task')} {t('set')}</Label>
                <Input
                  value={formData.threeTask || ""}
                  onChange={(e) => setFormData({ ...formData, threeTask: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('commissionPercentage')}</Label>
                <Input
                  type="number"
                  value={formData.commissionPercentage || ""}
                  onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('comboCommissionPercentage')}</Label>
                <Input
                  type="number"
                  value={formData.comboCommissionPercentage || ""}
                  onChange={(e) => setFormData({ ...formData, comboCommissionPercentage: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('productRange')} Min %</Label>
                <Input
                  type="number"
                  value={formData.productRangeMin || ""}
                  onChange={(e) => setFormData({ ...formData, productRangeMin: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('productRange')} Max %</Label>
                <Input
                  type="number"
                  value={formData.productRangeMax || ""}
                  onChange={(e) => setFormData({ ...formData, productRangeMax: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('minWithdrawalAmount')}</Label>
                <Input
                  type="number"
                  value={formData.minWithdrawal || ""}
                  onChange={(e) => setFormData({ ...formData, minWithdrawal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('maxWithdrawalAmount')}</Label>
                <Input
                  type="number"
                  value={formData.maxWithdrawal || ""}
                  onChange={(e) => setFormData({ ...formData, maxWithdrawal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('completedTaskDayToWithdraw')}</Label>
                <Input
                  type="number"
                  value={formData.completedTasksToWithdraw || ""}
                  onChange={(e) => setFormData({ ...formData, completedTasksToWithdraw: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{t('withdrawalFees')} %</Label>
                <Input
                  type="number"
                  value={formData.withdrawalFees || ""}
                  onChange={(e) => setFormData({ ...formData, withdrawalFees: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditModal({ open: false, level: null })}
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateVIPLevelMutation.isPending}
              >
                {updateVIPLevelMutation.isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
