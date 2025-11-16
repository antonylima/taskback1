# Task Manager

A simple task management API built with Express.js and Turso database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
TURSO_DATABASE_URL=libsql://your-database-name.your-org.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
PORT=3000
```

3. Test your database connection:
```bash
npm run test-connection
```

4. Run the migration to create the tasks table:
```bash
npm run migrate
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## Troubleshooting

### Getting Database Credentials

If you need to get or refresh your Turso credentials:

1. Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Login to Turso:
```bash
turso auth login
```

3. List your databases:
```bash
turso db list
```

4. Get database URL:
```bash
turso db show your-database-name --url
```

5. Create or get auth token:
```bash
turso db tokens create your-database-name
```

### Common Issues

- **401 Unauthorized**: Your auth token may be expired. Generate a new token.
- **URL_INVALID**: Check your database URL format. It should start with `libsql://`
- **Connection timeout**: Verify your database exists and is accessible.

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Task Schema

```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "status": "pending", // pending, in_progress, completed
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload
- `npm run migrate` - Run database migrations
- `npm run test-connection` - Test database connection

## Backup Directory

The `backups/` directory can be used for storing JSON exports/imports of task data (optional functionality).