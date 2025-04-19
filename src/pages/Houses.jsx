// src/pages/Houses.jsx
import React, { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import DataTable from "../components/common/DataTable";
import { useAuth } from "../hooks/useAuth";

const Houses = () => {
  const { currentUser } = useAuth();
  const [params, setParams] = useState({
    per_page: 15,
    page: 1,
    include: "manager,rooms",
  });

  // Filter houses by manager for manager role
  useEffect(() => {
    if (currentUser?.role?.code === "manager") {
      setParams((prev) => ({ ...prev, manager_id: currentUser.id }));
    }
  }, [currentUser]);

  const { data: housesData, loading } = useFetch("/houses", { params });

  const columns = [
    { field: "id", header: "ID", sortable: true },
    { field: "name", header: "Name", sortable: true },
    { field: "address", header: "Address" },
    {
      field: "manager_id",
      header: "Manager",
      render: (row) => (row.manager ? `${row.manager.name}` : "Not assigned"),
    },
    {
      field: "rooms",
      header: "Rooms",
      render: (row) => (row.rooms ? row.rooms.length : 0),
    },
  ];

  return (
    <div>
      <h1>House Management</h1>

      <DataTable
        data={housesData?.data || []}
        columns={columns}
        pagination={housesData?.meta}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        loading={loading}
      />
    </div>
  );
};

export default Houses;
