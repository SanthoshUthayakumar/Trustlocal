import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function Admin() {

  const [users, setUsers] = useState([]);

  // Fetch pending users
  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pending");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Approve user
  const approveUser = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/approve/${id}`);
      alert("User Approved");
      fetchPending(); // refresh list
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      {users.length === 0 ? (
        <p>No Pending Users</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="user-card">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Phone:</strong> {user.phone}</p>

            <div className="image-row">
              <img 
                src={`http://localhost:5000/uploads/${user.pan_image}`} 
                alt="PAN"
              />
              <img 
                src={`http://localhost:5000/uploads/${user.aadhar_image}`} 
                alt="Aadhar"
              />
              <img 
                src={`http://localhost:5000/uploads/${user.selfie_image}`} 
                alt="Selfie"
              />
            </div>

            <button onClick={() => approveUser(user.id)}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;
