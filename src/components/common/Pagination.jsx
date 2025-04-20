// src/components/common/Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pagesToShow = 3; // Reduced for mobile
  const pages = [];

  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  if (endPage - startPage + 1 < pagesToShow) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
      <div className="flex flex-col sm:flex-row justify-between items-center my-4 space-y-2 sm:space-y-0">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
        <div className="flex flex-wrap justify-center items-center space-x-1">
          {/* First and Previous buttons for mobile and desktop */}
          <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 transition-colors"
          >
            First
          </button>
          <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 transition-colors"
          >
            Prev
          </button>

          {/* Page numbers with responsive design */}
          {pages.map((page) => (
              <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm 
                        ${
                      currentPage === page
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-100"
                  } transition-colors`}
              >
                {page}
              </button>
          ))}

          {/* Next and Last buttons for mobile and desktop */}
          <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 transition-colors"
          >
            Next
          </button>
          <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-100 transition-colors"
          >
            Last
          </button>
        </div>
      </div>
  );
};

export default Pagination;