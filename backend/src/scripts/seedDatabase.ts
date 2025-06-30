import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Document from "../models/Document";

dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Document.deleteMany({});

    console.log("Cleared existing data");

    const users = [
      {
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password: "password123",
      },
      {
        username: "admin_user",
        email: "admin@example.com",
        password: "admin123",
      },
    ];

    const createdUsers = await User.create(users);
    console.log("Created sample users");

    const documents = [
      {
        title: "Welcome to Knowledge Base",
        content: `<h1>Welcome to Our Knowledge Base Platform</h1>
        <p>This is a sample document to demonstrate the features of our knowledge base platform.</p>
        <h2>Features</h2>
        <ul>
          <li>Rich text editing</li>
          <li>Document sharing</li>
          <li>User mentions with @username</li>
          <li>Version control</li>
          <li>Search functionality</li>
        </ul>
        <p>Feel free to explore and create your own documents!</p>`,
        author: createdUsers[0]._id,
        lastModifiedBy: createdUsers[0]._id,
        visibility: "public",
        versionHistory: [
          {
            version: 1,
            content: `<h1>Welcome to Our Knowledge Base Platform</h1>
          <p>This is a sample document to demonstrate the features of our knowledge base platform.</p>
          <h2>Features</h2>
          <ul>
            <li>Rich text editing</li>
            <li>Document sharing</li>
            <li>User mentions with @username</li>
            <li>Version control</li>
            <li>Search functionality</li>
          </ul>
          <p>Feel free to explore and create your own documents!</p>`,
            changedBy: createdUsers[0]._id,
            changedAt: new Date(),
          },
        ],
      },
      {
        title: "Project Documentation Template",
        content: `<h1>Project Documentation Template</h1>
        <h2>Overview</h2>
        <p>Brief description of the project...</p>
        <h2>Requirements</h2>
        <p>List of project requirements...</p>
        <h2>Architecture</h2>
        <p>System architecture details...</p>
        <h2>API Documentation</h2>
        <p>API endpoints and usage...</p>
        <p>This document is shared with @jane_smith for collaboration.</p>`,
        author: createdUsers[1]._id,
        lastModifiedBy: createdUsers[1]._id,
        visibility: "private",
        sharedWith: [
          {
            user: createdUsers[0]._id,
            permission: "edit",
            sharedAt: new Date(),
          },
        ],
        versionHistory: [
          {
            version: 1,
            content: `<h1>Project Documentation Template</h1>
          <h2>Overview</h2>
          <p>Brief description of the project...</p>
          <h2>Requirements</h2>
          <p>List of project requirements...</p>
          <h2>Architecture</h2>
          <p>System architecture details...</p>
          <h2>API Documentation</h2>
          <p>API endpoints and usage...</p>
          <p>This document is shared with @jane_smith for collaboration.</p>`,
            changedBy: createdUsers[1]._id,
            changedAt: new Date(),
          },
        ],
      },
      {
        title: "Meeting Notes - Team Standup",
        content: `<h1>Team Standup - ${new Date().toDateString()}</h1>
        <h2>Attendees</h2>
        <ul>
          <li>@john_doe</li>
          <li>@jane_smith</li>
          <li>@admin_user</li>
        </ul>
        <h2>Discussion Points</h2>
        <p>1. Project progress update</p>
        <p>2. Upcoming deadlines</p>
        <p>3. Blockers and issues</p>
        <h2>Action Items</h2>
        <p>- Complete feature implementation by Friday</p>
        <p>- Review documentation updates</p>`,
        author: createdUsers[2]._id,
        lastModifiedBy: createdUsers[2]._id,
        visibility: "private",
        sharedWith: [
          {
            user: createdUsers[0]._id,
            permission: "view",
            sharedAt: new Date(),
          },
          {
            user: createdUsers[1]._id,
            permission: "view",
            sharedAt: new Date(),
          },
        ],
        versionHistory: [
          {
            version: 1,
            content: `<h1>Team Standup - ${new Date().toDateString()}</h1>
          <h2>Attendees</h2>
          <ul>
            <li>@john_doe</li>
            <li>@jane_smith</li>
            <li>@admin_user</li>
          </ul>
          <h2>Discussion Points</h2>
          <p>1. Project progress update</p>
          <p>2. Upcoming deadlines</p>
          <p>3. Blockers and issues</p>
          <h2>Action Items</h2>
          <p>- Complete feature implementation by Friday</p>
          <p>- Review documentation updates</p>`,
            changedBy: createdUsers[2]._id,
            changedAt: new Date(),
          },
        ],
      },
    ];

    await Document.create(documents);
    console.log("Created sample documents");

    console.log("Database seeded successfully!");
    console.log("\nSample Users:");
    console.log("1. john@example.com / password123");
    console.log("2. jane@example.com / password123");
    console.log("3. admin@example.com / admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
