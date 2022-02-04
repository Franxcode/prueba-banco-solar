const url = require('url');
const { request, response } = require('express');
const { insertarUsuario,
        obtenerUsuarios,
        editarUsuario,
        eliminarUsuario } = require('../models/queries');


const usuarioPost = (req = request, res = response) => {

    let body = '';
    
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', async () => {
        const datos = Object.values(JSON.parse(body));
        const respuesta = await insertarUsuario(datos);
        res.status(201).end(JSON.stringify(respuesta));
    });
};


const usuariosGet = async (req = request, res = response) => {
    const respuesta = await obtenerUsuarios();
    res.status(200).end(JSON.stringify(respuesta));
};

const usuarioPut = (req = request, res = response) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', async() => {
        const datos = Object.values(JSON.parse(body));
        const respuesta = await editarUsuario(datos);
        res.status(200).end(JSON.stringify(respuesta));
    });
};

const usuarioDelete = async (req = request, res = response) => {
    const { id } = url.parse(req.url, true).query;
    const respuesta = await eliminarUsuario(id);
    res.status(200).end(JSON.stringify(respuesta));
};

module.exports = {
    usuarioPost,
    usuariosGet,
    usuarioPut,
    usuarioDelete
}