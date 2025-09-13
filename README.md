# API Studena

## Description

API Studena est une API RESTful conçu pour gérer le matching entre étudiants et professeurs en fonction de leurs matires, niveaux scolaires et disponibilités. L'API permet d'importer des données d'étudiants et de professeurs via des fichiers Excel, de les gérer, et de trouver les meilleurs match entre eux

## Structure du Projet

```
├── configs/
│   └── db.js                  # Configuration de la connexion à MongoDB
├── controllers/
│   ├── matchingController.js  # Logique de matching entre étudiants et professeurs
│   ├── studentController.js   # Gestion des étudiants
│   └── teacherController.js   # Gestion des professeurs
├── models/
│   ├── studentModel.js        # Modèle de données pour les étudiants
│   └── teacherModel.js        # Modèle de données pour les professeurs
├── routes/
│   ├── matchingRoute.js       # Routes pour le matching
│   ├── studentRoute.js        # Routes pour les étudiants
│   └── teacherRoute.js        # Routes pour les professeurs
├── uploads/                   # Dossier temporaire pour les fichiers importés
├── .env                       # Variables d'environnement
└── server.js                  # Point d'entrée de l'application
```

## Modèles de Données

### Étudiant (Student)

```javascript
{
  fullName: String,           // Nom complet de l'étudiant
  subjects: [String],         // Matières demandées
  schoolLevel: String,        // Niveau scolaire
  availabilities: [           // Disponibilités hebdomadaires
    {
      day: String,           // Jour de la semaine (Lundi, Mardi, etc.)
      heure_debut: String,    // Heure de début (format HH:MM)
      heure_fin: String       // Heure de fin (format HH:MM)
    }
  ]
}
```

### Professeur (Teacher)

```javascript
{
  fullName: String,           // Nom complet du professeur
  subjectsTaught: [String],   // Matières enseignées
  levels: [String],           // Niveaux enseignés
  availabilities: [           // Disponibilités hebdomadaires
    {
      day: String,           // Jour de la semaine (Lundi, Mardi, etc.)
      heure_debut: String,    // Heure de début (format HH:MM)
      heure_fin: String       // Heure de fin (format HH:MM)
    }
  ]
}
```

## Documentation de l'API

### Étudiants

#### Importer des étudiants depuis un fichier Excel

- **URL**: `/api/upload-students-excel`
- **Méthode**: `POST`
- **Type de contenu**: `multipart/form-data`
- **Paramètres**:
  - `file`: Fichier Excel contenant les données des étudiants
- **Format du fichier Excel**:
  - Colonnes requises: "Nom complet", "Matière(s) demandée(s)", "Niveau scolaire", "Disponibilités"
  - Format des disponibilités: "Jour de 00:00 à 00:00" (ex: "Lundi de 18:00 à 20:00")
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Import des élèves réussi",
    "imported": 10
  }
  ```
- **Réponse d'erreur**:
  ```json
  {
    "success": false,
    "error": "Message d'erreur"
  }
  ```

#### Récupérer tous les étudiants

- **URL**: `/api/students`
- **Méthode**: `GET`
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Liste des étudiants récupérée avec succès",
    "students": [...]
  }
  ```

#### Supprimer tous les étudiants

- **URL**: `/api/students`
- **Méthode**: `DELETE`
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Tous les étudiants ont été supprimés avec succès"
  }
  ```

### Professeurs

#### Importer des professeurs depuis un fichier Excel

- **URL**: `/api/upload-teachers-excel`
- **Méthode**: `POST`
- **Type de contenu**: `multipart/form-data`
- **Paramètres**:
  - `file`: Fichier Excel contenant les données des professeurs
- **Format du fichier Excel**:
  - Colonnes requises: "Nom complet", "Matière(s) enseignée(s)", "Niveaux enseignés", "Disponibilités"
  - Format des disponibilités: "Jour de 00:00 à 00:00" (ex: "Lundi de 18:00 à 20:00")
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Import des professeurs réussi",
    "imported": 5
  }
  ```

#### Récupérer tous les professeurs

- **URL**: `/api/teachers`
- **Méthode**: `GET`
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Liste des professeurs récupérée avec succès",
    "teachers": [...]
  }
  ```

#### Supprimer tous les professeurs

- **URL**: `/api/teachers`
- **Méthode**: `DELETE`
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "message": "Tous les professeurs ont été supprimés avec succès"
  }
  ```

### Matching

#### Trouver les professeurs correspondant à un étudiant

- **URL**: `/api/matching/students/:studentId`
- **Méthode**: `GET`
- **Paramètres URL**:
  - `studentId`: ID de l'étudiant
- **Réponse réussie**:
  ```json
  {
    "success": true,
    "student": {
      "_id": "...",
      "fullName": "Nom de l'étudiant",
      "subjects": ["Mathématiques", "Physique"],
      "schoolLevel": "Terminale"
    },
    "matches": [
      {
        "teacher": {
          "_id": "...",
          "fullName": "Nom du professeur",
          "subjectsTaught": ["Mathématiques", "Physique"],
          "levels": ["Terminale", "Première"]
        },
        "matchingScore": 85,
        "details": {
          "subjectScore": 100,
          "levelScore": 100,
          "availabilityScore": 60
        }
      }
      // Autres professeurs correspondants...
    ]
  }
  ```

## Algorithme de Matching

L'algorithme de matching calcule un score de correspondance entre un étudiant et chaque professeur en fonction de trois critères:

1. **Matières (30% du score total)**:

   - Pourcentage des matières demandées par l'étudiant qui sont enseignées par le professeur

2. **Niveau scolaire (30% du score total)**:

   - 100% si le professeur enseigne au niveau de l'étudiant, 0% sinon

3. **Disponibilités (40% du score total)**:
   - Pourcentage des créneaux de disponibilité de l'étudiant qui correspondent à ceux du professeur
   - Les créneaux correspondent s'ils sont le même jour de la semaine et si les horaires se chevauchent

Le score total est calculé comme suit:

```
Score total = (Score matières × 0.3) + (Score niveau × 0.3) + (Score disponibilités × 0.4)
```

## Installation et Démarrage

1. Cloner le dépôt
2. Installer les dépendances: `npm install`
3. Créer un fichier `.env` avec les variables suivantes:
   ```
   PORT=5000
   MONGO_URI=votre_uri_mongodb
   ```
4. Démarrer le serveur: `npm start`

## Exemples d'Utilisation

### Importer des étudiants

```bash
curl -X POST -F "file=@etudiants.xlsx" http://localhost:5000/api/upload-students-excel
```

### Importer des professeurs

```bash
curl -X POST -F "file=@professeurs.xlsx" http://localhost:5000/api/upload-teachers-excel
```

### Trouver des professeurs correspondant à un étudiant

```bash
curl http://localhost:5000/api/matching/students/60d5ec9af682d123e4567890
```

## Format des Fichiers Excel

### Fichier d'étudiants

| Nom complet | Matière(s) demandée(s)  | Niveau scolaire | Disponibilités                                    |
| ----------- | ----------------------- | --------------- | ------------------------------------------------- |
| Jean Dupont | Mathématiques, Physique | Terminale       | Lundi de 18:00 à 20:00; Mercredi de 14:00 à 16:00 |

### Fichier de professeurs

| Nom complet  | Matière(s) enseignée(s) | Niveaux enseignés   | Disponibilités                                 |
| ------------ | ----------------------- | ------------------- | ---------------------------------------------- |
| Marie Martin | Mathématiques, SVT      | Terminale, Première | Lundi de 17:00 à 21:00; Jeudi de 18:00 à 20:00 |
