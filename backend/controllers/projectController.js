const Project = require('../models/Project');

const createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({ name, description, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects };
