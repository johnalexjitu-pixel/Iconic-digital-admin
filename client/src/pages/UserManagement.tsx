import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Admin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPen, Key } from "lucide-react";

export default function UserManagement() {
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-02");

  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ["/api/admins"],
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
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*Created Date:</Label>
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
          <Button data-testid="button-filter" className="px-8">Filter</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">Created Date</TableHead>
              <TableHead className="text-muted-foreground">Admin Name</TableHead>
              <TableHead className="text-muted-foreground">Whatsapp Url</TableHead>
              <TableHead className="text-muted-foreground">Telegram Url</TableHead>
              <TableHead className="text-muted-foreground">Telegram Url 2</TableHead>
              <TableHead className="text-muted-foreground">Telegram Url 3</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins?.map((admin) => (
              <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">14</TableCell>
                <TableCell className="text-sm">{admin.name}</TableCell>
                <TableCell className="text-sm">{admin.whatsappUrl || "-"}</TableCell>
                <TableCell className="text-sm">{admin.telegramUrl || "-"}</TableCell>
                <TableCell className="text-sm">{admin.telegramUrl2 || "-"}</TableCell>
                <TableCell className="text-sm">{admin.telegramUrl3 || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      data-testid={`button-edit-admin-${admin.id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      <UserPen className="w-5 h-5" />
                    </button>
                    <button
                      data-testid={`button-reset-password-${admin.id}`}
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
            <span>Rows per page:</span>
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
            1-{admins?.length} of {admins?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
