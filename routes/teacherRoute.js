import multer from "multer";
import express from "express";
import {
  uploadTeachersExcel,
  deleteAllTeachers,
  getTeachers,
} from "../controllers/teacherController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // stockage temporaire

router.post(
  "/upload-teachers-excel",
  upload.single("file"),
  uploadTeachersExcel
);

router.delete("/teachers", deleteAllTeachers);
router.get("/teachers", getTeachers);

export default router;
