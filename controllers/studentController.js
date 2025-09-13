import xlsx from "xlsx";
import Student from "../models/studentModel.js";

// Contrôleur pour importer les etudiants
export const uploadStudentsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Aucun fichier fourni" });
    }

    // Vérifie extension
    if (!req.file.originalname.match(/\.(xls|xlsx)$/)) {
      return res.status(400).json({
        success: false,
        error: "Format invalide. Seuls les fichiers Excel sont acceptés.",
      });
    }

    // Lecture du fichier Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    if (!jsonData || jsonData.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Le fichier est vide" });
    }

    // Vérifie que les colonnes sont correctes
    const expectedHeaders = [
      "Nom complet",
      "Matière(s) demandée(s)",
      "Niveau scolaire",
      "Disponibilités",
    ];
    const fileHeaders = Object.keys(jsonData[0]);

    const missingHeaders = expectedHeaders.filter(
      (h) => !fileHeaders.includes(h)
    );
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Colonnes manquantes : ${missingHeaders.join(", ")}`,
      });
    }

    // Transformer les données pour respecter le schéma Mongoose
    const students = jsonData.map((row) => {
      // Nom complet
      const fullName = row["Nom complet"]?.trim();

      // Matières séparées par virgules
      const subjects = row["Matière(s) demandée(s)"]
        ? row["Matière(s) demandée(s)"].split(",").map((s) => s.trim())
        : [];

      // Niveau scolaire
      const schoolLevel = row["Niveau scolaire"]?.trim();
      // const schoolLevel = row["Niveau scolaire"]
      //   ? row["Niveau scolaire"].split(",").map((sl) => sl.trim())
      //   : [];

      // Disponibilités séparées par ";"
      const availabilitiesRaw = row["Disponibilités"]
        ? row["Disponibilités"].split(";").map((d) => d.trim())
        : [];

      const availabilities = availabilitiesRaw
        .map((slot) => {
          // Exemple : "Lundi de 18:00 à 20:00"
          const regex = /(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s+de\s+(\d{2}:\d{2})\s+à\s+(\d{2}:\d{2})/i;
          const match = slot.match(regex);

          if (!match) return null;

          const [_, day, heure_debut, heure_fin] = match;
          
          // Normaliser le jour avec première lettre en majuscule et le reste en minuscule
          const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

          return { 
            day: normalizedDay, 
            heure_debut, 
            heure_fin 
          };
        })
        .filter(Boolean); // supprime les null si parsing échoue

      return {
        fullName,
        subjects,
        schoolLevel,
        availabilities,
      };
    });

    // Insertion en DB
    await Student.insertMany(students);

    res.json({
      success: true,
      message: "Import des élèves réussi",
      imported: students.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'import des élèves",
    });
  }
};

// lister les etudiants
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();

    res.json({
      success: true,
      message: "Liste des étudiants récupérée avec succès",
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des élèves",
    });
  }
};

// supprimer tous les etudiants

export const deleteAllStudents = async (req, res) => {
  try {
    await Student.deleteMany({});
    res.json({
      success: true,
      message: "Tous les étudiants ont été supprimés avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression des étudiants",
    });
  }
};
