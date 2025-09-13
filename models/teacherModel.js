import { Schema, model } from "mongoose";

const teacherSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectsTaught: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Au moins une matière doit être renseignée",
      },
    },
    levels: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Au moins un niveau doit être renseigné",
      },
    },
    availabilities: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
        },
        heure_debut: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,  // Format HH:MM (00:00 à 23:59)
        },
        heure_fin: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,  // Format HH:MM (00:00 à 23:59)
        },
      },
    ],
  },
  { timestamps: true }
);

const Teacher = model("Teacher", teacherSchema);
export default Teacher;
