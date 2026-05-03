const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, admin, createTask);
router.patch('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, admin, deleteTask);

module.exports = router;
