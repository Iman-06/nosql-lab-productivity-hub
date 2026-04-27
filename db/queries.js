const { ObjectId } = require('mongodb');
async function signupUser(db, userData) {
  const result = await db.collection('users').insertOne({
    email: userData.email,
    passwordHash: userData.passwordHash,
    name: userData.name,
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
}
async function loginFindUser(db, email) {
  return await db.collection('users').findOne({ email });
}
async function listUserProjects(db, ownerId) {
  return await db.collection('projects')
    .find({
      ownerId: ownerId,
      archived: false
    })
    .sort({ createdAt: -1 }).toArray();
}
async function createProject(db, projectData) {
  const result = await db.collection('projects').insertOne({
    ownerId: projectData.ownerId,
    name: projectData.name,
    description: projectData.description,
    archived: false,
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
}
async function archiveProject(db, projectId) {
  const result = await db.collection('projects').updateOne(
    { _id: projectId },
    {
      $set: {
        archived: true
      }
    }
  );
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
async function listProjectTasks(db, projectId, status) {
  const filter = { projectId: projectId };
  if (status) {
    filter.status = status;
  }
  return await db.collection('tasks')
    .find(filter).sort({
      priority: -1,
      createdAt: -1
    }).toArray();
}
async function createTask(db, taskData) {
  const result = await db.collection('tasks').insertOne({
    ownerId: taskData.ownerId,
    projectId: taskData.projectId,
    title: taskData.title,
    priority: taskData.priority || 1,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    status: "todo",
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
}
/**
 * Query 8: updateTaskStatus
 * -------------------------------------------------------------
 * Change a task's status field.
 *
 * @param {Db} db
 * @param {ObjectId} taskId
 * @param {string} newStatus  — "todo" | "in-progress" | "done"
 * @returns {Promise<{ matchedCount: number, modifiedCount: number }>}
 *
 * Hint: updateOne + $set.
 */
async function updateTaskStatus(db, taskId, newStatus) {
  // TODO: implement
  throw new Error('updateTaskStatus not implemented');
}

/**
 * Query 9: addTaskTag
 * -------------------------------------------------------------
 * Append a tag to a task's tags array, BUT only if it isn't already present.
 *
 * @param {Db} db
 * @param {ObjectId} taskId
 * @param {string} tag
 * @returns {Promise<{ matchedCount: number, modifiedCount: number }>}
 *
 * Expected behaviour:
 *   - If tag is new → modifiedCount = 1, tags array gains the new entry
 *   - If tag is already present → modifiedCount = 0 (no duplicate added)
 *
 * Hint: which array operator silently skips duplicates? It is NOT $push.
 */
async function addTaskTag(db, taskId, tag) {
  // TODO: implement
  throw new Error('addTaskTag not implemented');
}

/**
 * Query 10: removeTaskTag
 * -------------------------------------------------------------
 * Remove a tag from a task's tags array.
 *
 * @param {Db} db
 * @param {ObjectId} taskId
 * @param {string} tag
 * @returns {Promise<{ matchedCount: number, modifiedCount: number }>}
 *
 * Expected behaviour:
 *   - If tag was present → modifiedCount = 1
 *   - If tag wasn't present → modifiedCount = 0
 *
 * Hint: $pull.
 */
async function removeTaskTag(db, taskId, tag) {
  // TODO: implement
  throw new Error('removeTaskTag not implemented');
}

/**
 * Query 11: toggleSubtask
 * -------------------------------------------------------------
 * Inside a task's `subtasks` array, find the subtask whose title
 * matches `subtaskTitle` and flip its `done` field to `newDone`.
 *
 * @param {Db} db
 * @param {ObjectId} taskId
 * @param {string} subtaskTitle
 * @param {boolean} newDone
 * @returns {Promise<{ matchedCount: number, modifiedCount: number }>}
 *
 * Example: a task has subtasks: [
 *   { title: "Draft outline", done: false },
 *   { title: "Write intro",  done: false }
 * ]
 * Calling toggleSubtask(db, taskId, "Write intro", true) should produce:
 *   [
 *     { title: "Draft outline", done: false },
 *     { title: "Write intro",  done: true  }
 *   ]
 *
 * Hint: this is the POSITIONAL OPERATOR scenario. Your filter must
 *       reference the subtask by title (so Mongo knows which array element
 *       matched), and your $set path uses `subtasks.$.done`.
 */
async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  // TODO: implement
  throw new Error('toggleSubtask not implemented');
}

/**
 * Query 12: deleteTask
 * -------------------------------------------------------------
 * Permanently delete a task.
 *
 * @param {Db} db
 * @param {ObjectId} taskId
 * @returns {Promise<{ deletedCount: number }>}
 *
 * Hint: deleteOne.
 */
async function deleteTask(db, taskId) {
  // TODO: implement
  throw new Error('deleteTask not implemented');
}

/**
 * Query 13: searchNotes
 * -------------------------------------------------------------
 * Find notes belonging to a user that match ANY of the given tags.
 * Optionally restrict to one project.
 *
 * @param {Db} db
 * @param {ObjectId} ownerId
 * @param {string[]} tags        — match notes whose tags array contains
 *                                 at least one of these
 * @param {ObjectId} [projectId] — optional. If given, restrict to this project.
 * @returns {Promise<Array<Object>>}
 *
 * Expected output: array of note documents matching the filter,
 *                  sorted by createdAt descending.
 *
 * Hint: the operator that says "field's value is one of these" is $in.
 *       Build the filter conditionally based on whether projectId was passed.
 */
async function searchNotes(db, ownerId, tags, projectId) {
  // TODO: implement
  throw new Error('searchNotes not implemented');
}
async function projectTaskSummary(db, ownerId) {
  return await db.collection('tasks').aggregate([
    {
      $match: {
        ownerId: ownerId
      }
    },
    {
      $group: {
        _id: "$projectId",
        todo: {
          $sum: {
            $cond: [
              { $eq: ["$status", "todo"] },
              1, //if status is todo add 1 else 0
              0
            ]
          }
        },
        inProgress: {
          $sum: {
            $cond: [
              { $eq: ["$status", "in-progress"] },
              1,
              0
            ]
          }
        },

        done: {
          $sum: {
            $cond: [
              { $eq: ["$status", "done"] },
              1,
              0
            ]
          }
        },

        total: { $sum: 1 } // each task contributes 1 
      }
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project"
      }
    },
    {
      $unwind: "$project"
    },
    {
      $project: {
        _id: 1,
        projectName: "$project.name",
        todo: 1,
        inProgress: 1,
        done: 1,
        total: 1
      }
    }
  ]).toArray();
}
async function recentActivityFeed(db, ownerId) {
  return await db.collection('tasks').aggregate([
    {
      $match: {
        ownerId: ownerId
      }
    },

    {
      $sort: {
        createdAt: -1 //newest first
      }
    },

    {
      $limit: 10
    },

    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project"
      }
    },

    {
      $unwind: "$project"
    },

    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        priority: 1,
        createdAt: 1,
        projectId: 1,
        projectName: "$project.name"
      }
    }
  ]).toArray();
}
// =============================================================================
//  EXPORTS — do not edit
// =============================================================================
module.exports = {
  signupUser,
  loginFindUser,
  listUserProjects,
  createProject,
  archiveProject,
  listProjectTasks,
  createTask,
  updateTaskStatus,
  addTaskTag,
  removeTaskTag,
  toggleSubtask,
  deleteTask,
  searchNotes,
  projectTaskSummary,
  recentActivityFeed
};

async function loginFindUser(db, email) {
  return await db.collection('users').findOne({ email });
}

async function listUserProjects(db, ownerId) {
  return await db.collection('projects')
    .find({ ownerId, archived: false })
    .sort({ createdAt: -1 })
    .toArray();
}

async function createProject(db, projectData) {
  const result = await db.collection('projects').insertOne({
    ...projectData,
    archived: false,
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
}

async function archiveProject(db, projectId) {
  const result = await db.collection('projects').updateOne(
    { _id: projectId },
    { $set: { archived: true } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}

async function listProjectTasks(db, projectId, status) {
  const filter = { projectId };

  if (status) {
    filter.status = status;
  }

  return await db.collection('tasks')
    .find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .toArray();
}

async function createTask(db, taskData) {
  const result = await db.collection('tasks').insertOne({
    ...taskData,
    priority: taskData.priority || 1,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    status: 'todo',
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
}

async function updateTaskStatus(db, taskId, newStatus) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $set: { status: newStatus } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}

async function addTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $addToSet: { tags: tag } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}

async function removeTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $pull: { tags: tag } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}

async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId, "subtasks.title": subtaskTitle },
    { $set: { "subtasks.$.done": newDone } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}

async function deleteTask(db, taskId) {
  const result = await db.collection('tasks').deleteOne({ _id: taskId });

  return { deletedCount: result.deletedCount };
}

async function searchNotes(db, ownerId, tags, projectId) {
  const filter = {
    ownerId,
    tags: { $in: tags }
  };

  if (projectId) {
    filter.projectId = projectId;
  }

  return await db.collection('notes')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

async function projectTaskSummary(db, ownerId) {
  return await db.collection('tasks').aggregate([
    { $match: { ownerId } },

    {
      $group: {
        _id: "$projectId",
        todo: {
          $sum: {
            $cond: [{ $eq: ["$status", "todo"] }, 1, 0]
          }
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0]
          }
        },
        done: {
          $sum: {
            $cond: [{ $eq: ["$status", "done"] }, 1, 0]
          }
        },
        total: { $sum: 1 }
      }
    },

    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project"
      }
    },

    { $unwind: "$project" },

    {
      $project: {
        _id: 1,
        projectName: "$project.name",
        todo: 1,
        inProgress: 1,
        done: 1,
        total: 1
      }
    }
  ]).toArray();
}

async function recentActivityFeed(db, ownerId) {
  return await db.collection('tasks').aggregate([
    { $match: { ownerId } },

    { $sort: { createdAt: -1 } },

    { $limit: 10 },

    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project"
      }
    },

    { $unwind: "$project" },

    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        priority: 1,
        createdAt: 1,
        projectId: 1,
        projectName: "$project.name"
      }
    }
  ]).toArray();
}

module.exports = {
  signupUser,
  loginFindUser,
  listUserProjects,
  createProject,
  archiveProject,
  listProjectTasks,
  createTask,
  updateTaskStatus,
  addTaskTag,
  removeTaskTag,
  toggleSubtask,
  deleteTask,
  searchNotes,
  projectTaskSummary,
  recentActivityFeed
};