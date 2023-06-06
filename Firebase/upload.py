import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json

# Initialize Firebase Admin SDK with a service account
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

# Open and load the JSON file
with open('mapBook.json', 'r') as f:
    data = json.load(f)

# Upload data to Firestore
for key, value in data.items():
    db.collection('mapBook').document(key).set(value)

with open('mapStudent.json', 'r') as f:
    data = json.load(f)

# Upload data to Firestore
for key, value in data.items():
    db.collection('mapStudent').document(key).set(value)

with open('studentData.json', 'r') as f:
    data = json.load(f)

# Upload data to Firestore
for key, value in data.items():
    db.collection('studentData').document(key).set(value)

with open('bookData.json', 'r') as f:
    data = json.load(f)

# Upload data to Firestore
for key, value in data.items():
    db.collection('bookData').document(key).set(value)
