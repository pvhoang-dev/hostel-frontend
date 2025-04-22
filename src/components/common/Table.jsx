import { useEffect, useRef } from "react";
import Pagination from "./Pagination";

const Table = ({
  data = [],
  columns,
  pagination = null,
  onPageChange = () => {},
  loading = false,
  actionColumn = null,
}) => {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  // Initialize DataTable when data changes
  useEffect(() => {
    if (tableRef.current && data.length > 0) {
      // Destroy existing DataTable instance if it exists
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }

      // Initialize a new DataTable instance
      dataTableRef.current = $(tableRef.current).DataTable({
        responsive: true,
        paging: false, // We'll use our own pagination component
        ordering: true,
        info: false,
        searching: false, // Using custom filter above
        language: {
          emptyTable: "Không có dữ liệu",
        },
      });
    }

    // Cleanup on component unmount
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Generate table headers from columns
  const headers = columns.map((column) => (
    <th key={column.accessorKey}>{column.header}</th>
  ));

  // Generate table rows from data
  const rows = data.map((item) => (
    <tr key={item.id}>
      {columns.map((column) => {
        // For action column, render the action buttons
        if (actionColumn && column.accessorKey === actionColumn.key) {
          return (
            <td key={column.accessorKey} className="table-action">
              {actionColumn.actions.map((action, index) => (
                <a
                  key={index}
                  href="javascript: void(0);"
                  className="action-icon"
                  onClick={() => action.handler(item)}
                >
                  <i className={`mdi ${action.icon}`}></i>
                </a>
              ))}
            </td>
          );
        }

        // For other columns, use cell renderer if provided, otherwise access data directly
        return (
          <td key={column.accessorKey}>
            {column.cell
              ? column.cell({ row: { original: item } })
              : item[column.accessorKey]}
          </td>
        );
      })}
    </tr>
  ));

  return (
    <div className="table-responsive">
      <table ref={tableRef} className="table dt-responsive nowrap w-100">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>
          {rows}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default Table;
