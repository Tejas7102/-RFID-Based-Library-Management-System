import React, { useEffect, useState } from "react";
import "./home.css";
import Header from "../Header/Header";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) {
        navigate("/");
      }
    });
    return () => {
      unsubscribe();
    };
  }, [auth, navigate]);

  const issuebooks = () => {
    navigate("/Issuedbooks");
  };
  const hissuebooks = () => {
    navigate("/history-issued-books");
  };

  if (loading) {
    return <div>Loading...</div>; // render a loading spinner while waiting for Firebase Authentication API
  }

  return (
    <div className="container1">
      <div>{<Header user={auth.currentUser} />}</div>
      <div className="containerH">
        <div className="flexbox1 fb1">
          <div id="iteam">
            <button className="i1" id="subiteam" onClick={issuebooks}>
              <div className="button_div">Issued-Books</div>
            </button>
          </div>
          <div id="iteam">
            <button className="i2" id="subiteam" onClick={hissuebooks}>
              <div className="button_div">History of Books</div>
            </button>
          </div>
        </div>
        <div className="flexbox1 fb2">
          <div id="iteam">
            <button className="i3" id="subiteam">
              <div className="button_div">Issued-Ebooks</div>
            </button>
          </div>
          <div id="iteam">
            <button className="i4" id="subiteam">
              <div className="button_div">History of Ebooks</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
