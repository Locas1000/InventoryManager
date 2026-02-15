#  Custom Inventory Management System

A full-stack web application built for managing arbitrary inventories. This project allows users to create custom item templates with dynamic fields and rule-based custom ID generators.

##  Tech Stack

* **Frontend:** React, TypeScript, Vite, Bootstrap
* **Backend:** C# .NET 8 Web API
* **Database:** PostgreSQL
* **ORM:** Entity Framework Core 8

##  "Main" Features
* **Dynamic Custom Fields:** Inventory creators can define up to 3 fields of various types (String, Number, Boolean) that automatically apply to all items within that inventory.
* **Custom ID Generator:** Users can build a formula (e.g., `FIXED-DATE-SEQ`) to automatically generate unique IDs for their items. Uniqueness is enforced at the database level per inventory.
* **Role-Based Access Control:** Read-only access for guests, write-access for assigned users/creators, and full override access for Admins.
* **Real-time Collaboration:** Optimistic concurrency locking prevents data loss when multiple users edit the same item simultaneously.

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

```

### 3. Running the Application

**Backend (.NET API):**

```bash
cd Server
dotnet run

```

*The API will be available at `http://localhost:5164` and Swagger UI at `http://localhost:5164/swagger`.*

**Frontend (React/Vite):**

```bash
cd Client
npm install
npm run dev

```

*The frontend will be available at `http://localhost:5173`. The Vite proxy is pre-configured to route `/api` requests to the .NET backend.*

*(Note: If using JetBrains Rider, you can launch both simultaneously using the Compound Run Configuration).*

```

---

### How to push this to GitHub:
Since your Git repo is already linked up, adding this is super easy. Just open your Rider terminal in the root folder and run these three commands:

```bash
git add README.md
git commit -m "Add professional README for project defense"
git push
