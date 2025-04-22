import { Outlet } from "react-router-dom";
import Alert from "../common/Alert";
import RightBar from "./RightBar";
import Header from "./Header";
import SideBar from "./SideBar";

const Layout = () => {
  return (
    <>
      <div className="wrapper">
        <SideBar />
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
