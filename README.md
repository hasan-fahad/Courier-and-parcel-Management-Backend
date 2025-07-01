# 📦 Courier and Parcel Management Backend

A robust backend system for managing courier and parcel delivery services, built with **Node.js**, **Express.js**, and **MongoDB**. Supports multi-role authentication, parcel tracking, agent assignment, geolocation.

---

## 🚀 Features

- 👤 User registration & login with JWT authentication  
- 🔐 Role-based access control: `admin`, `agent`, and `user`  
- 📦 Parcel creation, status updates, and tracking  
- 🚚 Agent management & parcel assignment  
- 📍 Geo-location support (latitude & longitude)  
- 🌐 Multi-language support (English & Bangla)  
- 🛡️ Secure APIs with middleware authentication & authorization  
- 📷 File uploads via multer (e.g., images, delivery proofs)  
- 📊 Admin dashboard data endpoints for analytics  
- 📜 RESTful API architecture  

---

## 🛠️ Tech Stack

| Technology       | Description                     |
|------------------|---------------------------------|
| Node.js          | JavaScript runtime              |
| Express.js       | Web framework                   |
| MongoDB + Mongoose | NoSQL database and ODM        |
| JWT              | JSON Web Token Authentication  |
| bcryptjs         | Password hashing                |
| dotenv           | Environment configuration       |
| cors             | Cross-Origin Resource Sharing   |


---

## 📁 Project Structure

Courier-and-parcel-Management-Backend/
├── config/ # MongoDB connection & config
├── controllers/ # Route handlers (business logic)
├── middleware/ # Auth and role-based middleware
├── models/ # Mongoose schemas (User, Parcel, etc.)
├── routes/ # API routes (auth, parcels, users, agents, admin)
├── uploads/ # Uploaded images/files storage
├── .env # Environment variables
├── server.js # Application entry point
└── package.json # Project metadata and scripts



---

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hasan-fahad/Courier-and-parcel-Management-Backend.git
   cd Courier-and-parcel-Management-Backend
Install dependencies

npm install
Create .env file in the root directory with:

env
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Start the server

bash
Copy
Edit
npm start
Server will be running at: http://localhost:5000

📡 API Endpoints
🔑 Auth Routes
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login and get JWT token

👤 User Routes
Method	Endpoint	Description
GET	/api/users	Get all users
GET	/api/users/:id	Get user by ID
PUT	/api/users/:id	Update user info
DELETE	/api/users/:id	Delete user

📦 Parcel Routes
Method	Endpoint	Description
POST	/api/parcels	Create new parcel
GET	/api/parcels	Get all parcels
GET	/api/parcels/:id	Get parcel details by ID
PUT	/api/parcels/:id	Update parcel details
DELETE	/api/parcels/:id	Delete parcel
PUT	/api/parcels/status/:id	Update parcel status (e.g. Delivered, In Transit)

🚚 Agent Routes
Method	Endpoint	Description
GET	/api/agents	List all delivery agents
GET	/api/agents/:id/parcels	Get parcels assigned to agent

🧭 Tracking Routes
Method	Endpoint	Description
GET	/api/track/:trackingNumber	Track parcel by tracking number

📊 Admin Dashboard Routes
Method	Endpoint	Description
GET	/api/admin/overview	Get system overview & stats
GET	/api/admin/location/:id	Get parcel location route (lat/lng)

🔐 Role-Based Access Control
admin: Full access to manage users, parcels, agents, and dashboard

agent: View and update parcels assigned to them

user: Can create parcels and view only their own parcels
