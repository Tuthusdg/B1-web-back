const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Read JSON data
const filePath = path.join(__dirname, 'film.json');
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Initialize database
const db = new sqlite3.Database('films.db');

db.serialize(() => {
    // Create table
    db.run(`CREATE TABLE IF NOT EXISTS films (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        dateDeSortie TEXT,
        realisateur TEXT,
        note REAL,
        notePublic REAL,
        compagnie TEXT,
        description TEXT,
        origine TEXT,
        lienImage TEXT
    )`);

    // Insert data
    const stmt = db.prepare(`INSERT INTO films (
        nom, dateDeSortie, realisateur, note, notePublic, compagnie, description, origine, lienImage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    jsonData.forEach(film => {
        stmt.run(
            film.nom,
            film.dateDeSortie,
            film.realisateur,
            film.note,
            film.notePublic,
            film.compagnie,
            film.description,
            film.origine,
            film.lienImage
        );
    });

    stmt.finalize();
});

db.close();