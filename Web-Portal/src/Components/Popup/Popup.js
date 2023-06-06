import React from "react";
import "./popup.css";
import { useLocation, useNavigate } from "react-router-dom";
const Popup = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleClose = () => {
    navigate("../Book");
  };
  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={handleClose}>
          x
        </span>
        <div className="bfb1">
          <img src={`${location.state.img}`} className="bookimg" alt="" />
          <div className="subbfb1">
            <p>Name: {location.state.name}</p>
            <p>Publication Year: {location.state.py}</p>
            <p>Publisher: {location.state.pb}</p>
            <p>Avaibility: {location.state.av}</p>
            <p>{`location: ${
              location.state.av == "available"
                ? location.state.loc
                : "not available"
            }`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
