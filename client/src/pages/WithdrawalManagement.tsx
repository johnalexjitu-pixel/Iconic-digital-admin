import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WithdrawalManagement() {
  // Fetch withdrawals using same pattern as TaskManagement
  const { data: withdrawalsResponse, isLoading, error, refetch } = useQuery<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["/api/withdrawals"],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Process withdrawals data - same pattern as TaskManagement
  const processedWithdrawals = withdrawalsResponse?.data?.map((withdrawal: any, index: number) => ({
    id: withdrawal._id,
    customerName: withdrawal.customer?.name || 'N/A',
    customerId: withdrawal.customer?.membershipId || 'N/A',
    customerBalance: withdrawal.customer?.accountBalance || 0,
    amount: withdrawal.amount || 0,
    status: withdrawal.status || 'pending',
    method: withdrawal.method || 'N/A',
    submittedAt: withdrawal.submittedAt ? new Date(withdrawal.submittedAt) : null,
    createdAt: new Date(withdrawal.createdAt),
    adminNotes: withdrawal.adminNotes || '',
    processedBy: withdrawal.processedBy || '',
    accountDetails: withdrawal.accountDetails || {}
  })) || [];

  // Extract data for compatibility
  const data = withdrawalsResponse || null;
  const loading = isLoading;

  return (
    <div style={{ 
      backgroundColor: '#ff0000', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: '#ffff00', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '5px solid #000000'
      }}>
        <h1 style={{ color: '#ff0000', margin: '0 0 10px 0', fontSize: '40px', fontWeight: 'bold' }}>
          🔥 CRITICAL TEST - RED TEXT - DEPLOYMENT CHECK 🔥
        </h1>
        <p style={{ color: '#ff0000', margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
          ⚠️ IF YOU SEE THIS RED TEXT, DEPLOYMENT IS WORKING! ⚠️
        </p>
      </div>

      {/* STATUS CARD */}
      <div style={{ 
        backgroundColor: loading ? '#fff3cd' : error ? '#f8d7da' : '#d4edda', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${loading ? '#ffc107' : error ? '#dc3545' : '#28a745'}`
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          {loading ? '⏳ Loading...' : error ? '❌ Error' : '✅ Data Loaded'}
        </h3>
        <div style={{ fontSize: '14px' }}>
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>Error:</strong> {error?.message || 'None'}</div>
          <div><strong>Data Available:</strong> {data ? 'Yes' : 'No'}</div>
          {data && <div><strong>Success:</strong> {data.success ? 'Yes' : 'No'}</div>}
          {data && <div><strong>Data Count:</strong> {data.data?.length || 0}</div>}
          {data && <div><strong>Total:</strong> {data.pagination?.total || 0}</div>}
          <div><strong>API Endpoint:</strong> /api/withdrawals</div>
          {data && <div><strong>First Item ID:</strong> {data.data?.[0]?._id || 'N/A'}</div>}
          {data && <div><strong>First Item Status:</strong> {data.data?.[0]?.status || 'N/A'}</div>}
        </div>
      </div>

      {/* RAW DATA DISPLAY */}
      {data && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #6c757d'
        }}>
          <h3 style={{ color: '#495057', margin: '0 0 15px 0' }}>
            📊 RAW API DATA
          </h3>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px',
            border: '1px solid #dee2e6',
            maxHeight: '300px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* MODERN TABLE - Same as TaskManagement */}
      {processedWithdrawals && processedWithdrawals.length > 0 && (
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              📋 Withdrawal Management ({processedWithdrawals.length} records)
            </h3>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Method</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedWithdrawals.map((withdrawal: any, index: number) => (
                <TableRow key={withdrawal.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm font-mono">
                    {withdrawal.id?.substring(0, 8) || index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{withdrawal.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {withdrawal.customerId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: {withdrawal.customerBalance}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    ${withdrawal.amount}
                  </TableCell>
                  <TableCell className="text-sm">
                    {withdrawal.method}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {withdrawal.submittedAt ? 
                      withdrawal.submittedAt.toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200">
                        View
                      </button>
                      <button className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200">
                        Approve
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
              <select className="w-20 text-sm border rounded px-1">
                <option value="100">100</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              {processedWithdrawals.length > 0 ? `1-${processedWithdrawals.length}` : '0'} of {processedWithdrawals.length}
            </div>
          </div>
        </div>
      )}

      {/* NO DATA MESSAGE */}
      {(data && (!data.data || data.data.length === 0)) || (!data && !loading && !error) && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>
            ⚠️ NO WITHDRAWAL DATA FOUND
          </h3>
          <p style={{ color: '#856404', margin: '0' }}>
            API Response: {data ? "Success but no data" : "No response"}
          </p>
          <p style={{ color: '#856404', margin: '5px 0 0 0', fontSize: '12px' }}>
            Debug: loading={loading ? 'true' : 'false'}, error={error ? 'true' : 'false'}, data={data ? 'true' : 'false'}
          </p>
        </div>
      )}

      {/* REFRESH BUTTON */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => refetch()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🔄 REFRESH DATA (Auto-refreshes every 5s)
        </button>
      </div>
    </div>
  );
}