import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { transactionAPI } from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({
    receiverId: "",
    amount: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        transactionAPI.getBalance(),
        transactionAPI.getTransactions(),
      ]);

      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      await transactionAPI.transfer(
        parseInt(transferData.receiverId),
        parseFloat(transferData.amount)
      );

      alert("Transfer successful!");
      setTransferData({ receiverId: "", amount: "" });
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.error || "Transfer failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>Transaction Dashboard</h1>
            <p style={styles.headerSubtitle}>Welcome back, {user?.username}!</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.balance}>
              <div style={styles.balanceLabel}>Current Balance</div>
              <div style={styles.balanceAmount}>
                ${parseFloat(balance).toFixed(2)}
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.grid}>
          {/* Transfer Form */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Make a Transfer</h3>
            <form onSubmit={handleTransfer} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Receiver ID</label>
                <input
                  type="number"
                  style={styles.input}
                  value={transferData.receiverId}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      receiverId: e.target.value,
                    })
                  }
                  placeholder="Enter receiver's user ID"
                />
                <small style={styles.helpText}>
                  Tip: Bob's ID is 2, Charlie's ID is 3
                </small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={styles.input}
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <button type="submit" style={styles.submitButton}>
                Transfer Money
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <div style={{ ...styles.card, gridColumn: "span 2" }}>
            <h3 style={styles.cardTitle}>Transaction History</h3>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>No transactions yet</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Counterparty</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor:
                                tx.type === "CREDIT" ? "#d1fae5" : "#fee2e2",
                              color:
                                tx.type === "CREDIT" ? "#065f46" : "#991b1b",
                            }}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td style={styles.td}>
                          ${parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td style={styles.td}>{tx.counterparty}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor:
                                tx.status === "SUCCESS" ? "#d1fae5" : "#fef3c7",
                              color:
                                tx.status === "SUCCESS" ? "#065f46" : "#92400e",
                            }}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "1.25rem",
    color: "#6b7280",
  },
  header: {
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "1rem 0",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  balance: {
    textAlign: "right",
  },
  balanceLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  balanceAmount: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#111827",
  },
  logoutButton: {
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    color: "#374151",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.25rem",
  },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "1rem",
    outline: "none",
  },
  helpText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    padding: "3rem 1rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f9fafb",
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#374151",
  },
  badge: {
    display: "inline-block",
    padding: "0.25rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
};

export default Dashboard;
