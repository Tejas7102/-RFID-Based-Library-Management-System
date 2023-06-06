import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useRef } from "react";
import { signOut } from "firebase/auth";
import { FaBars, FaTimes } from "react-icons/fa";
export default function Header() {
  const navRef = useRef();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const displaymenue = () => {
    navRef.current.classList.toggle("responsive_nav");
  };
  // console.log(user.email);
  const logout = () => {
    signOut(auth);
    navigate("/");
  };
  const home = () => {
    navigate("/Home");
  };
  const book = () => {
    navigate("/Book");
  };
  const ebook = () => {
    navigate("/eBook");
  };
  const about = () => {
    navigate("/about");
  };
  const comunity = () => {
    navigate("/community");
  };
  return (
    <div className="containerH">
      <header className="Header1">
        <nav className="nav1" ref={navRef}>
          <button className="b1" onClick={home}>
            Home
          </button>
          <button className="b1" onClick={book}>
            Book
          </button>
          <button className="b1" onClick={ebook}>
            E-Book
          </button>
          <button className="b1" onClick={about}>
            About Us
          </button>
          <button className="b1" onClick={comunity}>
            Join us
          </button>
          <button className="b1 b3" onClick={logout}>
            Sign out
          </button>
          <button className="b3 b1" onClick={displaymenue}>
            <FaTimes />
          </button>
        </nav>
        <nav className="right">
          <button className="b4" onClick={comunity}>
            Hello {user?.displayName}
          </button>
          <button className="b1" onClick={logout}>
            Sign out
          </button>
        </nav>
        <div className="mobileview">
          <button className="menu" onClick={displaymenue}>
            {<FaBars />}
          </button>
          <button className="b2" onClick={comunity}>
            Hello {user?.displayName}
          </button>
        </div>
      </header>
    </div>
  );
}
