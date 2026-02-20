const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // ✅ This automatically manages createdAt & updatedAt
  }
);

// Soft delete WITHOUT triggering save hooks
taskSchema.methods.softDelete = async function () {
  return await this.constructor.updateOne(
    { _id: this._id },
    { $set: { deletedAt: new Date() } }
  );
};

// Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Task', taskSchema);