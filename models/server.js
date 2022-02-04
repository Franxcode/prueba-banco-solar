const path = require('path');
require('dotenv').config();
const express = require('express');

class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.middlewares();
        this.routes()
    }
    middlewares(){

    // Directorio publico.
    this.app.use( express.static('public') );

    }
    routes(){

        this.app.use('/', require('../routes/usuarios.routes'));
        this.app.use('/', require('../routes/transacciones.routes'));

        this.app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../public", "404.html"));
        });
    }
    listen(){
        this.app.listen(this.port, () => console.log(`Server up and running at ${this.port}`));
    }
};
module.exports = Server;