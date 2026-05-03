const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getProjects);
router.post('/', protect, admin, createProject);

module.exports = router;
