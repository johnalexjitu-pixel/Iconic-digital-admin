import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Admin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPen, Key } from "lucide-react";
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
}

export default function UserManagement() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-02");

  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ["/api/admins"],
  });

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
    queryKey: ["/api/frontend/users?limit=100"],
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
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button data-testid="button-filter" className="px-8">{t('filter')}</Button>
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
                    >
                      <UserPen className="w-5 h-5" />
                    </button>
                    <button
                      data-testid={`button-reset-password-${user._id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      <Key className="w-5 h-5" />
                    </button>
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
