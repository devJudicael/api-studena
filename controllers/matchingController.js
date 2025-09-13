import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";

/**
 * Contrôleur pour faire correspondre les professeurs aux étudiants
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const findMatchingTeachers = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Vérifier si l'ID de l'étudiant est fourni
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: "L'ID de l'étudiant est requis",
      });
    }

    // Récupérer l'étudiant
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Étudiant non trouvé",
      });
    }

    // Récupérer tous les professeurs
    const teachers = await Teacher.find();
    if (!teachers.length) {
      return res.status(404).json({
        success: false,
        error: "Aucun professeur disponible",
      });
    }

    // Calculer le score de matching pour chaque professeur
    const matchingResults = teachers.map((teacher) => {
      // Score pour les matières (30% du score total)
      const subjectScore = calculateSubjectScore(
        student.subjects,
        teacher.subjectsTaught
      );

      // Score pour le niveau scolaire (30% du score total)
      const levelScore = calculateLevelScore(
        student.schoolLevel,
        teacher.levels
      );

      // Score pour les disponibilités (40% du score total)
      const availabilityScore = calculateAvailabilityScore(
        student.availabilities,
        teacher.availabilities
      );

      // Score total (pourcentage)
      const totalScore = Math.round(
        subjectScore * 0.3 + levelScore * 0.3 + availabilityScore * 0.4
      );

      return {
        teacher: {
          _id: teacher._id,
          fullName: teacher.fullName,
          subjectsTaught: teacher.subjectsTaught,
          levels: teacher.levels,
        },
        matchingScore: totalScore,
        details: {
          subjectScore,
          levelScore,
          availabilityScore,
        },
      };
    });

    // Trier les résultats par score décroissant
    matchingResults.sort((a, b) => b.matchingScore - a.matchingScore);

    res.json({
      success: true,
      student: {
        _id: student._id,
        fullName: student.fullName,
        subjects: student.subjects,
        schoolLevel: student.schoolLevel,
      },
      matches: matchingResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la recherche de professeurs correspondants",
    });
  }
};

/**
 * Calcule le score de correspondance des matières
 * @param {Array} studentSubjects - Matières de l'étudiant
 * @param {Array} teacherSubjects - Matières enseignées par le professeur
 * @returns {Number} Score entre 0 et 100
 */
const calculateSubjectScore = (studentSubjects, teacherSubjects) => {
  if (!studentSubjects.length || !teacherSubjects.length) return 0;

  // Normaliser les matières (minuscules, sans accents)
  const normalizedStudentSubjects = studentSubjects.map(normalizeString);
  const normalizedTeacherSubjects = teacherSubjects.map(normalizeString);

  // Compter combien de matières de l'étudiant sont enseignées par le professeur
  const matchingSubjects = normalizedStudentSubjects.filter((subject) =>
    normalizedTeacherSubjects.includes(subject)
  );

  // Calculer le pourcentage de correspondance
  return Math.round(
    (matchingSubjects.length / normalizedStudentSubjects.length) * 100
  );
};

/**
 * Calcule le score de correspondance du niveau scolaire
 * @param {String} studentLevel - Niveau scolaire de l'étudiant
 * @param {Array} teacherLevels - Niveaux enseignés par le professeur
 * @returns {Number} Score entre 0 et 100
 */
const calculateLevelScore = (studentLevel, teacherLevels) => {
  if (!studentLevel || !teacherLevels.length) return 0;

  // Normaliser les niveaux
  const normalizedStudentLevel = normalizeString(studentLevel);
  const normalizedTeacherLevels = teacherLevels.map(normalizeString);

  // Vérifier si le niveau de l'étudiant est enseigné par le professeur
  return normalizedTeacherLevels.includes(normalizedStudentLevel) ? 100 : 0;
};

/**
 * Calcule le score de correspondance des disponibilités
 * @param {Array} studentAvailabilities - Disponibilités de l'étudiant
 * @param {Array} teacherAvailabilities - Disponibilités du professeur
 * @returns {Number} Score entre 0 et 100
 */
const calculateAvailabilityScore = (
  studentAvailabilities,
  teacherAvailabilities
) => {
  if (!studentAvailabilities.length || !teacherAvailabilities.length) return 0;

  let matchingSlots = 0;
  let totalSlots = studentAvailabilities.length;

  // Pour chaque disponibilité de l'étudiant
  for (const studentSlot of studentAvailabilities) {
    // Vérifier si une disponibilité du professeur chevauche celle de l'étudiant
    const hasOverlap = teacherAvailabilities.some((teacherSlot) => {
      // D'abord vérifier si c'est le même jour de la semaine
      if (studentSlot.day !== teacherSlot.day) return false;

      // Ensuite vérifier si les horaires se chevauchent
      return checkTimeOverlap(
        studentSlot.heure_debut,
        studentSlot.heure_fin,
        teacherSlot.heure_debut,
        teacherSlot.heure_fin
      );
    });

    if (hasOverlap) matchingSlots++;
  }

  // Calculer le pourcentage de correspondance
  return Math.round((matchingSlots / totalSlots) * 100);
};

/**
 * Vérifie si deux plages horaires se chevauchent ou correspondent
 * @param {String} start1 - Heure de début de la première plage (format HH:MM)
 * @param {String} end1 - Heure de fin de la première plage (format HH:MM)
 * @param {String} start2 - Heure de début de la deuxième plage (format HH:MM)
 * @param {String} end2 - Heure de fin de la deuxième plage (format HH:MM)
 * @returns {Boolean} Vrai si les plages se chevauchent
 */
const checkTimeOverlap = (start1, end1, start2, end2) => {
  // Convertir les heures en minutes pour faciliter la comparaison
  const convertToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1Minutes = convertToMinutes(start1);
  const end1Minutes = convertToMinutes(end1);
  const start2Minutes = convertToMinutes(start2);
  const end2Minutes = convertToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Normalise une chaîne de caractères (minuscules, sans accents)
 * @param {String} str - Chaîne à normaliser
 * @returns {String} Chaîne normalisée
 */
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
