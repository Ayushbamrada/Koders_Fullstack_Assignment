const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// ================= GET TASKS =================
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { deletedAt: null };

    if (req.user.role === 'user') {
      query.assignee = req.user._id;
    }

    if (req.user.role === 'manager') {
      query.$or = [
        { createdBy: req.user._id },
        { assignee: req.user._id }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('GET TASK ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= CREATE TASK =================
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, priority, status, assignee } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let assigneeId = null;

    if (assignee) {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({ message: 'Invalid assignee ID' });
      }

      const foundUser = await User.findById(assignee);
      if (!foundUser) {
        return res.status(400).json({ message: 'Assignee not found' });
      }

      assigneeId = foundUser._id;
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'todo',
      assignee: assigneeId,
      createdBy: req.user._id
    });

    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);

  } catch (error) {
    console.error('CREATE TASK ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE TASK =================
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user') {
      if (task.assignee?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not allowed' });
      }
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        task[key] = req.body[key];
      }
    });

    await task.save();

    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);

  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE TASK =================
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Users cannot delete tasks' });
    }

    await task.softDelete();

    res.json({ message: 'Deleted successfully' });

  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;