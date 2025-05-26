import React, { useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import { statisticsService } from "../../../api/statistics";
import useAlert from "../../../hooks/useAlert";

const ExportReport = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("overview");
  const [fileFormat, setFileFormat] = useState("pdf");
  const { showSuccess, showError } = useAlert();

  // Danh sách loại báo cáo
  const reportTypeOptions = [
    { value: "overview", label: "Tổng quan" },
    { value: "contracts", label: "Hợp đồng" },
    { value: "revenue", label: "Doanh thu" },
    { value: "services", label: "Dịch vụ" },
    { value: "equipment", label: "Thiết bị" },
  ];

  // Danh sách định dạng file
  const fileFormatOptions = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
  ];

  // Xử lý thay đổi loại báo cáo
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  // Xử lý thay đổi định dạng file
  const handleFileFormatChange = (e) => {
    setFileFormat(e.target.value);
  };

  // Xử lý xuất báo cáo
  const handleExport = async () => {
    try {
      setLoading(true);
      
      const exportData = {
        report_type: reportType,
        file_format: fileFormat,
        filters: filters,
      };
      
      const response = await statisticsService.exportReport(exportData);
      
      if (response.success) {
        // Tạo link tải file
        const downloadUrl = response.data.download_url;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', response.data.filename || 'report');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess("Xuất báo cáo thành công!");
      } else {
        showError(response.message || "Có lỗi xảy ra khi xuất báo cáo");
      }
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo:", error);
      showError("Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Xuất báo cáo">
      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Loại báo cáo"
            name="report_type"
            value={reportType}
            onChange={handleReportTypeChange}
            options={reportTypeOptions}
            placeholder="Chọn loại báo cáo"
            required
          />
        </div>
        <div className="col-md-6">
          <Select
            label="Định dạng file"
            name="file_format"
            value={fileFormat}
            onChange={handleFileFormatChange}
            options={fileFormatOptions}
            placeholder="Chọn định dạng file"
            required
          />
        </div>
        <div className="col-12">
          <p className="text-muted">
            <small>
              Báo cáo sẽ được xuất với các bộ lọc đã chọn ở trên. Nếu không chọn bộ lọc, hệ thống sẽ xuất báo cáo cho toàn bộ dữ liệu.
            </small>
          </p>
        </div>
        <div className="col-12 text-end">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? "Đang xuất..." : "Xuất báo cáo"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ExportReport; 