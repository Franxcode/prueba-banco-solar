const { Pool } = require('pg');
const moment = require('moment');

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'bancosolar',
    password: '0000',
    port: 5432,
    idleTimeoutMillis: 0,
};

const pool = new Pool( config );

const insertarUsuario = async(datos) => {
    const query = {
        text: "INSERT INTO usuarios (nombre, balance) values ($1, $2) RETURNING*",
        values: datos
    }
    try {
        const client = await pool.connect();
        const res = await client.query(query);
        client.release();
        return res;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const obtenerUsuarios = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT * FROM usuarios ORDER BY nombre");
        client.release();
        return res.rows;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const editarUsuario = async (datos) => {

    const query = {
        text: 'UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING*',
        values: datos
    };

    try {
        const client = await pool.connect();
        const res = await client.query(query);
        client.release();
        return res;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const eliminarUsuario = async (id) => {

    try {
        const client = await pool.connect();
        await client.query(`DELETE FROM transferencias WHERE emisor = ${id} OR receptor = ${id} RETURNING*`);
        const res = await client.query(`DELETE FROM usuarios WHERE id = ${id} RETURNING*`);
        client.release();
        return res;
    } catch (error) {
        console.log(error.code);
        return error;
    }
};

const realizarTransferencia = async(datos = []) => {

    const [, , monto] = datos;
    let datosTransferencia = [];

    const queryDescontar = {
        text: "UPDATE usuarios SET balance = balance - $2 WHERE nombre = $1 RETURNING*",
        values: [datos[0], datos[2]]
    };
    const queryAcreditar = {
        text: "UPDATE usuarios SET balance = balance + $2 WHERE nombre = $1 RETURNING*",
        values: [datos[1], datos[2]]
    };
    
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const descontar = await client.query(queryDescontar);
        const emisorID = descontar.rows[0].id;

        const acreditar = await client.query(queryAcreditar);
        const receptorID = acreditar.rows[0].id;

        await client.query("COMMIT");

        datosTransferencia.push(emisorID, receptorID, monto, moment().format('L') + ' ' + moment().format('LT'));

        const queryInsertarTransaccion = {
            text: `INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING*`,
            values: datosTransferencia
        };

        const resultadoTransaccion = await client.query(queryInsertarTransaccion);
        client.release();
        return resultadoTransaccion;

    } catch (error) {
        await client.query("ROLLBACK");
        console.log("Codigo de error:", error.code);
        console.log("Detalle del error:", error.code);
        console.log("Tabla donde se produjo el error:", error.code);
        console.log("Restriccion violada en el campo:", error.code);
        return error;
    }
};

const obtenerTransferencias = async() => {

    
    const client = await pool.connect();
    let tablaTransferencias = [];
    
    try {
        await client.query("BEGIN");
        const res = await client.query("SELECT * FROM transferencias ORDER BY fecha DESC LIMIT 5");

        const resultado = await Promise.all(res.rows.map(async(e) => {
            const emisorRes = await client.query(`SELECT * FROM usuarios WHERE id = ${e.emisor} ORDER BY nombre`);
            const receptorRes = await client.query(`SELECT * FROM usuarios WHERE id = ${e.receptor} ORDER BY nombre`);
            emisorRes.rows.map(em=> {
                receptorRes.rows.map(rec=>{
                    tablaTransferencias.push({
                        nombreEm: em.nombre,
                        nombreRec: rec.nombre,
                        monto: e.monto,
                        fecha: e.fecha
                    });
                });
            });
            return tablaTransferencias;
        }));
        
        await client.query("COMMIT");
        client.release();
        return resultado[0];

    } catch (error) {
        await client.query("ROLLBACK");
        console.log(error.code);
        return error;
    }
};

module.exports = {
    insertarUsuario,
    obtenerUsuarios,
    editarUsuario,
    eliminarUsuario,
    realizarTransferencia,
    obtenerTransferencias
}