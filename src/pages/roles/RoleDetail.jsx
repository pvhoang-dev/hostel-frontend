// src/pages/roles/RoleDetail.jsx
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Thông tin vai trò</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate("/roles")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back
          </button>
          <Link
            to={`/roles/${id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Sửa
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{role.name}</h2>
          <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {role.code}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Thông tin hệ thống</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">ID:</span>
              <span className="ml-2">{role.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Tạo:</span>
              <span className="ml-2">{role.created_at}</span>
            </div>
            <div>
              <span className="text-gray-600">Cập nhật lần cuối:</span>
              <span className="ml-2">{role.updated_at}</span>
            </div>
          </div>
        </div>

        {/*<div className="mt-6">*/}
        {/*  <h3 className="text-lg font-medium mb-2">Users with this Role</h3>*/}
        {/*  <div className="text-gray-600">*/}
        {/*    {role.users_count || 0} users have this role assigned*/}
        {/*  </div>*/}
        {/*</div>*/}
      </Card>
    </div>
  );
};

export default RoleDetail;
