import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { transactionAPI } from "../services/api";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [transferData, setTransferData] = useState({
    receiverId: "",
    amount: "",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // Only run once on mount
    if (initialized) return;

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // If no auth data in localStorage, redirect to login
      if (!token || !storedUser) {
        navigate("/login");
        return;
      }

      // If we have localStorage data but auth context hasn't loaded yet,
      // wait for it (the user will be loaded by AuthContext)
      setInitialized(true);
    };

    // Small delay to allow AuthContext to initialize
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate, initialized]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
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

    if (
      !transferData.receiverId ||
      !transferData.amount ||
      transferData.amount <= 0
    ) {
      alert("Please enter valid receiver ID and amount");
      return;
    }

    if (transferData.receiverId === user.id.toString()) {
      alert("Cannot transfer to yourself");
      return;
    }

    setTransferLoading(true);

    try {
      const response = await transactionAPI.transfer(
        parseInt(transferData.receiverId),
        parseFloat(transferData.amount)
      );

      alert(
        `✅ Transfer successful!\nNew balance: $${response.data.newBalance}`
      );

      // Reset form
      setTransferData({ receiverId: "", amount: "" });

      // Refresh data
      fetchData();
    } catch (error) {
      alert(`❌ ${error.response?.data?.error || "Transfer failed"}`);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        tx.counterparty?.toLowerCase().includes(searchLower) ||
        tx.amount.toString().includes(searchTerm) ||
        tx.status.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = filterType === "all" || tx.type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Transaction System
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time money transfers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm text-gray-500">Welcome</div>
                <div className="font-medium text-gray-900">
                  {user?.username}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-4 py-2">
                <div className="text-sm text-gray-700">Balance:</div>
                <div className="font-bold text-blue-700">
                  {formatCurrency(balance)}
                </div>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transfer Form */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Make a Transfer
                  </h2>
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receiver ID
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={transferData.receiverId}
                      onChange={(e) =>
                        setTransferData({
                          ...transferData,
                          receiverId: e.target.value,
                        })
                      }
                      placeholder="Enter receiver's user ID"
                      disabled={transferLoading}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Available users: Bob (ID: 2), Charlie (ID: 3)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field pl-7"
                        value={transferData.amount}
                        onChange={(e) =>
                          setTransferData({
                            ...transferData,
                            amount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        disabled={transferLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={transferLoading}
                    className="btn-primary w-full py-3 font-medium"
                  >
                    {transferLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      "Transfer Money"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTransferData({
                          receiverId: "2",
                          amount: "100",
                        })
                      }
                      className="text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                    >
                      Send $100 to Bob
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTransferData({
                          receiverId: "3",
                          amount: "50",
                        })
                      }
                      className="text-sm px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                    >
                      Send $50 to Charlie
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Transaction Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total Transactions</span>
                      <span className="font-medium">{transactions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(transactions.length * 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total Sent</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(
                          transactions
                            .filter((tx) => tx.type === "DEBIT")
                            .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total Received</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          transactions
                            .filter((tx) => tx.type === "CREDIT")
                            .reduce((sum, tx) => sum + tx.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <div className="card animate-fade-in">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Transaction History
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredTransactions.length} transactions found
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Search */}
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filter */}
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="DEBIT">Sent</option>
                      <option value="CREDIT">Received</option>
                    </select>

                    {/* Export */}
                    <button
                      onClick={() => {
                        const csv = [
                          ["Date", "Type", "Amount", "Counterparty", "Status"],
                          ...filteredTransactions.map((tx) => [
                            new Date(tx.timestamp).toLocaleString(),
                            tx.type,
                            tx.amount,
                            tx.counterparty,
                            tx.status,
                          ]),
                        ]
                          .map((row) => row.join(","))
                          .join("\n");

                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `transactions_${
                          new Date().toISOString().split("T")[0]
                        }.csv`;
                        a.click();
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm || filterType !== "all"
                        ? "No transactions match your search criteria. Try adjusting your filters."
                        : "Make your first transfer to see transaction history here."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Counterparty
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date & Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-lg mr-3 ${
                                    tx.type === "CREDIT"
                                      ? "bg-green-50 text-green-600"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {tx.type === "CREDIT" ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {tx.type === "CREDIT" ? "Received" : "Sent"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {tx.type === "CREDIT"
                                      ? "Incoming"
                                      : "Outgoing"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`font-medium ${
                                  tx.type === "CREDIT"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {tx.type === "CREDIT" ? "+" : "-"}
                                {formatCurrency(tx.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {tx.counterparty}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID:{" "}
                                    {tx.type === "DEBIT"
                                      ? tx.receiverId
                                      : tx.senderId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {tx.status === "SUCCESS" ? (
                                  <svg
                                    className="w-4 h-4 text-green-500 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4 text-red-500 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tx.status === "SUCCESS"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(tx.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Transaction System • Secure Real-time Money Transfers</p>
            <p className="mt-1">
              Built with Node.js, PostgreSQL, React & Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
