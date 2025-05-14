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
  const tableId = useRef(`table-${Math.random().toString(36).substring(2, 9)}`);

  // Xử lý các nút hành động
  const bindActionButtons = () => {
    if (!tableRef.current || !actionColumn) return;
    
    // Xoá tất cả event listeners cũ để tránh duplicate
    $(document).off('click', `#${tableId.current} .action-btn`);
    
    // Sử dụng event delegation cho bảng hiện tại
    $(document).on('click', `#${tableId.current} .action-btn`, function(e) {
      e.preventDefault();
      const $button = $(this);
      const itemId = $button.data('item-id');
      const actionType = $button.data('action-type');
      
      // Tìm item tương ứng với ID
      const item = data.find(item => item.id.toString() === itemId.toString());
      
      if (item && actionColumn.actions[actionType]) {
        try {
          actionColumn.actions[actionType].handler(item);
        } catch (error) {
          console.error('Error in action handler:', error);
          alert(`Lỗi khi thực hiện hành động: ${error.message}`);
        }
      }
    });
  };

  // Khởi tạo DataTable khi data thay đổi
  useEffect(() => {
    if (tableRef.current && data.length > 0) {
      // Đảm bảo bảng có ID duy nhất
      $(tableRef.current).attr('id', tableId.current);
      
      // Xóa bảng DataTable cũ nếu tồn tại
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
          // Xóa thuộc tính DataTable
          $(tableRef.current)
            .removeClass('dataTable')
            .removeClass('no-footer')
            .removeClass('nowrap')
            .removeAttr('aria-describedby')
            .find('tbody tr').removeClass('child');
        } catch (error) {
          console.error("Error destroying DataTable:", error);
        }
      }

      // Khởi tạo lại DataTable sau khi DOM cập nhật
      setTimeout(() => {
        dataTableRef.current = $(tableRef.current).DataTable({
          destroy: true,
          responsive: true,
          paging: false,
          ordering: true,
          info: false,
          searching: false,
          language: {
            emptyTable: "Không có dữ liệu",
          },
          responsive: {
            details: {
              display: $.fn.dataTable.Responsive.display.childRow,
              renderer: function(api, rowIdx, columns) {
                var data = $.map(columns, function(col, i) {
                  return col.hidden ?
                    '<li data-dtr-index="' + i + '">' +
                      '<span class="dtr-title">' + col.title + '</span> ' +
                      '<span class="dtr-data">' + col.data + '</span>' +
                    '</li>' : '';
                }).join('');
                
                return data ? $('<ul class="dtr-details"/>').append(data) : false;
              }
            }
          }
        });

        // Đăng ký event handlers
        bindActionButtons();
      }, 600);
    }

    // Cleanup khi unmount
    return () => {
      $(document).off('click', `#${tableId.current} .action-btn`);
      
      if (dataTableRef.current) {
        try {
          dataTableRef.current.destroy();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
        dataTableRef.current = null;
      }
    };
  }, [data, actionColumn]);

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Tạo header từ columns
  const headers = columns.map((column) => (
    <th key={column.accessorKey}>{column.header}</th>
  ));

  // Tạo rows từ data
  const rows = data.map((item) => (
    <tr key={item.id}>
      {columns.map((column) => {
        // Cột hành động
        if (actionColumn && column.accessorKey === actionColumn.key) {
          return (
            <td key={column.accessorKey} className="table-action">
              {actionColumn.actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-link p-0 mx-1 action-icon action-btn"
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                  data-item-id={item.id}
                  data-action-type={index}
                >
                  <i className={`mdi ${action.icon}`}></i>
                </button>
              ))}
            </td>
          );
        }

        // Các cột khác
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
