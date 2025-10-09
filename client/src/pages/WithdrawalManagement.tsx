import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
// import { Customer } from "@/shared/schema";

export default function WithdrawalManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // SIMPLE API CALL - NO FILTERING
  const { data: withdrawalsResponse, isLoading, error } = useQuery({
    queryKey: ["withdrawals-simple"],
    queryFn: async () => {
      console.log("🔍 Fetching withdrawals...");
      const response = await fetch("/api/withdrawals?_t=" + Date.now(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("🔍 API Response:", data);
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // DEBUG LOGS
  console.log("🔍 Component State:");
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("withdrawalsResponse:", withdrawalsResponse);

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/withdrawals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update withdrawal");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals-simple"] });
      toast({
        title: "Success",
        description: "Withdrawal status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal status",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('withdrawalManagement')}</h2>
        <div className="text-sm text-muted-foreground">
          <div>Last Updated: {new Date().toLocaleString()}</div>
          <div>Production Fix Applied - v9.0 (COMPLETE REWRITE)</div>
        </div>
      </div>

      {/* API RESPONSE DEBUG */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">🔍 API Response Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</div>
            <div><strong>Error:</strong> {error ? String(error) : "None"}</div>
            <div><strong>Response Success:</strong> {withdrawalsResponse?.success ? "Yes" : "No"}</div>
            <div><strong>Data Count:</strong> {withdrawalsResponse?.data?.length || 0}</div>
            <div><strong>Total:</strong> {withdrawalsResponse?.pagination?.total || 0}</div>
          </div>
          
          {withdrawalsResponse?.data && withdrawalsResponse.data.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-blue-700">📊 First Withdrawal:</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(withdrawalsResponse.data[0], null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SIMPLE TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading withdrawals...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error: {String(error)}
            </div>
          ) : !withdrawalsResponse?.data || withdrawalsResponse.data.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-gray-500">No withdrawals found</div>
              <div className="text-sm text-gray-400 mt-2">
                API Response: {withdrawalsResponse ? "Data received but empty" : "No response"}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalsResponse.data.map((withdrawal: any, index: number) => {
                  console.log(`🔍 Rendering withdrawal ${index + 1}:`, withdrawal);
                  return (
                    <TableRow key={withdrawal._id || index}>
                      <TableCell className="font-mono text-sm">
                        {withdrawal._id?.substring(0, 8) || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {withdrawal.customer?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {withdrawal.customer?.membershipId || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Balance: {withdrawal.customer?.accountBalance || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {withdrawal.amount || 0}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            withdrawal.status === 'completed' ? 'default' : 
                            withdrawal.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {withdrawal.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {withdrawal.submittedAt ? 
                          new Date(withdrawal.submittedAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log("View details:", withdrawal)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {withdrawal.status !== 'completed' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateWithdrawalMutation.mutate({ 
                                id: withdrawal._id, 
                                status: "completed" 
                              })}
                              disabled={updateWithdrawalMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}
                          {withdrawal.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateWithdrawalMutation.mutate({ 
                                id: withdrawal._id, 
                                status: "rejected" 
                              })}
                              disabled={updateWithdrawalMutation.isPending}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}