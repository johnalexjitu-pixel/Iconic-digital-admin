import { useState, useEffect } from "react";

export default function WithdrawalManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithdrawals = async () => {
    try {
      console.log("🔍 Fetching withdrawals...");
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
      console.log("🔍 API Response:", result);
      console.log("🔍 Data array length:", result.data?.length);
      console.log("🔍 First item:", result.data?.[0]);
      
      setData(result);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchWithdrawals, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#f0f8ff', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: '#e6f3ff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '2px solid #4CAF50'
      }}>
        <h1 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>
          🚀 WITHDRAWAL MANAGEMENT - DIRECT FETCH
        </h1>
        <p style={{ color: '#666', margin: '0' }}>
          Version: v12.2 - Using useState/useEffect (Direct fetch) - Auto-refresh every 5s
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
          <div><strong>Error:</strong> {error || 'None'}</div>
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

      {/* SIMPLE TABLE */}
      {data && data.data && data.data.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #007bff'
        }}>
          <h3 style={{ color: '#007bff', margin: '0 0 20px 0' }}>
            📋 WITHDRAWAL DATA TABLE
          </h3>
          
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
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((withdrawal, index) => (
                <tr key={withdrawal._id || index} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                }}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', fontFamily: 'monospace' }}>
                    {withdrawal._id?.substring(0, 8) || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
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
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#28a745' }}>
                    {withdrawal.amount || 0}
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
                </tr>
              ))}
            </tbody>
          </table>
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
          onClick={fetchWithdrawals}
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