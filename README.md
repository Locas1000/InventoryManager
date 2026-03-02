# Sentinel Custom Inventory Management System

A full-stack web application built for managing arbitrary inventories. This project allows users to create custom item templates with dynamic fields and rule-based custom ID generators.

## 🛠 Tech Stack

* **Frontend:** React, TypeScript, Vite, Bootstrap 5
* **Backend:** C# .NET 8 Web API
* **Database:** PostgreSQL
* **ORM:** Entity Framework Core 8
* **Security:** JWT (JSON Web Tokens) & BCrypt Password Hashing

##  Core Features

* **Authentication & Authorization:** Secure JWT-based login and registration. Role-based access control grants read-only access for guests, write-access for assigned users, and full override access for Admins.
* **Dynamic Custom Fields (Killer Feature 1):** Inventory creators can define custom schemas for their items, supporting up to 3 fields of each type: Single-line text, Multi-line text, Numeric, Checkboxes, and Document/Image links.
* **Custom ID Generator (Killer Feature 2):** Users can build a drag-and-drop formula (e.g., `FIXED-DATE-SEQ`) to automatically generate unique IDs for their items. Uniqueness is enforced at the database level per inventory.
* **Real-time Collaboration:** Optimistic concurrency locking prevents data loss when multiple users or admins edit the same inventory or item simultaneously.
* **Full-Text Search:** Global search functionality accessible from the top navigation bar to quickly find inventories and items.
* **Theming & Localization:** Full support for Light and Dark modes, along with Internationalization (i18n) for multiple UI languages.
* **Rich Text & Tags:** Markdown support for inventory descriptions and comments, alongside a robust tagging system with database-driven autocompletion.

##  Local Development Setup

### Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/) (v18+)
* [PostgreSQL](https://www.postgresql.org/) running locally
* EF Core CLI Tools (`dotnet tool install --global dotnet-ef --version 8.0.12`)

### 1. Database Configuration
1. Open `Server/appsettings.Development.json`.
2. Update the `DefaultConnection` string with your local PostgreSQL credentials (username and password).

### 2. Apply Database Migrations
Navigate to the `Server` directory and run the EF Core migrations to build the database tables:
```bash
cd Server
dotnet ef database update
3. Running the Application
Backend (.NET API):

Bash
cd Server
dotnet run
The API will be available at http://localhost:5164 and Swagger UI at http://localhost:5164/swagger.

Frontend (React/Vite):

Bash
cd Client
npm install
npm run dev
The frontend will be available at http://localhost:5173. The Vite proxy is pre-configured to route /api requests to the .NET backend.
