const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// @POST /api/tasks  (Admin only)
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, assignedTo, status, dueDate, project } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      assignedTo,
      status: status || 'todo',
      dueDate,
      project,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'project', select: 'name' },
      { path: 'createdBy', select: 'name' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    if (req.query.project) filter.project = req.query.project;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'member' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only update your own tasks' });
    }

    const { status, title, description, dueDate, assignedTo } = req.body;

    if (status) {
      if (req.user.role === 'member' && status === 'done') {
        return res.status(403).json({ message: 'Only an admin can mark a task as done' });
      }
      task.status = status;
    }

    if (req.user.role === 'admin') {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo) task.assignedTo = assignedTo;
    }

    await task.save();
    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTaskStatus, deleteTask };
