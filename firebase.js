const firebaseConfig = {
  apiKey: "AIzaSyDmuLW0h2nFszYmSYHx2V6i8VsI5dmlZLg",
  authDomain: "cse323-hw.firebaseapp.com",
  projectId: "cse323-hw",
  storageBucket: "cse323-hw.appspot.com",
  messagingSenderId: "322333275762",
  appId: "1:322333275762:web:85f8ff8be0703d648134eb",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
