import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import UserDetail from "./pages/users/UserDetail";
import RoleList from "./pages/roles/RoleList";
import RoleCreate from "./pages/roles/RoleCreate";
import RoleEdit from "./pages/roles/RoleEdit";
import RoleDetail from "./pages/roles/RoleDetail";
import EquipmentList from "./pages/equipments/EquipmentList";
import EquipmentCreate from "./pages/equipments/EquipmentCreate";
import EquipmentEdit from "./pages/equipments/EquipmentEdit";
import EquipmentDetail from "./pages/equipments/EquipmentDetail";
import { useAuth } from "./hooks/useAuth";
import ServiceList from "./pages/services/ServiceList";
import ServiceCreate from "./pages/services/ServiceCreate";
import ServiceDetail from "./pages/services/ServiceDetail";
import ServiceEdit from "./pages/services/ServiceEdit";
import PaymentMethodList from "./pages/payment-methods/PaymentMethodList";
import PaymentMethodCreate from "./pages/payment-methods/PaymentMethodCreate";
import PaymentMethodDetail from "./pages/payment-methods/PaymentMethodDetail";
import PaymentMethodEdit from "./pages/payment-methods/PaymentMethodEdit";
import NotFound from "./pages/errors/NotFound.jsx";
import SettingList from "./pages/settings/SettingList.jsx";
import SettingCreate from "./pages/settings/SettingCreate.jsx";
import SettingDetail from "./pages/settings/SettingDetail.jsx";
import SettingEdit from "./pages/settings/SettingEdit.jsx";
import HouseList from "./pages/houses/HouseList";
import HouseCreate from "./pages/houses/HouseCreate";
import HouseDetail from "./pages/houses/HouseDetail";
import HouseEdit from "./pages/houses/HouseEdit";
import RoomList from "./pages/rooms/RoomList";
import RoomCreate from "./pages/rooms/RoomCreate";
import RoomDetail from "./pages/rooms/RoomDetail";
import RoomEdit from "./pages/rooms/RoomEdit";
import RoomEquipmentCreate from "./pages/rooms/equipments/RoomEquipmentCreate";
import RoomEquipmentDetail from "./pages/rooms/equipments/RoomEquipmentDetail";
import RoomEquipmentEdit from "./pages/rooms/equipments/RoomEquipmentEdit";
import RoomServiceCreate from "./pages/rooms/services/RoomServiceCreate";
import RoomServiceDetail from "./pages/rooms/services/RoomServiceDetail";
import RoomServiceEdit from "./pages/rooms/services/RoomServiceEdit";
import MonthlyServiceManagement from "./pages/rooms/services/MonthlyServiceManagement.jsx";
import ContractList from "./pages/contracts/ContractList";
import ContractCreate from "./pages/contracts/ContractCreate";
import ContractDetail from "./pages/contracts/ContractDetail";
import ContractEdit from "./pages/contracts/ContractEdit";
import UserChangePassword from "./pages/users/UserChangePassword.jsx";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceCreate from "./pages/invoices/InvoiceCreate";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";
import InvoiceEdit from "./pages/invoices/InvoiceEdit";
import TenantInvoiceList from "./pages/invoices/TenantInvoiceList";
import TenantPaymentList from "./pages/invoices/TenantPaymentList";
import HouseSettingCreate from "./pages/houses/settings/HouseSettingCreate";
import HouseSettingDetail from "./pages/houses/settings/HouseSettingDetail";
import HouseSettingEdit from "./pages/houses/settings/HouseSettingEdit";
import StorageList from "./pages/storages/StorageList";
import StorageCreate from "./pages/storages/StorageCreate";
import StorageDetail from "./pages/storages/StorageDetail";
import StorageEdit from "./pages/storages/StorageEdit";
import RequestList from "./pages/requests/RequestList";
import RequestCreate from "./pages/requests/RequestCreate";
import RequestDetail from "./pages/requests/RequestDetail";
import RequestEdit from "./pages/requests/RequestEdit";
import NotificationList from "./pages/notifications/NotificationList";
import NotificationCreate from "./pages/notifications/NotificationCreate";
import NotificationDetail from "./pages/notifications/NotificationDetail";
import NotificationEdit from "./pages/notifications/NotificationEdit";

// Protected route wrapper component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Public route wrapper component
const PublicRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Component trung gian để chọn component hiển thị dựa trên role
const InvoiceListWrapper = () => {
  const { isTenant } = useAuth();
  return isTenant ? <TenantInvoiceList /> : <InvoiceList />;
};

// Component trung gian để hiển thị InvoiceList hoặc TenantPaymentList
const InvoicePaymentListWrapper = () => {
  const { isTenant } = useAuth();
  return isTenant ? <TenantPaymentList /> : <InvoiceList />;
};

// Component trung gian để hiển thị HouseDetail cho tenant (chỉ thông tin nhà và nội quy)
const HouseDetailWrapper = () => {
  const { isTenant } = useAuth();
  // Truyền prop tenantView={true} để HouseDetail component biết rằng người xem là tenant
  return <HouseDetail tenantView={isTenant} />;
};

// Component trung gian để hiển thị RoomDetail cho tenant (chỉ cho phép xem)
const RoomDetailWrapper = () => {
  const { isTenant } = useAuth();
  // Truyền prop tenantView={true} để RoomDetail component biết rằng người xem là tenant
  return <RoomDetail tenantView={isTenant} />;
};

// Router configuration
const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/login",
      element: <PublicRoute element={<Login />} />,
    },
    {
      path: "/",
      element: <ProtectedRoute element={<Layout />} />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        // User routes
        {
          path: "users",
          element: (
            <ProtectedRoute
              element={<UserList />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "users/create",
          element: (
            <ProtectedRoute
              element={<UserCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "users/:id",
          element: (
            <ProtectedRoute
              element={<UserDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "users/:id/edit",
          element: (
            <ProtectedRoute
              element={<UserEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "users/:id/change-password",
          element: (
            <ProtectedRoute
              element={<UserChangePassword />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        // Roles routes
        {
          path: "roles",
          element: (
            <ProtectedRoute element={<RoleList />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "roles/create",
          element: (
            <ProtectedRoute element={<RoleCreate />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "roles/:id",
          element: (
            <ProtectedRoute element={<RoleDetail />} allowedRoles={["admin"]} />
          ),
        },
        {
          path: "roles/:id/edit",
          element: (
            <ProtectedRoute element={<RoleEdit />} allowedRoles={["admin"]} />
          ),
        },
        // House routes
        {
          path: "houses",
          element: (
            <ProtectedRoute
              element={<HouseList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "houses/create",
          element: (
            <ProtectedRoute
              element={<HouseCreate />}
              allowedRoles={["admin"]}
            />
          ),
        },
        {
          path: "houses/:id",
          element: (
            <ProtectedRoute
              element={<HouseDetailWrapper />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "houses/:id/edit",
          element: (
            <ProtectedRoute
              element={<HouseEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // House Settings routes
        {
          path: "houses/:houseId/settings/create",
          element: (
            <ProtectedRoute
              element={<HouseSettingCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "houses/:houseId/settings/:settingId",
          element: (
            <ProtectedRoute
              element={<HouseSettingDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "houses/:houseId/settings/:settingId/edit",
          element: (
            <ProtectedRoute
              element={<HouseSettingEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Room routes
        {
          path: "rooms",
          element: (
            <ProtectedRoute
              element={<RoomList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "rooms/create",
          element: (
            <ProtectedRoute
              element={<RoomCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "houses/:houseId/rooms/create",
          element: (
            <ProtectedRoute
              element={<RoomCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "rooms/:id",
          element: (
            <ProtectedRoute
              element={<RoomDetailWrapper />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "rooms/:id/edit",
          element: (
            <ProtectedRoute
              element={<RoomEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Room Equipment routes
        {
          path: "rooms/:roomId/equipments/create",
          element: (
            <ProtectedRoute
              element={<RoomEquipmentCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "rooms/:roomId/equipments/:equipmentId",
          element: (
            <ProtectedRoute
              element={<RoomEquipmentDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "rooms/:roomId/equipments/:equipmentId/edit",
          element: (
            <ProtectedRoute
              element={<RoomEquipmentEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Room Service routes
        {
          path: "rooms/:roomId/services/create",
          element: (
            <ProtectedRoute
              element={<RoomServiceCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "room-services/:id",
          element: (
            <ProtectedRoute
              element={<RoomServiceDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "room-services/:id/edit",
          element: (
            <ProtectedRoute
              element={<RoomServiceEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Contract routes
        {
          path: "contracts",
          element: (
            <ProtectedRoute
              element={<ContractList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "contracts/create",
          element: (
            <ProtectedRoute
              element={<ContractCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "contracts/:id",
          element: (
            <ProtectedRoute
              element={<ContractDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "contracts/:id/edit",
          element: (
            <ProtectedRoute
              element={<ContractEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Equipments routes
        {
          path: "equipments",
          element: (
            <ProtectedRoute
              element={<EquipmentList />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "equipments/create",
          element: (
            <ProtectedRoute
              element={<EquipmentCreate />}
              allowedRoles={["admin"]}
            />
          ),
        },
        {
          path: "equipments/:id",
          element: (
            <ProtectedRoute
              element={<EquipmentDetail />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "equipments/:id/edit",
          element: (
            <ProtectedRoute
              element={<EquipmentEdit />}
              allowedRoles={["admin"]}
            />
          ),
        },
        // Service routes
        {
          path: "services",
          element: (
            <ProtectedRoute
              element={<ServiceList />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "services/create",
          element: (
            <ProtectedRoute
              element={<ServiceCreate />}
              allowedRoles={["admin"]}
            />
          ),
        },
        {
          path: "services/:id",
          element: (
            <ProtectedRoute
              element={<ServiceDetail />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "services/:id/edit",
          element: (
            <ProtectedRoute
              element={<ServiceEdit />}
              allowedRoles={["admin"]}
            />
          ),
        },
        {
          path: "payment-methods",
          element: (
            <ProtectedRoute
              element={<PaymentMethodList />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "payment-methods/create",
          element: (
            <ProtectedRoute
              element={<PaymentMethodCreate />}
              allowedRoles={["admin"]}
            />
          ),
        },
        {
          path: "payment-methods/:id",
          element: (
            <ProtectedRoute
              element={<PaymentMethodDetail />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "payment-methods/:id/edit",
          element: (
            <ProtectedRoute
              element={<PaymentMethodEdit />}
              allowedRoles={["admin"]}
            />
          ),
        },
        // Setting routes
        {
          path: "settings",
          element: (
            <ProtectedRoute
              element={<SettingList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "settings/create",
          element: (
            <ProtectedRoute
              element={<SettingCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "settings/:id",
          element: (
            <ProtectedRoute
              element={<SettingDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "settings/:id/edit",
          element: (
            <ProtectedRoute
              element={<SettingEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Invoice routes
        {
          path: "invoices",
          element: (
            <ProtectedRoute
              element={<InvoiceListWrapper />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "invoice-payment",
          element: (
            <ProtectedRoute
              element={<InvoicePaymentListWrapper />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "invoices/create",
          element: (
            <ProtectedRoute
              element={<InvoiceCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "rooms/:roomId/invoices/create",
          element: (
            <ProtectedRoute
              element={<InvoiceCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "invoices/:id",
          element: (
            <ProtectedRoute
              element={<InvoiceDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "invoices/:id/edit",
          element: (
            <ProtectedRoute
              element={<InvoiceEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Storage routes
        {
          path: "storages",
          element: (
            <ProtectedRoute
              element={<StorageList />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "storages/create",
          element: (
            <ProtectedRoute
              element={<StorageCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "houses/:houseId/storages/create",
          element: (
            <ProtectedRoute
              element={<StorageCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "storages/:id",
          element: (
            <ProtectedRoute
              element={<StorageDetail />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "storages/:id/edit",
          element: (
            <ProtectedRoute
              element={<StorageEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        // Request routes
        {
          path: "requests",
          element: (
            <ProtectedRoute
              element={<RequestList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "requests/create",
          element: (
            <ProtectedRoute
              element={<RequestCreate />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "requests/:id",
          element: (
            <ProtectedRoute
              element={<RequestDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "requests/:id/edit",
          element: (
            <ProtectedRoute
              element={<RequestEdit />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        // Notification routes
        {
          path: "notifications",
          element: (
            <ProtectedRoute
              element={<NotificationList />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "notifications/create",
          element: (
            <ProtectedRoute
              element={<NotificationCreate />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "notifications/:id",
          element: (
            <ProtectedRoute
              element={<NotificationDetail />}
              allowedRoles={["admin", "manager", "tenant"]}
            />
          ),
        },
        {
          path: "notifications/:id/edit",
          element: (
            <ProtectedRoute
              element={<NotificationEdit />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
        {
          path: "monthly-service-management",
          element: (
            <ProtectedRoute
              element={<MonthlyServiceManagement />}
              allowedRoles={["admin", "manager"]}
            />
          ),
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return router;
};

export default Routes;
