# TaskTracker PostgreSQL + Sequelize setup

This package creates:

- users
- projects
- tasks
- time_entries
- task_audit_records
- 18 demo users

## Important password note

Passwords are hashed, not encrypted. The stored hash cannot be decrypted.

All demo users use this development password:

`TaskTrack@123`

Emails:

`user01@tasktrack.local` through `user18@tasktrack.local`

## Install dependencies

Run inside your backend folder:

```bash
npm install sequelize pg pg-hstore dotenv bcryptjs
npm install --save-dev sequelize-cli
```

## Copy the files

Copy these folders/files into the root of your backend folder:

```text
config/
migrations/
seeders/
.sequelizerc
.env.example
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` with your real PostgreSQL credentials.

## Create the empty database first

Create only the empty PostgreSQL database manually:

```sql
CREATE DATABASE tasktracker_db;
```

Do not manually create the tables in pgAdmin. The migrations create them.

## Run migrations

```bash
npx sequelize-cli db:migrate
```

## Insert 18 demo users

```bash
npx sequelize-cli db:seed:all
```

## Undo the seed

```bash
npx sequelize-cli db:seed:undo:all
```

## Undo all migrations

```bash
npx sequelize-cli db:migrate:undo:all
```
