<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

# Landing Page Builder Server


This project is a robust and scalable server for a landing page builder, developed using **NestJS** and **MongoDB**. It provides a modern backend infrastructure that empowers developers and users to create dynamic and responsive landing pages effortlessly.

---

## Key Features

### 1. Flexibility of Data Structure
With **MongoDB** as the database, the server supports dynamic data schemas, making it ideal for storing configurations and content of landing page components.

### 2. RESTful API
The server provides user-friendly interfaces to interact with the frontend of the builder, enabling functionalities such as previewing and publishing landing pages.

### 3. User and Role Management
Built-in authentication and authorization systems are implemented using **JWT** (JSON Web Tokens). These systems ensure granular access control for administrators, developers, and end users.

### 4. Security
The server is designed with modern security measures, including:

**JWT (JSON Web Tokens)**:Tokens are used to securely identify and authorize users. JWT provides a stateless mechanism for authentication, ensuring data integrity by verifying tokens with a secret key. This reduces the risk of session hijacking.

**CSRF (Cross-Site Request Forgery) Protection**:The server implements CSRF protection mechanisms to prevent malicious third-party websites from performing unauthorized actions on behalf of authenticated users. By validating CSRF tokens for sensitive operations, the server ensures that requests originate from trusted sources.

---

## Technologies Used

- **NestJS**: A reliable and modular framework for building the server-side application.
- **MongoDB**: A database for storing landing page structures and user data.
- **TypeScript**: Ensures code readability and safety with strict type checking.
- **Mongoose**: An ORM for seamless interaction with the MongoDB database.

---

This server serves as the backbone of a powerful and user-friendly landing page builder, offering the flexibility, scalability, and security needed to bring creative ideas to life.

---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
