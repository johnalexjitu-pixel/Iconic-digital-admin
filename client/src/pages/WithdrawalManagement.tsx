import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";

export default function WithdrawalManagement() {
  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [customerIdFilter, setCustomerIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Update states
  const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
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
  const allProcessedWithdrawals = withdrawalsResponse?.data?.map((withdrawal: any, index: number) => ({
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

  // Filter withdrawals based on filters
  const filteredWithdrawals = useMemo(() => {
    return allProcessedWithdrawals.filter(withdrawal => {
      const matchesStatus = !statusFilter || withdrawal.status === statusFilter;
      const matchesMethod = !methodFilter || withdrawal.method === methodFilter;
      const matchesCustomerId = !customerIdFilter || 
        withdrawal.customerId.toString().toLowerCase().includes(customerIdFilter.toLowerCase());
      
      return matchesStatus && matchesMethod && matchesCustomerId;
    });
  }, [allProcessedWithdrawals, statusFilter, methodFilter, customerIdFilter]);

  // Apply pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const processedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Extract data for compatibility
  const data = withdrawalsResponse || null;
  const loading = isLoading;

  // Update withdrawal status function
  const updateWithdrawalStatus = async (withdrawalId: string, newStatus: 'completed' | 'rejected') => {
    setUpdatingWithdrawal(withdrawalId);
    setUpdateMessage(null);
    
    try {
      const response = await fetch(`/api/frontend/withdrawals/${withdrawalId}/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: `Status updated to ${newStatus} by admin`,
          processedBy: 'Admin',
          processedAt: new Date().toISOString()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUpdateMessage({
          type: 'success',
          text: `Withdrawal ${newStatus} successfully!`
        });
        // Refresh data after successful update
        refetch();
        // Clear message after 3 seconds
        setTimeout(() => setUpdateMessage(null), 3000);
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.error || 'Failed to update withdrawal status'
        });
      }
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setUpdatingWithdrawal(null);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#495057', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>
          Withdrawal Management
        </h1>
        <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>
          Manage withdrawal requests and transactions - Auto-refresh every 5s
        </p>
      </div>

      {/* FILTERING SECTION */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>
          Filter Withdrawals
        </h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6c757d' }}>
              Status:
            </label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ced4da', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6c757d' }}>
              Method:
            </label>
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ced4da', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">All Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#6c757d' }}>
              Customer ID:
            </label>
            <input 
              type="text" 
              placeholder="Enter customer ID"
              value={customerIdFilter}
              onChange={(e) => setCustomerIdFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ced4da', 
                borderRadius: '4px',
                fontSize: '14px',
                width: '150px'
              }}
            />
          </div>
          <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setStatusFilter("");
                setMethodFilter("");
                setCustomerIdFilter("");
                setCurrentPage(1); // Reset to first page when clearing filters
              }}
              style={{ 
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear
            </button>
            <button 
              onClick={() => setCurrentPage(1)} // Reset to first page when applying filters
              style={{ 
                backgroundColor: '#6f42c1',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* STATUS CARD */}
      {loading && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffc107'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>
            ⏳ Loading withdrawal data...
          </h3>
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dc3545'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>
             Error loading data
          </h3>
          <p style={{ margin: '0', color: '#721c24', fontSize: '14px' }}>
            {error.message}
          </p>
        </div>
      )}

      {/* UPDATE MESSAGE */}
      {updateMessage && (
        <div style={{ 
          backgroundColor: updateMessage.type === 'success' ? '#d4edda' : '#f8d7da', 
            padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${updateMessage.type === 'success' ? '#28a745' : '#dc3545'}`
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            color: updateMessage.type === 'success' ? '#155724' : '#721c24'
          }}>
            {updateMessage.type === 'success' ? ' Success' : ' Error'}
          </h3>
          <p style={{ 
            margin: '0', 
            color: updateMessage.type === 'success' ? '#155724' : '#721c24',
            fontSize: '14px'
          }}>
            {updateMessage.text}
          </p>
        </div>
      )}

      {/* MODERN TABLE - Same as TaskManagement */}
      {processedWithdrawals && processedWithdrawals.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef' }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#495057',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Withdrawal Requests ({processedWithdrawals.length} of {filteredWithdrawals.length} records)
          </h3>
            <p style={{ 
              margin: '0', 
              color: '#6c757d',
              fontSize: '14px'
            }}>
              {statusFilter || methodFilter || customerIdFilter ? 
                `Filtered by: ${[statusFilter && `Status: ${statusFilter}`, methodFilter && `Method: ${methodFilter}`, customerIdFilter && `Customer ID: ${customerIdFilter}`].filter(Boolean).join(', ')}` :
                'Showing all withdrawal requests with real-time updates'
              }
            </p>
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
                      <button 
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        onClick={() => {
                          console.log('View button clicked, withdrawal data:', withdrawal);
                          setSelectedWithdrawal(withdrawal);
                          setShowModal(true);
                        }}
                      >
                        View
                      </button>
                      
                      {withdrawal.status === 'pending' && (
                        <>
                          <button 
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 disabled:opacity-50"
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                            disabled={updatingWithdrawal === withdrawal.id}
                          >
                            {updatingWithdrawal === withdrawal.id ? 'Updating...' : 'Approve'}
                          </button>
                          <button 
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                            disabled={updatingWithdrawal === withdrawal.id}
                          >
                            {updatingWithdrawal === withdrawal.id ? 'Updating...' : 'Reject'}
                          </button>
                        </>
                      )}
                      
                      {withdrawal.status === 'completed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                          Completed
                        </span>
                      )}
                      
                      {withdrawal.status === 'rejected' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                          Rejected
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <select 
                className="w-20 text-sm border rounded px-1"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} 
                ({filteredWithdrawals.length} total withdrawals)
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 p-0 text-xs rounded ${
                          currentPage === pageNum 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <button
                        className={`w-8 h-8 p-0 text-xs rounded ${
                          currentPage === totalPages 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
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
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px',
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => refetch()}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginRight: '10px'
          }}
        >
          Refresh Data
        </button>
        <span style={{ 
          color: '#6c757d',
          fontSize: '14px'
        }}>
          Auto-refreshes every 5 seconds
        </span>
      </div>

      {/* WITHDRAWAL DETAILS MODAL */}
      {showModal && selectedWithdrawal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid #e9ecef',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#495057',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Withdrawal Details
              </h2>
              <button
                onClick={() => {
                  console.log('Closing modal');
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content - Simplified */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Basic Information */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#495057', fontSize: '18px' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Withdrawal ID:</strong>
                    <div style={{ color: '#495057', fontSize: '16px', fontFamily: 'monospace' }}>
                      {selectedWithdrawal?.id || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Amount:</strong>
                    <div style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>
                      ${selectedWithdrawal?.amount || '0'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Method:</strong>
                    <div style={{ color: '#495057', fontSize: '16px', textTransform: 'capitalize' }}>
                      {selectedWithdrawal?.method || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Status:</strong>
                    <div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: selectedWithdrawal?.status === 'completed' ? '#d4edda' : 
                                       selectedWithdrawal?.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                        color: selectedWithdrawal?.status === 'completed' ? '#155724' : 
                               selectedWithdrawal?.status === 'rejected' ? '#721c24' : '#856404'
                      }}>
                        {selectedWithdrawal?.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#495057', fontSize: '18px' }}>
                  Customer Information
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Customer Name:</strong>
                    <div style={{ color: '#495057', fontSize: '16px', fontWeight: '500' }}>
                      {selectedWithdrawal?.customerName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Customer ID:</strong>
                    <div style={{ color: '#495057', fontSize: '16px', fontFamily: 'monospace' }}>
                      {selectedWithdrawal?.customerId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Account Balance:</strong>
                    <div style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
                      ${selectedWithdrawal?.customerBalance || '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              {selectedWithdrawal?.accountDetails && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#495057', fontSize: '18px' }}>
                    Account Details
                  </h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Account Holder Name:</strong>
                      <div style={{ color: '#495057', fontSize: '16px', fontWeight: '500' }}>
                        {selectedWithdrawal.accountDetails.accountHolderName || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Account Number:</strong>
                      <div style={{ color: '#495057', fontSize: '16px', fontFamily: 'monospace' }}>
                        {selectedWithdrawal.accountDetails.accountNumber || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Mobile Number:</strong>
                      <div style={{ color: '#495057', fontSize: '16px', fontFamily: 'monospace' }}>
                        {selectedWithdrawal.accountDetails.mobileNumber || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Provider:</strong>
                      <div style={{ color: '#495057', fontSize: '16px', textTransform: 'capitalize' }}>
                        {selectedWithdrawal.accountDetails.provider || 'N/A'}
                      </div>
                    </div>
                    {selectedWithdrawal.accountDetails.bankName && (
                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '14px' }}>Bank Name:</strong>
                        <div style={{ color: '#495057', fontSize: '16px' }}>
                          {selectedWithdrawal.accountDetails.bankName}
                        </div>
                      </div>
                    )}
                    {selectedWithdrawal.accountDetails.branch && (
                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '14px' }}>Branch:</strong>
                        <div style={{ color: '#495057', fontSize: '16px' }}>
                          {selectedWithdrawal.accountDetails.branch}
                        </div>
                      </div>
                    )}
                    {selectedWithdrawal.accountDetails.usdtAddress && (
                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '14px' }}>USDT Address:</strong>
                        <div style={{ color: '#495057', fontSize: '16px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {selectedWithdrawal.accountDetails.usdtAddress}
                        </div>
                      </div>
                    )}
                    {selectedWithdrawal.accountDetails.usdtNetwork && (
                      <div>
                        <strong style={{ color: '#6c757d', fontSize: '14px' }}>USDT Network:</strong>
                        <div style={{ color: '#495057', fontSize: '16px' }}>
                          {selectedWithdrawal.accountDetails.usdtNetwork}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              {selectedWithdrawal?.accountDetails?.uploadedDocuments && selectedWithdrawal.accountDetails.uploadedDocuments.length > 0 && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#495057', fontSize: '18px' }}>
                    Uploaded Documents
                  </h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {selectedWithdrawal.accountDetails.uploadedDocuments.map((doc: any, index: number) => (
                      <div key={doc.documentId || index} style={{
                        backgroundColor: '#ffffff',
                        padding: '15px',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ color: '#495057', fontSize: '16px' }}>
                            {doc.fileName || 'Document'}
                          </strong>
                          <span style={{
                            backgroundColor: '#e9ecef',
                            color: '#495057',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {doc.fileType || 'Unknown Type'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                          <div>
                            <strong style={{ color: '#6c757d' }}>Document ID:</strong>
                            <div style={{ color: '#495057', fontFamily: 'monospace' }}>
                              {doc.documentId || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <strong style={{ color: '#6c757d' }}>File Size:</strong>
                            <div style={{ color: '#495057' }}>
                              {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                            </div>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <strong style={{ color: '#6c757d' }}>Uploaded At:</strong>
                            <div style={{ color: '#495057' }}>
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#495057', fontSize: '18px' }}>
                  Transaction Details
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Submitted Date:</strong>
                    <div style={{ color: '#495057', fontSize: '16px' }}>
                      {selectedWithdrawal?.submittedAt ? new Date(selectedWithdrawal.submittedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Created Date:</strong>
                    <div style={{ color: '#495057', fontSize: '16px' }}>
                      {selectedWithdrawal?.createdAt ? new Date(selectedWithdrawal.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  {selectedWithdrawal?.processedBy && (
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Processed By:</strong>
                      <div style={{ color: '#495057', fontSize: '16px' }}>
                        {selectedWithdrawal.processedBy}
                      </div>
                    </div>
                  )}
                  {selectedWithdrawal?.adminNotes && (
                    <div>
                      <strong style={{ color: '#6c757d', fontSize: '14px' }}>Admin Notes:</strong>
                      <div style={{ 
                        color: '#495057', 
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        marginTop: '5px'
                      }}>
                        {selectedWithdrawal.adminNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              marginTop: '25px',
              paddingTop: '15px',
              borderTop: '2px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  console.log('Closing modal from footer');
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}