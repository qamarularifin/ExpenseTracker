const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password1234",
  database: "ExpenseTrackerDB",
  timezone: "Z", // Set to UTC
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.get("/expenses", (req, res) => {
  const query = "SELECT * FROM T_Expense";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/expenses", (req, res) => {
  const { date, description1, description2, cost } = req.body;
  const query =
    "INSERT INTO T_Expense (date, description1, description2, cost) VALUES (?, ?, ?, ?)";
  db.query(query, [date, description1, description2, cost], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ id: results.insertId, ...req.body });
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
