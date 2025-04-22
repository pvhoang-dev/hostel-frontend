import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { roleService } from "../../api/roles";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAlert from "../../hooks/useAlert";
import useApi from "../../hooks/useApi";

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useAlert();

  const {
    data: role,
    loading,
    execute: fetchRole,
  } = useApi(roleService.getRole);

  useEffect(() => {
    loadRole();
  }, [id]);

  const loadRole = async () => {
    const response = await fetchRole(id);

    if (!response.success) {
      showError("Lỗi khi tải vai trò");
      navigate("/roles");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-2">
        <h1 className="fs-2 fw-semibold">Thông tin vai trò</h1>
        <div className="d-flex gap-2 mr-2">
          <button
            onClick={() => navigate("/roles")}
            className="btn btn-light fw-semibold mr-2"
          >
            Back
          </button>
          <Link
            to={`/roles/${id}/edit`}
            className="btn btn-primary fw-semibold"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="fs-4 fw-semibold mb-3">{role.name}</h2>
          <div className="d-inline-block bg-primary bg-opacity-10 text-primary px-2 py-1 rounded small">
            {role.code}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="fs-5 fw-medium mb-2">Thông tin hệ thống</h3>
          <div className="d-flex flex-column gap-2">
            <div>
              <span className="text-secondary">ID:</span>
              <span className="ms-2">{role.id}</span>
            </div>
            <div>
              <span className="text-secondary">Tạo:</span>
              <span className="ms-2">{role.created_at}</span>
            </div>
            <div>
              <span className="text-secondary">Cập nhật lần cuối:</span>
              <span className="ms-2">{role.updated_at}</span>
            </div>
          </div>
        </div>

        {/*<div className="mt-4">*/}
        {/*  <h3 className="fs-5 fw-medium mb-2">Users with this Role</h3>*/}
        {/*  <div className="text-secondary">*/}
        {/*    {role.users_count || 0} users have this role assigned*/}
        {/*  </div>*/}
        {/*</div>*/}
      </Card>
    </div>
  );
};

export default RoleDetail;
