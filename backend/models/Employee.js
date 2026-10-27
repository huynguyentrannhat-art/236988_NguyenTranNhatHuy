
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: String,
  dateOfBirth: String,
  department: String,
  position: String,
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  hireDate: String,
  status: String
}, {
  timestamps: true,
  collection: "employees"
});

module.exports = mongoose.model("Employee", employeeSchema);
