const { request, response } = require('express');
const { realizarTransferencia, 
        obtenerTransferencias } = require('../models/queries');

const transferenciaPost = (req = request, res = response) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', async() => {
        const datos = Object.values(JSON.parse(body));
        const respuesta = await realizarTransferencia(datos);
        res.status(201).end(JSON.stringify(respuesta));
    });
};

const transferenciasGet = async(req = request, res = response) => {
    const respuesta = await obtenerTransferencias();
    res.status(200).end(JSON.stringify(respuesta));
};

module.exports = {
    transferenciaPost,
    transferenciasGet
}