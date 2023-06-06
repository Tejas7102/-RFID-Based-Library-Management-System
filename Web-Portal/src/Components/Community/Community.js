import React from "react";
import "./Comunity.css";
import Header from "../Header/Header";
import { auth } from "../firebase";
function Community() {
  if (auth.currentUser !== null) {
    return (
      <div className="container">
        <div>{<Header />}</div>
      </div>
    );
  }
}

export default Community;
