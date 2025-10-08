# Basic Blog Project with Authentication and Population

A simple blog application built using **Node.js**, **Express**, **MongoDB**, and **EJS**, featuring user authentication and CRUD operations for blog posts. This project also demonstrates **Mongoose population** to handle relationships between users and their posts.

---

## Features

- **User Authentication**
  - Register new users
  - Login/logout functionality
  - Session-based authentication

- **Blog Management (CRUD)**
  - Create, read, update, and delete blog posts
  - Upload images for each blog post
  - Only logged-in users can manage their blogs

- **User-Post Relationship**
  - Each blog is associated with a user (`userId`)
  - Demonstrates **Mongoose population** to fetch user details with each blog

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ORM)  
- **Authentication:** bcrypt, express-session  
- **File Upload:** multer  
- **Templating Engine:** EJS  

---
