import React, { useEffect, useState, useCallback } from "react";
import "./Book.css";
import Header from "../Header/Header";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore"; // added imports for firestore query
import Popup from "../Popup/Popup";
import { useNavigate } from "react-router-dom";

function Book() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // added state for search term
  const [filteredBooks, setFilteredBooks] = useState([]); // added state for filtered books

  useEffect(() => {
    getMovies();
  }, []);

  function getMovies() {
    const bcr = collection(db, "bookData");
    getDocs(bcr)
      .then((response) => {
        const mvs = response.docs.map((doc) => ({
          data: doc.data(),
          id: doc.id,
        }));
        setBooks(mvs);
        setFilteredBooks(mvs); // added to initialize filtered books with all books
      })
      .catch((error) => console.log(error.message));
  }

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  useEffect(() => {
    const queryTerm = searchTerm.toLowerCase(); // converting search term to lower case
    const filtered = books.filter((book) =>
      book.data.title.toLowerCase().includes(queryTerm)
    );
    setFilteredBooks(filtered);
  }, [books, searchTerm]);

  const openpopup = useCallback(
    (book) => () => {
      navigate("/Popup", {
        state: {
          name: book.data.title,
          py: book.data.publicationYear,
          pb: book.data.publisher,
          av: book.data.status,
          img: book.data.largeImageURL,
          loc: book.data.location,
        },
      });
    },
    []
  );

  if (auth.currentUser !== null) {
    return (
      <div className="container">
        <div>{<Header />}</div>
        <div className="search_div">
          <form action="">
            <input
              type="text"
              className="search_form"
              placeholder="Search a book.."
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>
        </div>
        <div className="imgbox">
          {filteredBooks.map((book) => (
            <div key={book.id} className="p2">
              <button className="subb1" onClick={openpopup(book)}>
                <img id="p1" src={`${book.data.largeImageURL}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Book;
