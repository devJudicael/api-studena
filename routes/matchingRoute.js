import express from "express";
import { findMatchingTeachers } from "../controllers/matchingController.js";

const router = express.Router();

// Route pour trouver les professeurs correspondant à un étudiant
router.get("/matching/students/:studentId", findMatchingTeachers);

export default router;
