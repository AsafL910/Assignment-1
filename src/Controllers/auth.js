const express = require("express");
const router = express.Router();

router.post('/register', async (req, res, next) => {
    console.log('register');
    res.status(400).send({
      'status': 'fail',
      'message': 'not implemented'
    });
  });

router.post('/login', async (req, res, next) => {
    console.log('login');
    res.status(400).send({
      'status': 'fail',
      'message': 'not implemented'
    });
  });

router.post('/logout', async (req, res, next) => {
    console.log('logout');
    res.status(400).send({
      'status': 'fail',
      'message': 'not implemented'
    });
  });

module.exports = router;