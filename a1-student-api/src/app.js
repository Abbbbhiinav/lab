const express = require("express");

const app = express();
app.use(express.json());


let students = [];
let nextId = 1;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidStudent(body) {
  if (!body || typeof body !== "object") return false;
  const { name, email, age } = body;
  if (typeof name !== "string" || name.trim() === "") return false;
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) return false;
  if (!Number.isInteger(age) || age <= 0) return false;
  return true;
}


app.post("/students", (req, res) => {
  if (!isValidStudent(req.body)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const { age } = req.body;

  const duplicate = students.some(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const student = { id: nextId++, name, email, age };
  students.push(student);
  return res.status(201).json(student);
});


app.get("/students", (req, res) => {
  const { minAge } = req.query;
  if (minAge === undefined) {
    return res.status(200).json(students);
  }
  const min = Number(minAge);
  if (minAge === "" || Number.isNaN(min)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  return res.status(200).json(students.filter((s) => s.age >= min));
});


app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  return res.status(200).json(student);
});


app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }
  students.splice(index, 1);
  return res.status(204).send();
});


app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid input" });
  }
  return next(err);
});

module.exports = app;
