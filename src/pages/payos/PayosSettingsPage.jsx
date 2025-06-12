import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import configService from '../../api/configs';
import useApi from '../../hooks/useApi';
import useAlert from '../../hooks/useAlert';

const PayosSettingsPage = () => {
  const {showSuccess, showError} = useAlert();

  // API hooks
  const { 
    data: payosConfigsData, 
    loading: loadingConfigs, 
    execute: fetchPayosConfigs,
    error: configsError
  } = useApi(configService.getPayosConfigs);

  const {
    loading: updatingConfig,
    execute: executeUpdateConfig,
    error: updateError
  } = useApi(configService.updateConfig);

  // State
  const [formData, setFormData] = useState({
    client_id: '',
    api_key: '',
    checksum_key: ''
  });

  // Fetch data
  useEffect(() => {
    fetchPayosConfigs();
  }, []);

  // Populate form when data is loaded
  useEffect(() => {
    if (payosConfigsData && payosConfigsData.length > 0) {
      const newFormData = { ...formData };
      
      payosConfigsData.forEach(config => {
        const key = config.key.replace('payos_', '');
        if (Object.keys(formData).includes(key)) {
          newFormData[key] = config.value || '';
        }
      });
      
      setFormData(newFormData);
    }
  }, [payosConfigsData]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update each config value
      const updates = [];
      
      for (const [key, value] of Object.entries(formData)) {
        const config = payosConfigsData.find(c => c.key === `payos_${key}`);
        
        if (config) {
          // Update existing config
          updates.push(
            executeUpdateConfig(config.id, {
              value: value,
              description: config.description || `Cấu hình PayOS ${key}`
            })
          );
        } else {
          // Create new config if not exists
          updates.push(
            configService.createConfig({
              key: `payos_${key}`,
              value: value,
              description: `Cấu hình PayOS ${key}`,
              group: 'payos',
              status: 'active'
            })
          );
        }
      }
      
      await Promise.all(updates);
      
      showSuccess('Cập nhật cấu hình PayOS thành công');
      fetchPayosConfigs();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      showError('Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  if (loadingConfigs) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (configsError) {
    return (
      <div className="alert alert-danger my-4">
        Lỗi: {configsError.message || 'Không thể tải dữ liệu cấu hình'}
      </div>
    );
  }

  return (
    <>      
      <div className="d-flex justify-content-between align-items-center my-2">
        <h3 className="fs-2 fw-semibold">Cấu hình thanh toán PayOS</h3>
        <Link to="/settings" className="btn btn-light fw-semibold">
          Quay lại
        </Link>
      </div>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">Thông số kết nối PayOS</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-4">
            Vui lòng nhập đầy đủ thông tin kết nối đến cổng thanh toán PayOS. Các thông tin này được cung cấp bởi PayOS khi bạn đăng ký tài khoản.
          </p>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client ID <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Định danh client của bạn trên hệ thống PayOS
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>API Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    name="api_key"
                    value={formData.api_key}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Khóa API để xác thực với PayOS
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Checksum Key <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    name="checksum_key"
                    value={formData.checksum_key}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Khóa kiểm tra chữ ký (Checksum Key) của PayOS để xác thực các giao dịch
                  </small>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="mb-3">
              <h6 className="mb-3">Cài đặt Webhook (Bảo mật thanh toán)</h6>
              <p className="text-muted">
                Để tăng cường bảo mật giao dịch, vui lòng thiết lập webhook URL trong tài khoản PayOS của bạn:
              </p>
              <div className="alert alert-info">
                <strong>URL Webhook:</strong> <code>https://your-url/api/payment/webhook</code>
                <p className="mt-2 mb-0 small">Thiết lập webhook giúp xác thực trạng thái thanh toán trực tiếp từ PayOS, ngăn chặn việc giả mạo thanh toán thành công.</p>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" disabled={updatingConfig}>
                {updatingConfig ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-1" />
                    Đang lưu...
                  </>
                ) : 'Lưu cấu hình'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default PayosSettingsPage; 