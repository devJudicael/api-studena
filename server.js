import express from "express";
const app = express();
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/db.js";

// configuration de dotenv
config();

// connexion à mongoDB
connectDB();

// Configurer CORS pour permettre toutes les origines
app.use(cors());

//importer les routes
import studentRoutes from "./routes/studentRoute.js";
import teacherRoutes from "./routes/teacherRoute.js";
import matchingRoutes from "./routes/matchingRoute.js";

// rendre le json accessible dans req.body
app.use(express.json());

// utilisation des routes
app.use("/api", studentRoutes);
app.use("/api", teacherRoutes);
app.use("/api", matchingRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
