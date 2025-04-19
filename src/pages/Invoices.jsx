// src/pages/Invoices.jsx
import React, { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import DataTable from "../components/common/DataTable";
import api from "../services/api";

const Invoices = () => {
  const { currentUser } = useAuth();
  const [params, setParams] = useState({
    per_page: 15,
    page: 1,
    sort_by: "year",
    sort_dir: "desc",
    include: "room,items",
  });
  const [filter, setFilter] = useState({
    room_id: "",
    invoice_type: "",
    month: "",
    year: "",
    created_from: "",
    created_to: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    room_id: "",
    invoice_type: "custom",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: "",
    items: [{ source_type: "manual", amount: 0, description: "" }],
  });
  const [rooms, setRooms] = useState([]);

  // Fetch invoices with filters and pagination
  const {
    data: invoicesData,
    loading,
    refetch,
  } = useFetch("/invoices", { params });

  useEffect(() => {
    // Load rooms for dropdown
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");
        setRooms(response.data.data);
      } catch (error) {
        console.error("Error loading rooms:", error);
      }
    };

    fetchRooms();
  }, []);

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
      room_id: "",
      invoice_type: "",
      month: "",
      year: "",
      created_from: "",
      created_to: "",
    });
    setParams({
      per_page: 15,
      page: 1,
      sort_by: "year",
      sort_dir: "desc",
      include: "room,items",
    });
  };

  // Form handlers
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    setInvoiceData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { source_type: "manual", amount: 0, description: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    setInvoiceData((prev) => ({ ...prev, items: updatedItems }));
  };

  const createInvoice = async () => {
    try {
      await api.post("/invoices", invoiceData);
      setShowForm(false);
      refetch();
      setInvoiceData({
        room_id: "",
        invoice_type: "custom",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        description: "",
        items: [{ source_type: "manual", amount: 0, description: "" }],
      });
    } catch (error) {
      console.error("Error creating invoice:", error.response?.data);
      alert("Failed to create invoice: " + error.response?.data?.message);
    }
  };

  const columns = [
    { field: "id", header: "ID", sortable: true },
    {
      field: "room_id",
      header: "Room",
      render: (row) =>
        row.room ? `${row.room.house.name} - ${row.room.name}` : "N/A",
    },
    { field: "invoice_type", header: "Type", sortable: true },
    { field: "month", header: "Month", sortable: true },
    { field: "year", header: "Year", sortable: true },
    { field: "total_amount", header: "Amount", sortable: true },
    {
      field: "created_at",
      header: "Created At",
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1>Invoice Management</h1>

      <div>
        <div>
          <label>Room:</label>
          <select
            name="room_id"
            value={filter.room_id}
            onChange={handleFilterChange}
          >
            <option value="">All Rooms</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.house?.name} - {room.name}
              </option>
            ))}
          </select>

          <label>Invoice Type:</label>
          <select
            name="invoice_type"
            value={filter.invoice_type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="custom">Custom</option>
            <option value="service_usage">Service Usage</option>
          </select>

          <label>Month:</label>
          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <label>Year:</label>
          <input
            type="number"
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            placeholder="Year"
          />

          <label>Created From:</label>
          <input
            type="date"
            name="created_from"
            value={filter.created_from}
            onChange={handleFilterChange}
          />

          <label>Created To:</label>
          <input
            type="date"
            name="created_to"
            value={filter.created_to}
            onChange={handleFilterChange}
          />

          <button onClick={applyFilters}>Apply Filters</button>
          <button onClick={resetFilters}>Reset</button>
        </div>

        {["admin", "manager"].includes(currentUser?.role?.code) && (
          <button onClick={() => setShowForm(true)}>Create New Invoice</button>
        )}
      </div>

      <DataTable
        data={invoicesData?.data || []}
        columns={columns}
        pagination={invoicesData?.meta}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPerPageChange={(per_page) =>
          setParams((prev) => ({ ...prev, per_page, page: 1 }))
        }
        loading={loading}
      />

      {showForm && (
        <div>
          <h2>Create New Invoice</h2>

          <div>
            <label>Room:</label>
            <select
              name="room_id"
              value={invoiceData.room_id}
              onChange={handleInvoiceChange}
              required
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.house?.name} - {room.name}
                </option>
              ))}
            </select>

            <label>Invoice Type:</label>
            <select
              name="invoice_type"
              value={invoiceData.invoice_type}
              onChange={handleInvoiceChange}
              required
            >
              <option value="custom">Custom</option>
              <option value="service_usage">Service Usage</option>
            </select>

            <label>Month:</label>
            <select
              name="month"
              value={invoiceData.month}
              onChange={handleInvoiceChange}
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <label>Year:</label>
            <input
              type="number"
              name="year"
              value={invoiceData.year}
              onChange={handleInvoiceChange}
              required
            />

            <label>Description:</label>
            <textarea
              name="description"
              value={invoiceData.description}
              onChange={handleInvoiceChange}
            />

            <h3>Invoice Items</h3>
            {invoiceData.items.map((item, index) => (
              <div key={index}>
                <select
                  value={item.source_type}
                  onChange={(e) =>
                    handleItemChange(index, "source_type", e.target.value)
                  }
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="service_usage">Service Usage</option>
                </select>

                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) =>
                    handleItemChange(index, "amount", parseInt(e.target.value))
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />

                {invoiceData.items.length > 1 && (
                  <button onClick={() => removeItem(index)}>Remove</button>
                )}
              </div>
            ))}

            <button onClick={addItem}>Add Item</button>

            <div>
              <button onClick={createInvoice}>Create Invoice</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
