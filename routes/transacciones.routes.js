const { Router } = require('express');
const router = Router();

const { transferenciaPost, transferenciasGet } = require('../controllers/transacciones.controller');


router.post('/transferencia', transferenciaPost);

router.get('/transferencias', transferenciasGet);

module.exports = router;