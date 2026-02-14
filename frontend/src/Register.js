import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    role: "user",
    city: "",
    area: "",
    pincode: "",
    pan: null,
    aadhar: null,
    selfie: null
  });

  /* ========================
     HANDLE INPUT CHANGE
  ======================== */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  /* ========================
     SUBMIT FUNCTION
  ======================== */

  const submit = async () => {

    if (
      !form.name ||
      !form.phone ||
      !form.password ||
      !form.city ||
      !form.area ||
      !form.pincode
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (!form.pan || !form.aadhar || !form.selfie) {
      alert("Please upload all required documents");
      return;
    }

    const data = new FormData();

    Object.keys(form).forEach(key => {
      data.append(key, form[key]);
    });

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/register",
        data
      );

      alert("Registered Successfully. Waiting for admin approval.");
      navigate("/");

    } catch (error) {
      alert("Registration Failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     UI
  ======================== */

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account</h2>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <select
          name="role"
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="worker">Worker</option>
        </select>

        {/* LOCATION */}
        <input
          name="city"
          placeholder="City"
          onChange={handleChange}
        />

        <input
          name="area"
          placeholder="Area"
          onChange={handleChange}
        />

        <input
          name="pincode"
          type="number"
          placeholder="Pincode"
          onChange={handleChange}
        />

        <div className="file-section">
          <label>Police Clearance Certificate</label>
          <input
            name="pan"
            type="file"
            onChange={handleFileChange}
          />

          <label>Aadhar Card Photo</label>
          <input
            name="aadhar"
            type="file"
            onChange={handleFileChange}
          />

          <label>Your Selfie</label>
          <input
            name="selfie"
            type="file"
            onChange={handleFileChange}
          />
        </div>

        <button onClick={submit} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
