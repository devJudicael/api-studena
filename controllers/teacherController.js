import xlsx from "xlsx";
import Teacher from "../models/teacherModel.js";

// Contrôleur pour importer les enseignants
export const uploadTeachersExcel = async (req, res) => {
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
      "Matière(s) enseignée(s)",
      "Niveaux enseignés",
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
    const teachers = jsonData.map((row) => {
      // Nom complet
      const fullName = row["Nom complet"]?.trim();

      // Matières séparées par virgules
      const subjectsTaught = row["Matière(s) enseignée(s)"]
        ? row["Matière(s) enseignée(s)"].split(",").map((s) => s.trim())
        : [];

      // Niveaux enseignés séparés par virgules
      const levels = row["Niveaux enseignés"]
        ? row["Niveaux enseignés"].split(",").map((l) => l.trim())
        : [];

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
        subjectsTaught,
        levels,
        availabilities,
      };
    });

    // Insertion en DB
    await Teacher.insertMany(teachers);

    res.json({
      success: true,
      message: "Import des enseignants réussi",
      imported: teachers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'import des enseignants",
    });
  }
};

// lister les enseignants
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();

    res.json({
      success: true,
      message: "Liste des enseignants récupérée avec succès",
      teachers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des enseignants",
    });
  }
};

// supprimer tous les enseignants
export const deleteAllTeachers = async (req, res) => {
  try {
    await Teacher.deleteMany({});
    res.json({
      success: true,
      message: "Tous les enseignants ont été supprimés avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression des enseignants",
    });
  }
};