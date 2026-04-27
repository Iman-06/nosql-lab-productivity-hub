require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  const hash1 = await bcrypt.hash('123456', 10);
  const hash2 = await bcrypt.hash('123456', 10);
//users
  const u1 = await db.collection('users').insertOne({
    email: 'ali@example.com',
    passwordHash: hash1,
    name: 'Ali Khan',
    createdAt: new Date()
  });

  const u2 = await db.collection('users').insertOne({
    email: 'sara@example.com',
    passwordHash: hash2,
    name: 'Sara Ahmed',
    createdAt: new Date()
  });

  const user1 = u1.insertedId;
  const user2 = u2.insertedId;
//projs
  const p1 = await db.collection('projects').insertOne({
    ownerId: user1,
    name: 'University Work',
    description: 'Assignments and semester tasks',
    archived: false,
    createdAt: new Date()
  });

  const p2 = await db.collection('projects').insertOne({
    ownerId: user1,
    name: 'Fitness Goals',
    archived: false,
    createdAt: new Date()
  });

  const p3 = await db.collection('projects').insertOne({
    ownerId: user2,
    name: 'Office Tasks',
    description: 'Work deadlines and reports',
    archived: false,
    createdAt: new Date()
  });

  const p4 = await db.collection('projects').insertOne({
    ownerId: user2,
    name: 'Travel Plan',
    archived: true,
    createdAt: new Date()
  });
//tasks
  await db.collection('tasks').insertMany([
    {
      ownerId: user1,
      projectId: p1.insertedId,
      title: 'Finish DBMS Lab',
      status: 'todo',
      priority: 5,
      tags: ['lab', 'urgent'],
      subtasks: [
        { title: 'Write queries', done: false },
        { title: 'Take screenshots', done: false }
      ],
      description: 'Need submission before deadline',
      dueDate: new Date('2026-04-30'),
      createdAt: new Date()
    },

    {
      ownerId: user1,
      projectId: p1.insertedId,
      title: 'Prepare Presentation',
      status: 'in-progress',
      priority: 4,
      tags: ['slides'],
      subtasks: [
        { title: 'Research topic', done: true },
        { title: 'Make slides', done: false }
      ],
      createdAt: new Date()
    },

    {
      ownerId: user1,
      projectId: p2.insertedId,
      title: 'Morning Run',
      status: 'done',
      priority: 2,
      tags: ['health'],
      subtasks: [
        { title: 'Stretch first', done: true }
      ],
      createdAt: new Date()
    },

    {
      ownerId: user2,
      projectId: p3.insertedId,
      title: 'Submit Monthly Report',
      status: 'todo',
      priority: 5,
      tags: ['office'],
      subtasks: [
        { title: 'Collect data', done: false }
      ],
      dueDate: new Date('2026-05-02'),
      createdAt: new Date()
    },

    {
      ownerId: user2,
      projectId: p4.insertedId,
      title: 'Book Tickets',
      status: 'in-progress',
      priority: 3,
      tags: ['travel'],
      subtasks: [
        { title: 'Compare prices', done: true }
      ],
      createdAt: new Date()
    }
  ]);
//notes
  await db.collection('notes').insertMany([
    {
      ownerId: user1,
      projectId: p1.insertedId,
      title: 'Lab Reminder',
      body: 'Submit before Friday',
      tags: ['lab'],
      pinned: true,
      createdAt: new Date()
    },

    {
      ownerId: user1,
      title: 'Shopping List',
      body: 'Milk, Bread, Eggs',
      tags: ['personal'],
      createdAt: new Date()
    },

    {
      ownerId: user2,
      projectId: p3.insertedId,
      title: 'Meeting Notes',
      body: 'Need progress update',
      tags: ['office'],
      createdAt: new Date()
    },

    {
      ownerId: user2,
      title: 'Ideas',
      body: 'Try freelancing',
      tags: ['future'],
      createdAt: new Date()
    },

    {
      ownerId: user1,
      projectId: p2.insertedId,
      title: 'Workout Plan',
      body: 'Run + Pushups',
      tags: ['fitness'],
      createdAt: new Date()
    }
  ]);

  console.log('Seed data inserted successfully');
  process.exit(0);
})();