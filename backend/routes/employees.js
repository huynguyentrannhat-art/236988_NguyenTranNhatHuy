
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

const required = ["employeeId", "fullName", "email"];

function valid(data) {
  return required.every(
    key => typeof data[key] === "string" && data[key].trim()
  ) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
}

function handleError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã nhân viên đã tồn tại"
    });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message
    });
  }
  console.error(error);
  return res.status(500).json({
    message: "Lỗi máy chủ"
  });
}

const fields = [
  "employeeId", "fullName", "gender",
  "dateOfBirth", "department", "position",
  "email", "phone", "hireDate", "status"
];

function pickFields(body) {
  return Object.fromEntries(
    fields.filter(key => body[key] !== undefined)
      .map(key => [key, body[key]])
  );
}

function getFilter(id) {
  return mongoose.isValidObjectId(id)
    ? { $or: [{ _id: id }, { employeeId: id }] }
    : { employeeId: id };
}

// GET danh sách và tìm kiếm
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const employees = await Employee.find(
      search ? {
        $or: [
          { employeeId: { $regex: escapeRegex(search), $options: "i" } },
          { fullName: { $regex: escapeRegex(search), $options: "i" } }
        ]
      } : {}
    ).sort({ employeeId: 1 });

    res.json(employees);
  } catch (error) {
    handleError(res, error);
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET một nhân viên
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findOne(getFilter(req.params.id));
    if (!employee) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json(employee);
  } catch (error) {
    handleError(res, error);
  }
});

// POST thêm nhân viên
router.post("/", async (req, res) => {
  try {
    const data = pickFields(req.body);
    if (!valid(data)) {
      return res.status(400).json({
        message: "Mã nhân viên, họ tên và email không hợp lệ"
      });
    }
    const employee = await Employee.create(data);
    res.status(201).json({
      message: "Thêm nhân viên thành công",
      employee
    });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT cập nhật nhân viên
router.put("/:id", async (req, res) => {
  try {
    const data = pickFields(req.body);
    const existing = await Employee.findOne(getFilter(req.params.id));
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    const merged = { ...existing.toObject(), ...data };
    if (!valid(merged)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const employee = await Employee.findByIdAndUpdate(
      existing._id,
      { $set: data },
      { new: true, runValidators: true }
    );
    res.json({ message: "Cập nhật thành công", employee });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE xóa nhân viên
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete(
      getFilter(req.params.id)
    );
    if (!employee) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
