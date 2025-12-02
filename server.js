import fs from "fs";
import express from "express";
import nodemon from "nodemon";

const app = express();
//const PORT = 3000;
let data;

app.use(express.static("public"));
app.use(express.json());

app.post('/save', (req, res) => {
    data = req.body;
    const datastring = JSON.stringify(data, null, 2);
    fs.writeFile('./public/media/data.json', datastring, (err) => {
        if (err) {
            console.error("Eroare la scrierea fișierului:", err);
            return res.status(500).json({ succes: false, error: "Nu s-a putut salva" });
        }

        res.json({ succes: true, saved: data });
    });

});

//app.listen(PORT);
export default app;