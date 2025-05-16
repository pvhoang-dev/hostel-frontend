import { useState } from "react";
import Button from "../common/Button";
import TextArea from "../common/TextArea";
import { useAuth } from "../../hooks/useAuth";

const RequestCommentForm = ({
  requestId,
  onSubmit,
  isSubmitting = false,
  errors = {},
  initialData = {},
  mode = "create",
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    request_id: requestId || initialData.request_id,
    content: initialData.content || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

    // Nếu là tạo mới, xóa nội dung sau khi gửi
    if (mode === "create") {
      setFormData({ ...formData, content: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row">
        <div className="col-12">
          <TextArea
            label={mode === "create" ? "Thêm bình luận" : "Sửa bình luận"}
            name="content"
            value={formData.content}
            onChange={handleChange}
            error={errors.content}
            rows={3}
            placeholder="Nhập nội dung bình luận của bạn..."
            required
          />
        </div>
      </div>

      <div className="mt-2 d-flex justify-content-end">
        {mode === "edit" && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onCancel && onCancel()}
            className=" mr-2"
          >
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? `${mode === "create" ? "Đang gửi" : "Đang cập nhật"}...`
            : mode === "create"
            ? "Gửi bình luận"
            : "Cập nhật"}
        </Button>
      </div>
    </form>
  );
};

export default RequestCommentForm;
