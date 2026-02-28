import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserRole,
  isLoggedIn,
  logout
} from "../utils/auth";
import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const role = getUserRole();

  const loggedIn = isLoggedIn();

  const [scrolled,setScrolled] =
    useState(false);


  useEffect(()=>{

    const handleScroll=()=>{

      setScrolled(
        window.scrollY > 40
      );

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return ()=>window.removeEventListener(
      "scroll",
      handleScroll
    );

  },[]);


  const handleLogout=()=>{

    logout();

    navigate("/");

    window.location.reload();

  };


  return(

    <header
      className={
        `navbar ${
          scrolled
          ?
          "scrolled"
          :
          ""
        }`
      }
    >


      {/* LEFT */}

      <div className="nav-left">

        <button
          className="nav-link"
          onClick={()=>
            navigate("/")
          }
        >
          HOME
        </button>


        <button
          className="nav-link"
          onClick={()=>
            navigate("/shop")
          }
        >
          SHOP
        </button>


        <button
          className="nav-link"
          onClick={()=>
            navigate("/about")
          }
        >
          ABOUT
        </button>

      </div>



      {/* LOGO */}

      <div
        className="nav-logo"
        onClick={()=>
          navigate("/")
        }
      >
        THRIFTBAZAAR
      </div>



      {/* RIGHT */}

      <div className="nav-right">


        {/* Vendor dashboard */}

        {loggedIn && role==="VENDOR" &&(

          <button
            className="nav-link"
            onClick={()=>
              navigate(
                "/vendor/dashboard"
              )
            }
          >
            DASHBOARD
          </button>

        )}



        {/* Cart */}

        {loggedIn &&(

          <button
            className="nav-link"
            onClick={()=>
              navigate("/cart")
            }
          >
            CART
          </button>

        )}



        {/* Login */}

        {!loggedIn &&(

          <button
            className="nav-link"
            onClick={()=>
              navigate("/login")
            }
          >
            LOGIN
          </button>

        )}



        {/* Logout */}

        {loggedIn &&(

          <button
            className="nav-link"
            onClick={
              handleLogout
            }
          >
            LOGOUT
          </button>

        )}


      </div>


    </header>

  );

}

export default Navbar;