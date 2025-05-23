const db = require('../config/db');

function validateSchoolInput(data) {
  return data.name && data.address && !isNaN(data.latitude) && !isNaN(data.longitude);
}

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!validateSchoolInput(req.body)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.status(201).json({ message: 'School added successfully', id: result.insertId });
  });
};

exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLng = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ message: 'Invalid coordinates' });
  }

  const distanceFormula = `(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))`;

  const query = `SELECT *, ${distanceFormula} AS distance FROM schools ORDER BY distance`;

  db.query(query, [userLat, userLng, userLat], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.status(200).json(results);
  });
};