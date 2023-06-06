import React, { useEffect, useState } from "react";
import "../Issuedbooks/issuedbooks.css";
import Header from "../Header/Header";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
export default function Historybooks() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getbooksbyid();
    getMovies();
  }, []);
  const [books, setBooks] = useState([]);
  function getMovies() {
    const bcr = collection(db, "bookData");
    getDocs(bcr)
      .then((response) => {
        const mvs = response.docs.map((doc) => ({
          data: doc.data(),
          id: doc.id,
        }));
        setBooks(mvs);
      })
      .catch((error) => console.log(error.message));
  }

  function getbooksbyid(e) {
    const bcr = collection(db, "studentData");
    getDocs(bcr)
      .then((response) => {
        const mvs = response.docs.map((doc) => ({
          data: doc.data(),
          id: doc.id,
        }));
        setStudents(mvs);
      })
      .catch((error) => console.log(error.message));
  }
  const filterData = students.filter((item) => {
    return item.data.email === auth.currentUser.email;
  });
  const filterbook = books.filter((item) => {
    return item.id === filterData[0].data.returnRecord.slot1.serialNo;
  });
  function issueDate(book) {
    if (filterData[0].data.returnRecord.slot1.serialNo === book.id) {
      return filterData[0].data.returnRecord.slot1.returnDate;
    }
    // if(filterData[0].data.returnRecord.slot2.serialNo===book.id){
    //   return filterData[0].data.returnRecord.slot2.returnDate;
    // }
    // if(filterData[0].data.returnRecord.slot3.serialNo===book.id){
    //   return filterData[0].data.returnRecord.slot3.returnDate;
    // }
    // if(filterData[0].data.returnRecord.slot4.serialNo===book.id){
    //   return filterData[0].data.returnRecord.slot4.returnDate;
    // }
    // if(filterData[0].data.returnRecord.slot5.serialNo===book.id){
    //   return filterData[0].data.returnRecord.slot5.returnDate;
    // }
  }
  return (
    <div className="mib">
      <div>
        <Header />
      </div>
      <div>
        <div className="abc">
          <div className="bookbox1">
            {filterbook.map((book) => (
              <div key={book.id}>
                <div className="bookbox">
                  <div className="bookimage">
                    <img
                      src={book.data.largeImageURL}
                      alt=""
                      className="subbookimage"
                    />
                  </div>
                  <div className="pdiv">
                    <p className="bookp">
                      <b> Name:</b> {book.data.title}
                    </p>
                    <p className="bookp">
                      <b> Author</b>:{book.data.author}
                    </p>
                    <p className="bookp">
                      <b> Publisher</b>: {book.data.publisher}
                    </p>

                    <p className="bookp">
                      <b> Returned date</b>: {issueDate(book)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
