const firebaseConfig = {
  apiKey: "AIzaSyAM485NRfgdcErXfQOQ8G0LhszjlTVHcsE",
  authDomain: "mcq-portal-d2cb3.firebaseapp.com",
  projectId: "mcq-portal-d2cb3",
  storageBucket: "mcq-portal-d2cb3.firebasestorage.app",
  messagingSenderId: "505777785956",
  appId: "1:505777785956:web:7dab25d59dcb080fb36371",
  measurementId: "G-EJ0RM61127"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
