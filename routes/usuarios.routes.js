const { Router } = require('express');
const router = Router();

const { usuarioPost, usuariosGet, usuarioPut, usuarioDelete } = require('../controllers/usuarios.controller');

router.post('/usuario', usuarioPost);
router.get('/usuarios', usuariosGet);
router.put('/usuario', usuarioPut);
router.delete('/usuario', usuarioDelete);

module.exports = router;