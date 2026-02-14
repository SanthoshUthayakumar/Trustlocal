import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Worker.css";

function Worker() {

  const name = localStorage.getItem("name");
  const score = localStorage.getItem("score");
  const user_id = localStorage.getItem("user_id");

  const [activeTab, setActiveTab] = useState("posts");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [posts, setPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/worker");
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

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/availability/${user_id}`
      );
      setAvailability(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchPosts();
      fetchRequests();
      fetchJobs();
      fetchAvailability();
    }
  }, [user_id]);

  /* ================= ACTIONS ================= */

  const createPost = async () => {

    if (!title || !description || !hourlyRate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/create-post", {
        user_id,
        role: "worker",
        title,
        description,
        hourly_rate: hourlyRate
      });

      setTitle("");
      setDescription("");
      setHourlyRate("");
      fetchPosts();

    } catch (err) {
      console.log(err);
    }
  };

  const sendRequest = async (post_id, receiver_id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/send-request",
        {
          post_id,
          sender_id: user_id,
          receiver_id,
          hours: 1
        }
      );

      alert("Request Sent Successfully");

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

  const saveAvailability = async () => {

    if (!day || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/set-availability",
        {
          worker_id: user_id,
          day,
          start_time: startTime,
          end_time: endTime
        }
      );

      setDay("");
      setStartTime("");
      setEndTime("");
      fetchAvailability();

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="worker-container">

      {/* HEADER */}
      <div className="worker-header">
        <div>
          <h2>Welcome Worker {name}</h2>
          <div className="score-badge">
            Honor Score: {score}
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button onClick={() => setActiveTab("posts")}>Posts</button>
        <button onClick={() => setActiveTab("requests")}>Requests</button>
        <button onClick={() => setActiveTab("jobs")}>Jobs</button>
        <button onClick={() => setActiveTab("availability")}>Availability</button>
      </div>

      {/* POSTS TAB */}
      {activeTab === "posts" && (
        <>
          <div className="create-card">
            <h3>Create Skill Post</h3>

            <input
              placeholder="Skill Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Describe your skills"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="number"
              placeholder="Hourly Rate ₹"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />

            <button onClick={createPost}>Post</button>
          </div>

          <h3>User Job Posts</h3>

          {posts.length === 0 && <p>No job posts available</p>}

          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">

                <img
                  src={`http://localhost:5000/uploads/${post.selfie_image}`}
                  alt="User"
                  className="profile-img"
                />

                <h4>{post.title}</h4>
                <p>{post.description}</p>
                <p><strong>By:</strong> {post.name}</p>
                <p>📍 {post.city || "Location not set"}</p>
                <p>💰 ₹{post.hourly_rate || 0}/hour</p>

                <button
                  className="request-btn"
                  onClick={() => sendRequest(post.id, post.user_id)}
                >
                  Send Request
                </button>

              </div>
            ))}
          </div>
        </>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <>
          <h3>Incoming Requests</h3>

          {requests.length === 0 && <p>No incoming requests</p>}

          {requests.map((req) => (
            <div key={req.id} className="request-card">
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

      {/* JOBS TAB */}
      {/* JOBS TAB */}
{activeTab === "jobs" && (
  <>
    <h3>My Jobs</h3>

    {jobs.length === 0 && <p>No ongoing jobs</p>}

    {jobs.map((job) => (
      <div key={job.id} className="request-card">

        <p><strong>User:</strong> {job.name}</p>
        <p><strong>Job ID:</strong> {job.id}</p>
        <p><strong>Hours:</strong> {job.hours}</p>
        <p><strong>Total:</strong> ₹{job.total_amount}</p>
        <p><strong>Status:</strong> {job.status}</p>

        {/* Mark Completed */}
        {job.status === "ongoing" && (
          <button onClick={() => completeJob(job.id)}>
            Mark Completed
          </button>
        )}

        {/* Rate User (only after completed & not rated) */}
        {job.status === "completed" && !job.worker_rating && (
          <div style={{ marginTop: "10px" }}>
            <select
              defaultValue=""
              onChange={(e) =>
                rateJob(job.id, e.target.value)
              }
            >
              <option value="">Rate User</option>
              <option value="1">⭐</option>
              <option value="2">⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
            </select>
          </div>
        )}

        {/* Already Rated */}
        {job.worker_rating && (
          <p>⭐ You rated this user: {job.worker_rating}</p>
        )}

      </div>
    ))}
  </>
)}


      {/* AVAILABILITY TAB */}
      {activeTab === "availability" && (
  <div className="availability-section">

    <h3>Set Your Availability</h3>

    <div className="availability-form">

      <select value={day} onChange={(e) => setDay(e.target.value)}>
        <option value="">Select Day</option>
        <option>Monday</option>
        <option>Tuesday</option>
        <option>Wednesday</option>
        <option>Thursday</option>
        <option>Friday</option>
        <option>Saturday</option>
        <option>Sunday</option>
      </select>

      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />

      <button onClick={saveAvailability}>
        Save
      </button>

    </div>

    <div className="availability-list">

      <h4>Your Slots</h4>

      {availability.length === 0 && (
        <p className="no-availability">No availability set</p>
      )}

      {availability.map((slot) => (
        <div key={slot.id} className="availability-card">
          <span>{slot.day}</span>
          <span>{slot.start_time} - {slot.end_time}</span>
        </div>
      ))}

    </div>

  </div>
)}

    </div>
  );
}

export default Worker;
