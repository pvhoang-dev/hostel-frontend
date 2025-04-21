import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Alert from "../common/Alert";
import RightBar from "./RightBar";
import Header from "./Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="wrapper">
        <Sidebar />
        <div className="content-page">
          <div className="content">
            <Header />
            <div className="container-fluid">
              <Alert />
              <main>
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
      <RightBar />
    </>
  );
};

export default Layout;
