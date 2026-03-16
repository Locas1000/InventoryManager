# Inventory Manager

A full-stack web application for **inventory management**. Users can create inventories (templates) and add items to them. The app includes authentication (including social login), role-based access (user/admin), table-based views, custom fields (slot-based), custom item IDs, full-text search, discussions/comments, likes, tags, internationalization, and Cloudinary image upload.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap 5
- **Backend:** C# .NET 8 Web API
- **Database:** PostgreSQL
- **ORM:** Entity Framework Core 8
- **Auth/Security:** JWT + BCrypt password hashing

---

## Implemented Features (Current Repo)

### Authentication
- Local registration and login (JWT)
- Social login:
  - Google login
  - GitHub login

### Roles & Access
- Role stored per user (`User` / `Admin`)
- Admin-only area guarded in the frontend (`/admin`)

### Admin Dashboard
Admin UI + API support for:
- Viewing stats (users / inventories / items)
- Viewing users list
- Blocking / unblocking users
- Deleting users
- Toggling admin role (including allowing an admin to revoke their own admin role)

### Inventories & Items (Table Views)
- Dashboard displays inventories using **tables** (latest + top by item count)
- Inventory page shows items and supports selecting multiple items (checkbox selection UX)

### Inventory Details
- Markdown rendering for inventory descriptions
- Discussion/comments UI included on the inventory page (DiscussionBoard component)

### Custom Fields (Slot-based)
Inventory supports a limited set of configurable “field slots” (as currently modeled), such as:
- `string1..string3`
- `number1`
Including visibility flags (show/hide in table)

### Custom Item IDs
- Items have a `CustomId`
- Database enforces **unique CustomId per inventory** with a composite unique index `(InventoryId, CustomId)`

### Search
- Global search endpoint and UI page that returns results for:
  - Inventories
  - Items

### Tags
- Tags endpoint exists in the backend
- Tag cloud component exists in the dashboard UI

### Likes
- Like data model exists (`ItemLike` linked to user)

### Optimistic Concurrency (Items)
- Items use PostgreSQL `xmin` as a concurrency token for optimistic locking

### Internationalization (i18n)
- UI uses `react-i18next` and an `i18n.ts` configuration

### Cloud Image Uploads (Cloudinary)
- Cloudinary Upload Widget is included in the frontend and used via an `ImageUpload` component to upload an image and return a hosted URL.

---

## Project Structure

- `Client/` — React frontend
- `Server/` — .NET Web API backend
- `InventoryManager.sln` — solution file

---

## Local Development Setup

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- PostgreSQL running locally
- EF Core CLI Tools:
  ```bash
  dotnet tool install --global dotnet-ef --version 8.0.12
