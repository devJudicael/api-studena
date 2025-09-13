import multer from "multer";
import express from "express";
import {
  uploadStudentsExcel,
  deleteAllStudents,
  getStudents,
} from "../controllers/studentController.js";
import { findMatchingTeachers } from "../controllers/matchingController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // stockage temporaire

// route de soumssion fichier excel pour creer des étudiants
router.post(
  "/upload-students-excel",
  upload.single("file"),
  uploadStudentsExcel
);

// route de suppression de tous les étudiants
router.delete("/students", deleteAllStudents);

// route de récupération de tous les étudiants
router.get("/students", getStudents);

// route de récupération de tous les étudiants
router.get("/students", getStudents);

// route de récupération des matchs de prof pour un etudiant donné
router.get("/students/matching/:studentId", findMatchingTeachers);

export default router;
