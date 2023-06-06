import React from "react";
import "./Ebook.css";
import Header from "../Header/Header";
import { auth } from "../firebase";
function Ebook() {
  if (auth.currentUser) {
    return (
      <div className="container">
        <div>{<Header />}</div>
      </div>
    );
  }
}

export default Ebook;
