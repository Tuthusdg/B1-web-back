const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 2506;

app.use(express.json());

// 🔹 Configuration CORS pour éviter les blocages du navigateur
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔹 Servir les fichiers statiques du dossier `img/`
app.use('/img', express.static(path.join(__dirname, 'img')));

const db = new sqlite3.Database('films.db');

// 🔍 Route GET avec filtres
app.get('/films', (req, res) => {
    const { origine, niveau, noteMin, noteMax } = req.query;
    let query = `SELECT * FROM films WHERE 1=1`;
    let params = [];

    if (origine && origine !== 'all') {
        query += ` AND origine = ?`;
        params.push(origine);
    }

    if (niveau === 'classics') query += ` AND note >= 4.2`;
    if (niveau === 'navets') query += ` AND notePublic < 3.2`;

    if (noteMin) {
        query += ` AND note >= ?`;
        params.push(noteMin);
    }

    if (noteMax) {
        query += ` AND note <= ?`;
        params.push(noteMax);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send('Erreur SQL');

        // 🔹 On ne modifie PAS `lienImage`, car il est déjà correct dans la base
        res.json(rows);
    });
});

// 🚮 Route DELETE pour supprimer un film par ID
app.delete('/films/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM films WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error("Erreur suppression:", err.message);
            return res.status(500).json({ error: "Erreur lors de la suppression" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Film non trouvé" });
        }

        res.json({ message: "Film supprimé avec succès" });
    });
});



// 📌 Route POST pour ajouter un film
app.post('/films', (req, res) => {
    const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine } = req.body;

    if (!nom || !realisateur || !compagnie || !dateDeSortie || !note || !notePublic || !description || !lienImage || !origine) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const query = `INSERT INTO films (nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine];

    db.run(query, params, function(err) {
        if (err) {
            console.error("Erreur insertion:", err.message);
            return res.status(500).json({ error: "Erreur lors de l'ajout du film" });
        }

        res.json({ message: "Film ajouté avec succès", id: this.lastID });
    });
});

app.put('/films/:id', (req, res) => {
    const { id } = req.params;
    const { nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !realisateur || !compagnie || !dateDeSortie || !note || !notePublic || !description || !lienImage || !origine) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const query = `UPDATE films SET nom = ?, realisateur = ?, compagnie = ?, dateDeSortie = ?, note = ?, notePublic = ?, description = ?, lienImage = ?, origine = ? WHERE id = ?`;
    const params = [nom, realisateur, compagnie, dateDeSortie, note, notePublic, description, lienImage, origine, id];

    db.run(query, params, function(err) {
        if (err) {
            console.error("Erreur modification :", err.message);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du film" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Film non trouvé" });
        }

        res.json({ message: "Film mis à jour avec succès" });
    });
});


app.listen(port, () => console.log(`🎬 Serveur lancé sur http://localhost:${port}`));
