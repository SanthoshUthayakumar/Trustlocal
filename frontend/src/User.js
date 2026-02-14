import React, { useEffect, useState } from "react";
import axios from "axios";
import "./User.css";

function User() {

  const name = localStorage.getItem("name");
  const score = localStorage.getItem("score");
  const user_id = localStorage.getItem("user_id");

  const [activeTab, setActiveTab] = useState("posts");

  /* ================= STATES ================= */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [posts, setPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [filterCity, setFilterCity] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterPincode, setFilterPincode] = useState("");

  const [bookingHours, setBookingHours] = useState({});

  /* ================= FETCH DATA ================= */

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/posts/user"
      );
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/my-requests/${user_id}`
      );
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/my-jobs/${user_id}`
      );
      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchPosts();
      fetchRequests();
      fetchJobs();
    }
  }, [user_id]);

  /* ================= ACTIONS ================= */

  const createPost = async () => {

    if (!title || !description || !hourlyRate) {
      alert("Please fill all fields including payment");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/create-post",
        {
          user_id,
          role: "user",
          title,
          description,
          hourly_rate: hourlyRate
        }
      );

      setTitle("");
      setDescription("");
      setHourlyRate("");
      fetchPosts();

    } catch (err) {
      console.log(err);
    }
  };

  const applyFilter = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/posts/user",
        {
          params: {
            city: filterCity,
            area: filterArea,
            pincode: filterPincode
          }
        }
      );
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const clearFilter = () => {
    setFilterCity("");
    setFilterArea("");
    setFilterPincode("");
    fetchPosts();
  };

  const sendRequest = async (post_id, receiver_id) => {

    const hours = bookingHours[post_id] || 1;

    try {
      await axios.post(
        "http://localhost:5000/api/send-request",
        {
          post_id,
          sender_id: user_id,
          receiver_id,
          hours
        }
      );

      alert("Booking Request Sent Successfully");

    } catch (err) {
      console.log(err);
    }
  };

  const acceptRequest = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/accept-request/${id}`
      );
      fetchRequests();
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/reject-request/${id}`
      );
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  const completeJob = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/complete-job/${id}`
      );
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  const rateJob = async (jobId, rating) => {
    try {
      await axios.put(
        `http://localhost:5000/api/rate-job/${jobId}`,
        {
          rating,
          rater_id: user_id
        }
      );
      fetchJobs();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="user-container">

      {/* HEADER */}
      <div className="user-header">
        <div>
          <h2>Welcome {name}</h2>
          <div className="user-score-badge">
            Honest Score: {score}
          </div>
        </div>

        <button
          className="user-logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="user-tabs">
        <button onClick={() => setActiveTab("posts")}>Posts</button>
        <button onClick={() => setActiveTab("requests")}>Requests</button>
        <button onClick={() => setActiveTab("jobs")}>Jobs</button>
      </div>

      {/* ================= POSTS TAB ================= */}
      {activeTab === "posts" && (
        <>
          <div className="user-create-card">
            <h3>Create Job Post</h3>

            <input
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="number"
              placeholder="Payment per Hour (₹)"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />

            <button onClick={createPost}>Post</button>
          </div>

          <h3>Available Workers</h3>

          {/* FILTER */}
          <div className="filter-box">
            <input
              placeholder="City"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />
            <input
              placeholder="Area"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            />
            <input
              placeholder="Pincode"
              value={filterPincode}
              onChange={(e) => setFilterPincode(e.target.value)}
            />
            <button onClick={applyFilter}>Apply</button>
            <button onClick={clearFilter}>Clear</button>
          </div>

          <div className="user-posts-grid">
            {posts.map((post) => {

              const hours = bookingHours[post.id] || 1;
              const total = (post.hourly_rate || 0) * hours;

              return (
                <div key={post.id} className="user-post-card">

                  <img
                    src={`http://localhost:5000/uploads/${post.selfie_image}`}
                    alt="worker"
                  />

                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  <p><strong>By:</strong> {post.name}</p>
                  <p>💰 ₹{post.hourly_rate}/hour</p>
                  <p>📍 {post.city}</p>

                  <input
                    type="number"
                    min="1"
                    value={hours}
                    onChange={(e) =>
                      setBookingHours({
                        ...bookingHours,
                        [post.id]: Number(e.target.value)
                      })
                    }
                  />

                  <p><strong>Total: ₹{total}</strong></p>

                  <button
                    className="user-request-btn"
                    onClick={() =>
                      sendRequest(post.id, post.user_id)
                    }
                  >
                    Book Now
                  </button>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= REQUESTS TAB ================= */}
      {activeTab === "requests" && (
        <>
          <h3>Incoming Requests</h3>

          {requests.map((req) => (
            <div key={req.id} className="user-request-card">
              <p>From: {req.name}</p>
              <p>Status: {req.status}</p>
              <p>Hours: {req.hours}</p>
              <p>Total: ₹{req.total_amount}</p>

              {req.status === "pending" && (
                <>
                  <button onClick={() => acceptRequest(req.id)}>
                    Accept
                  </button>
                  <button onClick={() => rejectRequest(req.id)}>
                    Reject
                  </button>
                </>
              )}
            </div>
          ))}
        </>
      )}

      {/* ================= JOBS TAB ================= */}
      {activeTab === "jobs" && (
        <>
          <h3>Ongoing Works</h3>

          {jobs.map((job) => (
            <div key={job.id} className="user-request-card">
              <p><strong>Worker:</strong> {job.worker_name}</p>
              <p>Job ID: {job.id}</p>
              <p>Hours: {job.hours}</p>
              <p>Total: ₹{job.total_amount}</p>

              <button onClick={() => completeJob(job.id)}>
                Complete
              </button>

              <select
                onChange={(e) => rateJob(job.id, e.target.value)}
              >
                <option value="">Rate Worker</option>
                <option value="1">⭐</option>
                <option value="2">⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="5">⭐⭐⭐⭐⭐</option>
              </select>
            </div>
          ))}
        </>
      )}

    </div>
  );
}

export default User;
