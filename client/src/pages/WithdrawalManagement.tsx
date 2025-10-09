import { useEffect, useState } from "react";

interface WithdrawalData {
  _id: string;
  customerId: string;
  amount: number;
  status: string;
  method: string;
  submittedAt: string;
  customer: {
    _id: string;
    name: string;
    membershipId: string;
    accountBalance: number;
  };
  accountDetails: {
    accountHolderName: string;
    accountNumber: string;
    mobileNumber: string;
    provider: string;
  };
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchWithdrawals = async () => {
    try {
      console.log("🔍 Fetching real database data...");
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/withdrawals?_t=" + Date.now(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log("🔍 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("🔍 Real API Response:", result);
      
      if (result.success && result.data) {
        setWithdrawals(result.data);
        setLastUpdate(new Date().toLocaleString());
        console.log(`✅ Loaded ${result.data.length} withdrawals from database`);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawalStatus = async (id: string, status: string) => {
    try {
      console.log(`🔄 Updating withdrawal ${id} to ${status}`);
      
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

      const result = await response.json();
      console.log("✅ Update result:", result);
      
      // Refresh data after update
      fetchWithdrawals();
      
      alert(`Withdrawal ${status} successfully!`);
    } catch (err: any) {
      console.error("❌ Update error:", err);
      alert(`Failed to update withdrawal: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '2px solid #007bff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#007bff', 
          margin: '0 0 10px 0',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          💰 WITHDRAWAL MANAGEMENT
        </h1>
        <div style={{ color: '#666', fontSize: '14px' }}>
          <div><strong>Database:</strong> MongoDB (Real Data)</div>
          <div><strong>Last Updated:</strong> {lastUpdate || 'Never'}</div>
          <div><strong>Status:</strong> 
            <span style={{ 
              color: loading ? '#ffc107' : error ? '#dc3545' : '#28a745',
              fontWeight: 'bold'
            }}>
              {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div style={{ 
        backgroundColor: loading ? '#fff3cd' : error ? '#f8d7da' : '#d4edda', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${loading ? '#ffc107' : error ? '#dc3545' : '#28a745'}`
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
          {loading ? '⏳ Loading Real Database Data...' : 
           error ? '❌ Database Connection Error' : 
           `✅ Connected to Database (${withdrawals.length} withdrawals)`}
        </h3>
        {error && (
          <div style={{ color: '#721c24', fontSize: '14px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {!loading && !error && (
          <div style={{ color: '#155724', fontSize: '14px' }}>
            <div><strong>Total Withdrawals:</strong> {withdrawals.length}</div>
            <div><strong>Database:</strong> MongoDB (iconicdigital)</div>
            <div><strong>Collection:</strong> withdrawals</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <button 
          onClick={fetchWithdrawals}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Data Table */}
      {!loading && !error && withdrawals.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #28a745',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: '#28a745', 
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            📊 REAL DATABASE DATA ({withdrawals.length} records)
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal, index) => (
                  <tr key={withdrawal._id} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                  }}>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontFamily: 'monospace', fontSize: '12px' }}>
                      {withdrawal._id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {withdrawal.customer?.name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          ID: {withdrawal.customer?.membershipId || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          Balance: {withdrawal.customer?.accountBalance || 0}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>
                      ৳{withdrawal.amount || 0}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {withdrawal.method?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        backgroundColor: withdrawal.status === 'completed' ? '#d4edda' : 
                                       withdrawal.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                        color: withdrawal.status === 'completed' ? '#155724' : 
                               withdrawal.status === 'rejected' ? '#721c24' : '#856404',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {withdrawal.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '12px' }}>
                      {withdrawal.submittedAt ? 
                        new Date(withdrawal.submittedAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {withdrawal.status !== 'completed' && (
                          <button
                            onClick={() => updateWithdrawalStatus(withdrawal._id, 'completed')}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              padding: '4px 8px',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            ✅ Approve
                          </button>
                        )}
                        {withdrawal.status !== 'rejected' && (
                          <button
                            onClick={() => updateWithdrawalStatus(withdrawal._id, 'rejected')}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              padding: '4px 8px',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            ❌ Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && !error && withdrawals.length === 0 && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>
            ⚠️ NO WITHDRAWAL DATA FOUND IN DATABASE
          </h3>
          <p style={{ color: '#856404', margin: '0' }}>
            The withdrawals collection is empty or no data matches the current query.
          </p>
        </div>
      )}

      {/* Debug Info */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🔍 Debug Information</h4>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          <div><strong>Version:</strong> v13.0 - IMPROVED WITHDRAWAL MANAGEMENT</div>
          <div><strong>API Endpoint:</strong> /api/withdrawals</div>
          <div><strong>Database:</strong> MongoDB (iconicdigital)</div>
          <div><strong>Collection:</strong> withdrawals</div>
          <div><strong>Data Source:</strong> Real Database (Not Mock)</div>
          <div><strong>Last Fetch:</strong> {lastUpdate || 'Never'}</div>
          <div><strong>Deployment:</strong> {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}