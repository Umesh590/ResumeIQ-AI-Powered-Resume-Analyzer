import React from "react";
import { Outlet } from "react-router";

import Navbar from "./Navbar";
import Footer from "./Footer";

import "../style/layout.scss";

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
