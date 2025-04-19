import React, { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import DataTable from "../components/common/DataTable";
import api from "../services/api";

const PaymentMethods = () => {
  const { currentUser } = useAuth();
  const [params, setParams] = useState({
    per_page: 15,
    page: 1,
    sort_by: "created_at",
    sort_dir: "desc",
  });
  const [filter, setFilter] = useState({
    name: "",
    status: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [paymentMethodData, setPaymentMethodData] = useState({
    name: "",
    status: "active",
  });

  // Fetch payment methods with filters and pagination
  const {
    data: paymentMethodsData,
    loading,
    refetch,
  } = useFetch("/payment-methods", { params });

  // Apply filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setParams((prev) => ({ ...prev, ...filter, page: 1 }));
  };

  const resetFilters = () => {
    setFilter({
      name: "",
      status: "",
    });
    setParams({
      per_page: 15,
      page: 1,
      sort_by: "created_at",
      sort_dir: "desc",
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentMethodData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/payment-methods/${editingId}`, paymentMethodData);
      } else {
        await api.post("/payment-methods", paymentMethodData);
      }
      setShowForm(false);
      setEditingId(null);
      setPaymentMethodData({
        name: "",
        status: "active",
      });
      refetch();
    } catch (error) {
      console.error("Error saving payment method:", error.response?.data);
      alert("Failed to save payment method: " + error.response?.data?.message);
    }
  };

  const handleEdit = (paymentMethod) => {
    setPaymentMethodData({
      name: paymentMethod.name,
      status: paymentMethod.status,
    });
    setEditingId(paymentMethod.id);
    setShowForm(true);
  };

  const handleDelete = async (paymentMethod) => {
    if (!confirm(`Are you sure you want to delete ${paymentMethod.name}?`)) {
      return;
    }

    try {
      await api.delete(`/payment-methods/${paymentMethod.id}`);
      refetch();
    } catch (error) {
      console.error("Error deleting payment method:", error.response?.data);
      alert(
        "Failed to delete payment method: " + error.response?.data?.message
      );
    }
  };

  const columns = [
    { field: "id", header: "ID", sortable: true },
    { field: "name", header: "Name", sortable: true },
    { field: "status", header: "Status", sortable: true },
    {
      field: "created_at",
      header: "Created At",
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const isAdmin = currentUser?.role?.code === "admin";
  const isManager = currentUser?.role?.code === "manager";

  return (
    <div>
      <h1>Payment Methods</h1>

      <div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={filter.name}
            onChange={handleFilterChange}
            placeholder="Search by name"
          />

          {(isAdmin || isManager) && (
            <>
              <label>Status:</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          )}

          <button onClick={applyFilters}>Apply Filters</button>
          <button onClick={resetFilters}>Reset</button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setPaymentMethodData({
                name: "",
                status: "active",
              });
            }}
          >
            Add Payment Method
          </button>
        )}
      </div>

      <DataTable
        data={paymentMethodsData?.data || []}
        columns={columns}
        onEdit={isAdmin ? handleEdit : null}
        onDelete={isAdmin ? handleDelete : null}
        pagination={paymentMethodsData?.meta}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPerPageChange={(per_page) =>
          setParams((prev) => ({ ...prev, per_page, page: 1 }))
        }
        loading={loading}
      />

      {showForm && (
        <div>
          <h2>{editingId ? "Edit Payment Method" : "Add Payment Method"}</h2>

          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={paymentMethodData.name}
              onChange={handleInputChange}
              required
            />

            <label>Status:</label>
            <select
              name="status"
              value={paymentMethodData.status}
              onChange={handleInputChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div>
              <button onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
