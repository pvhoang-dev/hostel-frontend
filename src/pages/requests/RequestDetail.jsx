import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { requestService } from "../../api/requests";
import useAlert from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../api/users";
import Loader from "../../components/common/Loader";
import Select from "../../components/common/Select";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showWarning, showError, showSuccess } = useAlert();
  const { user, isTenant, isAdmin, isManager } = useAuth();
  const commentFormRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);

  // State for edit modals
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [showEditComment, setShowEditComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editRequestData, setEditRequestData] = useState({
    description: "",
    status: "",
  });
  const [editCommentData, setEditCommentData] = useState({
    content: "",
  });

  // For transfer request
  const [potentialRecipients, setPotentialRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  
  // For change sender
  const [potentialSenders, setPotentialSenders] = useState([]);
  const [loadingSenders, setLoadingSenders] = useState(false);

  // Status tracking
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchRequestAndComments();
  }, [id]);

  useEffect(() => {
    if (
      request &&
      (request.status === "completed" || request.status === "rejected")
    ) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [request]);

  // Tự động load danh sách người nhận và người gửi tiềm năng khi request được tải
  useEffect(() => {
    if (request && !isTenant && (canTransfer || canChangeSender)) {
      if (canTransfer) {
        fetchPotentialRecipients();
      }
      if (canChangeSender) {
        fetchPotentialSenders();
      }
    }
  }, [request, isTenant]);

  const fetchRequestAndComments = async () => {
    setLoading(true);
    setLoadingComments(true);

    try {
      // Tải thông tin yêu cầu
      const requestResponse = await requestService.getRequest(id);
      console.log("Request response:", requestResponse);

      // Tải dữ liệu từ response
      if (requestResponse && requestResponse.data) {
        setRequest(requestResponse.data);
        setEditRequestData({
          description: requestResponse.data.description,
          status: requestResponse.data.status,
        });

        // Lấy comments từ response của request
        if (requestResponse.data.comments) {
          console.log("Comments from request:", requestResponse.data.comments);
          setComments(
            Array.isArray(requestResponse.data.comments)
              ? requestResponse.data.comments
              : []
          );
        } else {
          setComments([]);
        }
      } else {
        showError("Không tìm thấy dữ liệu yêu cầu");
        navigate("/requests");
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi tải thông tin yêu cầu");
      console.error("Error fetching request:", error);
      navigate("/requests");
    } finally {
      setLoading(false);
      setLoadingComments(false);
    }
  };

  const fetchPotentialRecipients = async () => {
    setLoadingRecipients(true);
    try {
      // Admin và người gửi là manager có thể chọn tenant mà manager đó quản lý 
      if (isAdmin || (isManager && request.sender?.id === user.id)) {
        let recipients = [];
        
        // Nếu người gửi là manager, lấy danh sách tenant mà manager đó quản lý
        if (isManager && request.sender?.id === user.id) {
          const response = await userService.getTenantsForManager(user.id);
          
          if (response.success) {
            recipients = (response.data.tenants || [])
              .filter(tenant => tenant.id !== user.id && tenant.id !== request.recipient?.id)
              .map(tenant => ({
                id: tenant.id,
                name: tenant.name,
                role: tenant.role,
                room: tenant.room || { name: "Không xác định" }
              }));
          }
        } 
        // Nếu là admin, có thể chọn bất kỳ ai
        else if (isAdmin) {
          // Nếu người gửi là manager, chỉ lấy tenant mà manager đó quản lý
          if (request.sender?.role?.code === 'manager') {
            const response = await userService.getTenantsForManager(request.sender.id);
            
            if (response.success) {
              recipients = (response.data.tenants || [])
                .filter(tenant => tenant.id !== user.id && tenant.id !== request.recipient?.id)
                .map(tenant => ({
                  id: tenant.id,
                  name: tenant.name,
                  role: tenant.role,
                  room: tenant.room || { name: "Không xác định" }
                }));
            }
          } 
          // Nếu người gửi không phải manager, lấy tất cả người dùng
          else {
            // Lấy danh sách tất cả người dùng
            const response = await userService.getUsers({
              role: "admin,manager,tenant",
              per_page: 100,
            });

            // Lọc bỏ người dùng hiện tại và người nhận hiện tại
            recipients = (response.data.data || [])
              .filter(u => u.id !== user.id && u.id !== request.recipient?.id)
              .map(u => ({
                id: u.id,
                name: u.name,
                role: u.role,
              }));
          }
        }

        setPotentialRecipients(recipients);
      }
      // Manager là người nhận chỉ có thể chuyển cho admin
      else if (isManager && request.recipient?.id === user.id) {
        // Lấy danh sách admin
        const response = await userService.getUsers({
          role: "admin",
          per_page: 100,
        });

        // Lọc bỏ người dùng hiện tại và người nhận hiện tại
        const recipients = (response.data.data || [])
          .filter(u => u.id !== user.id && u.id !== request.recipient?.id)
          .map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
          }));

        setPotentialRecipients(recipients);
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi tải danh sách người nhận");
      console.error("Error fetching potential recipients:", error);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const fetchPotentialSenders = async () => {
    setLoadingSenders(true);
    try {
      // Chỉ lấy manager đang quản lý nhà của tenant (recipient)
      if (!request.recipient || request.recipient.role?.code !== 'tenant') {
        setLoadingSenders(false);
        return;
      }

      // Admin lấy tất cả managers của tenant
      if (isAdmin) {
        // Gọi API để lấy danh sách managers của tenant từ backend
        const response = await userService.getManagersForTenant(request.recipient.id);
        
        if (!response.success) {
          showError(response.message || "Không thể lấy danh sách quản lý");
          setLoadingSenders(false);
          return;
        }
        
        // Lọc bỏ người dùng hiện tại và người gửi hiện tại
        const senders = (response.data.managers || [])
          .map(manager => ({
            id: manager.id,
            name: manager.name,
            role: manager.role,
            house: manager.house || { name: "Không xác định" }
          }));

        setPotentialSenders(senders);
      } 
      // Manager chỉ có thể đổi thành admin hoặc manager của tenant
      else if (isManager) {
        // Gọi API để lấy danh sách managers của tenant từ backend
        const response = await userService.getManagersForTenant(request.recipient.id);
        
        if (!response.success) {
          showError(response.message || "Không thể lấy danh sách quản lý");
          setLoadingSenders(false);
          return;
        }
        
        // Lọc bỏ người dùng hiện tại và người gửi hiện tại
        const senders = (response.data.managers || [])
          .filter(manager => manager.id !== user.id && manager.id !== request.sender?.id)
          .map(manager => ({
            id: manager.id,
            name: manager.name,
            role: manager.role,
            house: manager.house || { name: "Không xác định" }
          }));

        setPotentialSenders(senders);
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi tải danh sách quản lý");
      console.error("Error fetching potential senders:", error);
    } finally {
      setLoadingSenders(false);
    }
  };

  const handleTransferRequest = async (newRecipientId) => {
    if (!newRecipientId) {
      showWarning("Vui lòng chọn người nhận");
      return;
    }

    try {
      // Sử dụng updateRequest thay vì transferRequest
      await requestService.updateRequest(id, {
        ...request,
        recipient_id: newRecipientId,
      });

      // Cập nhật người nhận trong UI
      const newRecipient = potentialRecipients.find(
        (r) => r.id === newRecipientId
      );

      // Thêm bình luận tự động về việc chuyển yêu cầu
      const recipientName = newRecipient
        ? newRecipient.name
        : "người dùng khác";
      await requestService.createRequestComment({
        request_id: id,
        content: `Đã chuyển yêu cầu cho ${recipientName}`,
      });

      // Tải lại dữ liệu request và comments
      fetchRequestAndComments();
      window.location.reload();

      showSuccess("Yêu cầu đã được chuyển thành công!");
    } catch (error) {
      showError("Đã xảy ra lỗi khi chuyển yêu cầu");
      console.error("Error transferring request:", error);
    }
  };

  const handleChangeSender = async (newSenderId) => {
    if (!newSenderId) {
      showWarning("Vui lòng chọn người gửi mới");
      return;
    }

    try {
      // Sử dụng updateRequest để cập nhật người gửi
      await requestService.updateRequest(id, {
        ...request,
        sender_id: newSenderId,
      });

      // Cập nhật người gửi trong UI
      const newSender = potentialSenders.find(
        (s) => s.id === newSenderId
      );

      // Thêm bình luận tự động về việc thay đổi người gửi
      const senderName = newSender ? newSender.name : "quản lý khác";
      await requestService.createRequestComment({
        request_id: id,
        content: `Đã thay đổi người gửi yêu cầu thành ${senderName}`,
      });

      // Tải lại dữ liệu request và comments
      fetchRequestAndComments();

      showSuccess("Người gửi yêu cầu đã được thay đổi thành công!");
    } catch (error) {
      showError("Đã xảy ra lỗi khi thay đổi người gửi");
      console.error("Error changing sender:", error);
    }
  };

  const handleCommentSubmit = async (e, autoContent = null) => {
    if (e) e.preventDefault();

    const content = autoContent || commentText;
    if (!content.trim()) return;

    setIsSubmittingComment(true);

    try {
      const response = await requestService.createRequestComment({
        request_id: id,
        content: content,
      });

      // Cập nhật lại toàn bộ request để lấy comments mới nhất
      fetchRequestAndComments();

      if (!autoContent) {
        showSuccess("Bình luận đã được thêm thành công!");
        setCommentText("");
      }
    } catch (error) {
      showError("Đã xảy ra lỗi khi thêm bình luận");
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        await requestService.deleteRequestComment(commentId);

        // Tải lại dữ liệu request và comments
        fetchRequestAndComments();

        showSuccess("Bình luận đã được xóa thành công!");
      } catch (error) {
        showError("Đã xảy ra lỗi khi xóa bình luận");
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentData({
      content: comment.content,
    });
    setShowEditComment(true);
  };

  const handleTransferClick = () => {
    fetchPotentialRecipients();
  };

  const handleChangeSenderClick = () => {
    fetchPotentialSenders();
  };

  const saveEditedComment = async () => {
    try {
      await requestService.updateRequestComment(
        editingComment.id,
        editCommentData
      );

      // Tải lại dữ liệu request và comments
      fetchRequestAndComments();

      showSuccess("Bình luận đã được cập nhật thành công!");
      setShowEditComment(false);
    } catch (error) {
      showError("Đã xảy ra lỗi khi cập nhật bình luận");
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) {
      try {
        await requestService.deleteRequest(id);
        showSuccess("Yêu cầu đã được xóa thành công!");
        navigate("/requests");
      } catch (error) {
        showError("Đã xảy ra lỗi khi xóa yêu cầu");
        console.error("Error deleting request:", error);
      }
    }
  };

  const saveEditedRequest = async () => {
    try {
      await requestService.updateRequest(id, {
        ...request,
        description: editRequestData.description,
        status: editRequestData.status,
      });

      // Tải lại dữ liệu request và comments
      fetchRequestAndComments();

      showSuccess("Yêu cầu đã được cập nhật thành công!");
      setShowEditRequest(false);
    } catch (error) {
      showError("Đã xảy ra lỗi khi cập nhật yêu cầu");
      console.error("Error updating request:", error);
    }
  };

  const handleStatusChange = async (e) => {
    const isChecked = e.target.checked;
    const newStatus = isChecked ? "completed" : "pending";

    try {
      await requestService.updateRequest(id, {
        ...request,
        status: newStatus,
      });

      // Tải lại dữ liệu request và comments
      fetchRequestAndComments();

      if (isChecked) {
        // Tự động thêm comment
        await handleCommentSubmit(
          null,
          `Yêu cầu đã được đánh dấu là hoàn thành bởi ${user.name}`
        );
      }

      showSuccess(
        `Yêu cầu đã được đánh dấu là ${
          isChecked ? "hoàn thành" : "chưa hoàn thành"
        }!`
      );
    } catch (error) {
      showError("Đã xảy ra lỗi khi cập nhật trạng thái");
      console.error("Error updating status:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "text-warning";
      case "in_progress":
        return "text-info";
      case "completed":
        return "text-success";
      case "rejected":
        return "text-danger";
      default:
        return "text-secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "in_progress":
        return "Đang xử lý";
      case "completed":
        return "Đã hoàn thành";
      case "rejected":
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case "maintenance":
        return "Bảo trì";
      case "complaint":
        return "Khiếu nại";
      case "inquiry":
        return "Yêu cầu thông tin";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  // Kiểm tra quyền
  const canEdit =
    request &&
    (isAdmin ||
      (isManager &&
        (request.sender?.id === user.id ||
          request.recipient?.id === user.id)) ||
      (isTenant &&
        request.sender?.id === user.id &&
        request.status === "pending"));

  const canDelete =
    request &&
    (isAdmin ||
      (isManager && request.sender?.id === user.id) ||
      (isTenant &&
        request.sender?.id === user.id &&
        request.status === "pending"));

  // Quyền chuyển yêu cầu
  const canTransfer =
    request && 
    // Admin luôn có thể thay đổi người nhận
    (isAdmin || 
     // Manager có thể thay đổi người nhận khi họ là người gửi
     (isManager && request.sender?.id === user.id) ||
     // Manager có thể thay đổi người nhận khi họ là người nhận và người gửi là tenant
     (isManager && 
      request.recipient?.id === user.id && 
      request.sender?.role?.code === 'tenant'));

  // Kiểm tra quyền thay đổi người gửi - chỉ Admin và khi người nhận là tenant
  const canChangeSender =
    request && 
    // Admin luôn có thể thay đổi người gửi
    (isAdmin || 
     // Manager có thể thay đổi người gửi khi họ là người nhận và người gửi là tenant
     (isManager && 
      request.recipient?.id === user.id && 
      request.sender?.role?.code === 'tenant'));

  const canDeleteComment = (comment) => {
    // Admin có thể xóa bất kỳ comment nào, nhưng không thể xóa comment của tenant
    // trừ khi admin là người nhận yêu cầu này
    if (isAdmin) {
      const commentUser = comment.user || {};
      if (commentUser.role === "tenant" && request.recipient?.id !== user.id) {
        return false;
      }
      return true;
    }

    return comment.user?.id === user.id;
  };

  const canEditComment = (comment) => {
    return comment.user?.id === user.id;
  };

  // Thêm biến kiểm tra nếu cả sender và recipient đều là staff
  const canChangeStatus = () => {
    if (!request) return false;

    // Admin luôn có thể thay đổi trạng thái
    if (isAdmin) return true;

    // Nếu là manager
    if (isManager) {
      // Kiểm tra xem có phải là người nhận không
      const isRecipient = request.recipient?.id === user.id;

      // Nếu sender hoặc recipient là tenant, manager có thể thay đổi trạng thái
      const senderRole = request.sender?.role?.code;
      const recipientRole = request.recipient?.role?.code;

      const isSenderTenant = senderRole === "tenant";
      const isRecipientTenant = recipientRole === "tenant";

      // Manager chỉ có thể thay đổi trạng thái nếu là người nhận và
      // ít nhất một trong hai bên (sender hoặc recipient) là tenant
      return isSenderTenant || isRecipientTenant;
    }

    return false;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container-fluid">
      {/* Start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="javascript: void(0);">H-Hostel</a>
                </li>
                <li className="breadcrumb-item">
                  <a
                    href="javascript: void(0);"
                    onClick={() => navigate("/requests")}
                  >
                    Yêu cầu
                  </a>
                </li>
                <li className="breadcrumb-item active">Chi tiết yêu cầu</li>
              </ol>
            </div>
            <h4 className="page-title">Chi tiết yêu cầu #{request.id}</h4>
          </div>
        </div>
      </div>
      {/* End page title */}

      <div className="row">
        <div className="col-12">
          {/* Project card */}
          <div className="card d-block">
            <div className="card-body">
              <div className="dropdown card-widgets float-right">
                <a
                  href="#"
                  className="dropdown-toggle arrow-none"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="mdi mdi-dots-vertical"></i>
                </a>
                <div className="dropdown-menu dropdown-menu-right">
                  {canTransfer && (
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item"
                      onClick={handleTransferClick}
                    >
                      <i className="mdi mdi-account-switch mr-1"></i>Thay đổi người nhận
                    </a>
                  )}
                  {canChangeSender && (
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item"
                      onClick={handleChangeSenderClick}
                    >
                      <i className="mdi mdi-account-convert mr-1"></i>Thay đổi người gửi
                    </a>
                  )}
                  {canDelete && (
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item text-danger"
                      onClick={handleDelete}
                    >
                      <i className="mdi mdi-delete mr-1"></i>Xóa
                    </a>
                  )}
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item"
                    onClick={() => navigate("/requests")}
                  >
                    <i className="mdi mdi-arrow-left mr-1"></i>Quay lại
                  </a>
                </div>
              </div>

              {canChangeStatus() && (
                <div className="custom-control custom-checkbox float-left">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="completedCheck"
                    checked={isCompleted}
                    onChange={handleStatusChange}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="completedCheck"
                  >
                    Đánh dấu là hoàn thành
                  </label>
                </div>
              )}

              <div className="clearfix"></div>

              <h3 className="mt-3">
                {getRequestTypeText(request.request_type)}
              </h3>

              <div className="row">
                <div className="col-md-6">
                  {/* Sender/Creator */}
                  <p className="mt-2 mb-1 text-muted font-weight-bold font-12 text-uppercase">
                    Người gửi
                  </p>
                  <div className="media">
                    <div className="media-body">
                      {canChangeSender ? (
                        loadingSenders ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm text-primary mr-2" role="status">
                              <span className="sr-only">Đang tải...</span>
                            </div>
                            <span>Đang tải danh sách quản lý...</span>
                          </div>
                        ) : (
                          <Select
                            value={request.sender?.id}
                            onChange={(e) => handleChangeSender(e.target.value)}
                            options={[
                              {
                                value: request.sender?.id,
                                label: request.sender?.name + " - " + request.sender?.role?.name || "N/A",
                              },
                              ...potentialSenders
                                .filter(sender => sender.id !== request.sender?.id)
                                .map(sender => ({
                                  value: sender.id,
                                  label: `${sender.name} - ${sender.house?.name || "Admin"}`,
                                })),
                            ]}
                          />
                        )
                      ) : (
                        <h5 className="mt-1 font-14">
                          <a
                            href={`/users/${request.sender?.id}`}
                            target="_blank"
                          >
                            {request.sender?.name || "N/A"}
                          </a>
                        </h5>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  {/* Recipient/Assignee */}
                  <p className="mt-2 mb-1 text-muted font-weight-bold font-12 text-uppercase">
                    Người nhận
                  </p>
                  <div className="media">
                    <div className="media-body">
                      {canTransfer ? (
                        loadingRecipients ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm text-primary mr-2" role="status">
                              <span className="sr-only">Đang tải...</span>
                            </div>
                            <span>Đang tải danh sách người nhận...</span>
                          </div>
                        ) : (
                          <Select
                            value={request.recipient?.id}
                            onChange={(e) => handleTransferRequest(e.target.value)}
                            options={[
                              {
                                value: request.recipient?.id,
                                label: request.recipient?.name + " - " + request.recipient?.role?.name || "N/A",
                              },
                              ...potentialRecipients
                                .filter(recipient => recipient.id !== request.recipient?.id)
                                .map(recipient => ({
                                  value: recipient.id,
                                  label: `${recipient.name} - ${recipient.role?.name || ""}`,
                                })),
                            ]}
                          />
                        )
                      ) : (
                        <h5 className="mt-1 font-14">
                          <a
                            href={`/users/${request.recipient?.id}`}
                            target="_blank"
                          >
                            {request.recipient?.name || "N/A"}
                          </a>
                        </h5>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  {/* Status */}
                  <p className="mt-2 mb-1 text-muted font-weight-bold font-12 text-uppercase">
                    Trạng thái
                  </p>
                  <div className="media">
                    <i
                      className={`mdi mdi-circle font-18 ${getStatusClass(
                        request.status
                      )} mr-1`}
                    ></i>
                    <div className="media-body">
                      <h5 className="mt-1 font-14">
                        {getStatusText(request.status)}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  {/* Date */}
                  <p className="mt-2 mb-1 text-muted font-weight-bold font-12 text-uppercase">
                    Ngày tạo
                  </p>
                  <div className="media">
                    <i className="mdi mdi-calendar font-18 text-success mr-1"></i>
                    <div className="media-body">
                      <h5 className="mt-1 font-14">
                        {formatDate(request.created_at)}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
              {request.room && (
                <div className="row">
                  <div className="col-md-6">
                    <p className="mt-2 mb-1 text-muted font-weight-bold font-12 text-uppercase">
                      Phòng
                    </p>
                    <div className="media">
                      <i className="mdi mdi-home font-18 text-primary mr-1"></i>
                      <div className="media-body">
                        <h5 className="mt-1 font-14">
                          <a
                            href={`/rooms/${request.room?.id}`}
                            target="_blank"
                          >
                            {request.room?.room_number || "N/A"}
                          </a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <h5 className="mb-2">
                  <i className="mdi mdi-text-box-outline mr-1 text-primary"></i>
                  Mô tả:
                </h5>
                <div className="p-3 border rounded bg-light">
                  <p className="mb-0 font-weight-medium">
                    {request.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h4 className="my-1">Bình luận ({comments.length})</h4>
            </div>
            <div className="card-body">
              {loadingComments ? (
                <Loader />
              ) : (
                <>
                  {comments.length === 0 ? (
                    <p className="text-center py-3">Chưa có bình luận nào.</p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        className="comment-item p-3 border-bottom"
                        key={comment.id}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center mr-2">
                              <i className="mdi mdi-account text-primary font-18"></i>
                            </div>
                            <p className="mb-0 font-weight-bold">
                              {comment.user?.name || "Người dùng không rõ"}
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <small className="text-muted mr-2">
                              {formatTimeAgo(comment.created_at)}
                            </small>
                            <div className="comment-actions">
                              {canEditComment(comment) && (
                                <a
                                  href="javascript:void(0);"
                                  onClick={() => handleEditComment(comment)}
                                  className="btn btn-sm btn-link text-info p-0 mr-1"
                                >
                                  <i className="mdi mdi-pencil"></i>
                                </a>
                              )}
                              {canDeleteComment(comment) && (
                                <a
                                  href="javascript:void(0);"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="btn btn-sm btn-link text-danger p-0"
                                >
                                  <i className="mdi mdi-delete"></i>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="comment-content pl-4 ml-2">
                          <p className="mb-0">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}

                  {comments.length > 5 && (
                    <div className="text-center mt-2 mb-4">
                      <a href="javascript:void(0);" className="text-danger">
                        <i className="mdi mdi-spin mdi-loading mr-1"></i> Tải
                        thêm
                      </a>
                    </div>
                  )}

                  <div className="border rounded mt-4">
                    <form
                      onSubmit={handleCommentSubmit}
                      className="comment-area-box"
                    >
                      <textarea
                        rows="3"
                        className="form-control border-0"
                        placeholder="Nhập bình luận của bạn..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{ resize: "none" }}
                        ref={commentFormRef}
                      ></textarea>
                      <div className="p-2 bg-light d-flex justify-content-end align-items-center">
                        <button
                          type="submit"
                          className="btn btn-sm btn-success"
                          disabled={isSubmittingComment || !commentText.trim()}
                        >
                          {isSubmittingComment ? (
                            <>
                              <i className="mdi mdi-spin mdi-loading mr-1"></i>
                              Đang gửi
                            </>
                          ) : (
                            <>
                              <i className="mdi mdi-send mr-1"></i>Gửi
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Request Modal */}
      <div
        className={`modal fade ${showEditRequest ? "show" : ""}`}
        id="edit-request-modal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
        style={{
          display: showEditRequest ? "block" : "none",
          paddingRight: "15px",
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chỉnh sửa yêu cầu</h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowEditRequest(false)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="edit-request-description">Mô tả</label>
                  <textarea
                    className="form-control"
                    id="edit-request-description"
                    rows="5"
                    value={editRequestData.description}
                    onChange={(e) =>
                      setEditRequestData({
                        ...editRequestData,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                {(isAdmin || request.recipient?.id === user.id) && (
                  <div className="form-group">
                    <label htmlFor="edit-request-status">Trạng thái</label>
                    <select
                      className="form-control"
                      id="edit-request-status"
                      value={editRequestData.status}
                      onChange={(e) =>
                        setEditRequestData({
                          ...editRequestData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="pending">Đang chờ</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditRequest(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveEditedRequest}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
      {showEditRequest && <div className="modal-backdrop fade show"></div>}

      {/* Edit Comment Modal */}
      <div
        className={`modal fade ${showEditComment ? "show" : ""}`}
        id="edit-comment-modal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
        style={{
          display: showEditComment ? "block" : "none",
          paddingRight: "15px",
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chỉnh sửa bình luận</h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowEditComment(false)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="edit-comment-content">Nội dung</label>
                  <textarea
                    className="form-control"
                    id="edit-comment-content"
                    rows="4"
                    value={editCommentData.content}
                    onChange={(e) =>
                      setEditCommentData({
                        ...editCommentData,
                        content: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditComment(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveEditedComment}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
      {showEditComment && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default RequestDetail;
