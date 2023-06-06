const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBRgdk1s216-tRYdPoTUmxFUlRSVrWwWKI",
  authDomain: "dlms-67462.firebaseapp.com",
  databaseURL:"https://dlms-67462-default-rtdb.asia-southeast1.firebasedatabase.app",
});

var db = firebase.firestore();

var menu = [
  {
    id: 1,
    name: "Focaccia al rosmarino",
    description: "Wood fired rosemary and garlic focaccia",
    price: 8.5,
    type: "Appetizers",
  },
  {
    id: 2,
    name: "Burratta con speck",
    description:
      "Burratta cheese, imported smoked prok belly prosciutto, pached balsamic pear",
    price: 13.5,
    type: "Appetizers",
  },
];

menu.forEach(function (obj) {
  db.collection("menu")
    .add({
      id: obj.id,
      name: obj.name,
      description: obj.description,
      price: obj.price,
      type: obj.type,
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
});
