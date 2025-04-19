import React, { useState } from "react";

const DataTable = ({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onPerPageChange,
  loading,
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() => column.sortable && handleSort(column.field)}
                style={{ cursor: column.sortable ? "pointer" : "default" }}
              >
                {column.header}
                {sortField === column.field && (
                  <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                )}
              </th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((column) => (
                <td key={`${row.id}-${column.field}`}>
                  {column.render ? column.render(row) : row[column.field]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div>
          <div>
            <span>
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              entries
            </span>
            <select
              value={pagination.per_page}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div>
            <button
              disabled={pagination.current_page === 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
            >
              Previous
            </button>

            {[...Array(pagination.last_page).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => onPageChange(page + 1)}
                disabled={pagination.current_page === page + 1}
              >
                {page + 1}
              </button>
            ))}

            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => onPageChange(pagination.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
