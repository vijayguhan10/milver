import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";

import dashboard from "../assets/dashboard.png";
import customer from "../assets/customer.png";
import delivery from "../assets/delivery.png";
import routes from "../assets/routes.png";
import fuel from "../assets/fuel.png"

function Header() {
 
  const [select, setSelect] = useState(() => {
    const path = window.location.pathname;
    if (path === "/Dashboard") return 0;
    if (path === "/Customers") return 1;
    if (path === "/Deliverymandetails") return 2;
    if (path === "/Routes") return 3;
    if (path === "/fuel") return 4;
    return 0;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;

    
    switch (select) {
      case 0:
        if (currentPath !== "/Dashboard") navigate("/Dashboard");
        break;
      case 1:
        if (currentPath !== "/Customers") navigate("/Customers");
        break;
      case 2:
        if (currentPath !== "/Deliverymandetails") navigate("/Deliverymandetails");
        break;
      case 3:
        if (currentPath !== "/Routes") navigate("/Routes");
        break;
      case 4:
        if (currentPath !== "/fuel") navigate("/fuel");
        break;
      default:
        break;
    }
  }, [select, navigate]);

  return (
    <section className="Header-container">
      <div className="Header-innerContainer">
        <div
    
          className="Header-dashboard"
          style={{
            backgroundColor: select === 0 ? "black" : "initial",
            backgroundImage: `url(${dashboard})`,
          }}
          onClick={() => setSelect(0)}
        ></div>
        <div
          className="Header-customer"
          style={{
            backgroundColor: select === 1 ? "black" : "initial",
            backgroundImage: `url(${customer})`,
          }}
          onClick={() => setSelect(1)}
        ></div>
        <div
          className="Header-delivery"
          style={{
            backgroundColor: select === 2 ? "black" : "initial",
            backgroundImage: `url(${delivery})`,
          }}
          onClick={() => setSelect(2)}
        ></div>
        <div
          className="Header-routes"
          style={{
            backgroundColor: select === 3 ? "black" : "initial",
            backgroundImage: `url(${routes})`,
          }}
          onClick={() => setSelect(3)}
        ></div>
        <div
          className="Header-fuel"
          style={{
            backgroundColor: select === 4 ? "black" : "initial",
            backgroundImage: `url(${fuel})`,
          }}
          onClick={() => setSelect(4)}
        ></div>
      </div>
    </section>
  );
}

export default Header;
