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
async function updateTaskStatus(db, taskId, newStatus) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $set: {
        status: newStatus
      }
    }
  );
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
async function addTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $addToSet: { //add if not already present
        tags: tag
      }
    }
  );
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
async function removeTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $pull: {
        tags: tag
      }
    }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  const result = await db.collection('tasks').updateOne(
    {
      _id: taskId,
      "subtasks.title": subtaskTitle
    },
    {
      $set: {
        "subtasks.$.done": newDone
      }
    }
  );
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
async function deleteTask(db, taskId) {
  const result = await db.collection('tasks').deleteOne({
    _id: taskId
  });
  return {
    deletedCount: result.deletedCount
  };
}
async function searchNotes(db, ownerId, tags, projectId) {
  const filter = {
    ownerId: ownerId,
    tags: { $in: tags }
  };
  if (projectId) {
    filter.projectId = projectId;
  }
  return await db.collection('notes')
    .find(filter).sort({ createdAt: -1 }).toArray();
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