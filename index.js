const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');
const bodyParser = require('body-parser');
const cors = require('cors');


admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyB24DHLZrps0y0yGEfZ4QaMXFxpEYjnW20",
  authDomain: "reposcal.firebaseapp.com",
  projectId: "reposcal",
  storageBucket: "reposcal.appspot.com",
  messagingSenderId: "127062197976",
  appId: "1:127062197976:web:378446821a2983fde6b9ad"
};

firebase.initializeApp(firebaseConfig);

const app = express();
const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());


app.get('/user-repos/:username', (req,res) => {
  const {username} = req.params;
  // return res.status(201).json({data: [{language: 'python', name: 'analexin'},{language: 'python', name: 'analexin'}]});
  db.collection(`${username}`).get()
  .then(data => {
    let repos = [];
    data.forEach(doc => {
      repos.push(doc.data());
    });
    return res.status(201).json({data: repos});
  })
  .catch(error => res.status(200).json({message: error}));
});

app.post('/login', (req,res) => {
  const {username, password} = req.body;
  db.collection('users').doc(`${username}`).get()
  .then((doc) => {
    if (doc.exists) {
      // Return the user data
      if (password === doc.data().password)
        return res.status(200).json({message: 'loged-in'});
      else
        return res.status(200).json({message: 'wrong-credentials'});
    } else {
      // Not registered user
      return res.status(200).json({message: 'user-not-registered'}); 
    }
  })
  .catch((error) => {
    return res.status(200).json({message: 'user-not-registered'});
  });
});

app.post('/signup', (req, res) => {
  const {username, password} = req.body;
  db.collection('users').doc(`${username}`).get()
  .then((doc) => {
    if (doc.exists) {
      res.status(200).json({data: {}, message: 'user-already-exists'});
    } else {
      // Create new user
      db.collection('users').doc(`${username}`).set({password})
      .then(() => res.status(201).json({data: {}, message: 'user-created'})) 
      .catch(err => res.status(200).json({data: {}, message: err}))
    }
  })
  .catch((error) => res.status(400).json({data: error, message: 'There was an error'}));
});

app.patch('/update', (req, res) => {
  const {username, language, name, description, id} = req.body;
  const newData = {
    language,
    name,
    description,
    id
  };
  db.collection(`${username}`).doc(`${id}`).set(newData)
      .then(() => res.status(201).json({data: {}, message: 'updated'})) 
      .catch(err => res.status(200).json({data: {}, message: err}))
});

exports.api = functions.https.onRequest(app);


//db.doc(`${username}/${id}`).set(newData)