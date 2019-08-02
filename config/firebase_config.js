const firebase = require("firebase");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: "telegram-bookmark-bot",
  storageBucket: "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDERID,
  appId: process.env.FIREBASE_APPID
};

firebase.initializeApp(firebaseConfig);

const ref = firebase.database().ref();
const sitesRef = ref.child("sites");
const bookmarksRef = ref.child("bookmarks");

module.exports = {
  sitesRef,
  bookmarksRef
};
