const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

/* =========================
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   REGISTER
========================= */

router.post(
  "/register",
  upload.fields([
    { name: "pan" },
    { name: "aadhar" },
    { name: "selfie" }
  ]),
  (req, res) => {

    const {
      name,
      phone,
      password,
      role,
      city,
      area,
      pincode
    } = req.body;

    if (role === "admin")
      return res.json({ msg: "Admin cannot register" });

    const pan = req.files["pan"]?.[0]?.filename || null;
    const aadhar = req.files["aadhar"]?.[0]?.filename || null;
    const selfie = req.files["selfie"]?.[0]?.filename || null;

    db.query(
      `INSERT INTO users
      (name, phone, password, role, city, area, pincode, pan_image, aadhar_image, selfie_image)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name, phone, password, role, city, area, pincode, pan, aadhar, selfie],
      (err) => {
        if (err) return res.json(err);
        res.json({ msg: "Registered Successfully" });
      }
    );
  }
);

/* =========================
   LOGIN
========================= */

router.post("/login", (req, res) => {

  const { phone, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE phone=?",
    [phone],
    (err, result) => {

      if (result.length === 0)
        return res.json({ msg: "User not found" });

      const user = result[0];

      if (user.status !== "approved")
        return res.json({ msg: "Not approved yet by admin" });

      if (password !== user.password)
        return res.json({ msg: "Wrong password" });

      res.json({
        role: user.role,
        name: user.name,
        honest_score: user.honest_score,
        id: user.id
      });
    }
  );
});

/* =========================
   ADMIN
========================= */

router.get("/pending", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE status='pending'",
    (err, result) => {
      if (err) return res.json(err);
      res.json(result);
    }
  );
});

router.put("/approve/:id", (req, res) => {
  db.query(
    "UPDATE users SET status='approved', honest_score=40 WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ msg: "User Approved with 40 Honest Score" });
    }
  );
});

/* =========================
   POSTS
========================= */

router.post("/create-post", (req, res) => {

  const { user_id, role, title, description, hourly_rate } = req.body;

  db.query(
    "INSERT INTO posts (user_id, role, title, description, hourly_rate) VALUES (?,?,?,?,?)",
    [user_id, role, title, description, hourly_rate || 0],
    (err) => {
      if (err) return res.json(err);
      res.json({ msg: "Post Created Successfully" });
    }
  );
});

router.get("/posts/:role", (req, res) => {

  const role = req.params.role;
  const targetRole = role === "user" ? "worker" : "user";

  const { city, area, pincode } = req.query;

  let query = `
    SELECT 
      posts.*,
      users.name,
      users.city,
      users.area,
      users.pincode,
      users.honest_score,
      users.selfie_image
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.role = ?
  `;

  let values = [targetRole];

  if (city) {
    query += " AND users.city = ?";
    values.push(city);
  }

  if (area) {
    query += " AND users.area = ?";
    values.push(area);
  }

  if (pincode) {
    query += " AND users.pincode = ?";
    values.push(pincode);
  }

  db.query(query, values, (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

/* =========================
   REQUEST SYSTEM
========================= */

router.post("/send-request", (req, res) => {

  const { post_id, sender_id, receiver_id, hours } = req.body;

  db.query(
    "SELECT hourly_rate FROM posts WHERE id=?",
    [post_id],
    (err, result) => {

      if (err || result.length === 0)
        return res.json({ msg: "Post not found" });

      const rate = result[0].hourly_rate || 0;
      const total = rate * hours;

      db.query(
        "INSERT INTO requests (post_id, sender_id, receiver_id, hours, total_amount) VALUES (?,?,?,?,?)",
        [post_id, sender_id, receiver_id, hours, total],
        (err) => {
          if (err) return res.json(err);
          res.json({ msg: "Booking Request Sent" });
        }
      );
    }
  );
});

router.get("/my-requests/:id", (req, res) => {

  const userId = req.params.id;

  db.query(
    `SELECT requests.*, users.name
     FROM requests
     JOIN users ON requests.sender_id = users.id
     WHERE receiver_id = ?
     ORDER BY requests.id DESC`,
    [userId],
    (err, result) => {
      if (err) return res.json(err);
      res.json(result);
    }
  );
});

router.put("/accept-request/:id", (req, res) => {

  const requestId = req.params.id;

  db.query(
    "UPDATE requests SET status='accepted' WHERE id=?",
    [requestId],
    (err) => {

      if (err) return res.json(err);

      db.query(
        "SELECT * FROM requests WHERE id=?",
        [requestId],
        (err, result) => {

          if (result.length === 0)
            return res.json({ msg: "Request not found" });

          const r = result[0];

          db.query(
            "INSERT INTO jobs (request_id, user_id, worker_id, hours, total_amount, status) VALUES (?,?,?,?,?, 'ongoing')",
            [r.id, r.sender_id, r.receiver_id, r.hours, r.total_amount],
            (err) => {
              if (err) return res.json(err);
              res.json({ msg: "Job Started" });
            }
          );
        }
      );
    }
  );
});

router.put("/reject-request/:id", (req, res) => {
  db.query(
    "UPDATE requests SET status='rejected' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ msg: "Request Rejected" });
    }
  );
});

/* =========================
   JOBS
========================= */

router.get("/my-jobs/:id", (req, res) => {

  const userId = req.params.id;

  db.query(
    `SELECT jobs.*, users.name
     FROM jobs
     JOIN users ON users.id = 
       CASE 
         WHEN jobs.user_id = ? THEN jobs.worker_id
         ELSE jobs.user_id
       END
     WHERE (jobs.user_id=? OR jobs.worker_id=?)`,
    [userId, userId, userId],
    (err, result) => {
      if (err) return res.json(err);
      res.json(result);
    }
  );
});


router.put("/complete-job/:id", (req, res) => {
  db.query(
    "UPDATE jobs SET status='completed' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ msg: "Job Completed" });
    }
  );
});

/* =========================
   RATING SYSTEM
========================= */

router.put("/rate-job/:id", (req, res) => {

  const { rating, rater_id } = req.body;
  const jobId = req.params.id;

  db.query(
    "SELECT * FROM jobs WHERE id=?",
    [jobId],
    (err, result) => {

      if (result.length === 0)
        return res.json({ msg: "Job not found" });

      const job = result[0];
      let targetUser;

      if (rater_id == job.user_id) {
        targetUser = job.worker_id;
        db.query("UPDATE jobs SET user_rating=? WHERE id=?", [rating, jobId]);
      } else {
        targetUser = job.user_id;
        db.query("UPDATE jobs SET worker_rating=? WHERE id=?", [rating, jobId]);
      }

      let scoreChange = 0;
      if (rating == 5) scoreChange = 3;
      else if (rating <= 2) scoreChange = -5;

      db.query(
        "UPDATE users SET honest_score = honest_score + ? WHERE id=?",
        [scoreChange, targetUser],
        () => {
          res.json({ msg: "Rating Submitted" });
        }
      );
    }
  );
});

/* =========================
   AVAILABILITY
========================= */

router.post("/set-availability", (req, res) => {

  const { worker_id, day, start_time, end_time } = req.body;

  db.query(
    "INSERT INTO availability (worker_id, day, start_time, end_time) VALUES (?,?,?,?)",
    [worker_id, day, start_time, end_time],
    (err) => {
      if (err) return res.json(err);
      res.json({ msg: "Availability Saved" });
    }
  );
});

router.get("/availability/:id", (req, res) => {

  db.query(
    "SELECT * FROM availability WHERE worker_id=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.json(err);
      res.json(result);
    }
  );
});

module.exports = router;
