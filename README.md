# vue3-bs

Vue 3 + Bootstrap 5 Component Library Boilerplate.

## Features

- **Vue 3** (Composition API)
- **Bootstrap 5** (Styles only, no JS dependencies)
- **Vite** for fast development and building
- **ESLint** + **Prettier** for code quality
- **Docker** support

## Installation

```bash
npm install
```

## Documentation

See [COMPONENTS.md](./COMPONENTS.md) for detailed component usage and examples.

## Development

Start the playground dev server:

```bash
npm run dev
```

Build the library:

```bash
npm run build
```

## Docker Usage

You can run npm commands inside a Docker container using the provided `docker-compose.yml`.

### Prerequisites

- Docker
- Docker Compose

### Running Commands

1. **Start the environment:**

   ```bash
   docker compose up -d
   ```

2. **Install dependencies:**

   ```bash
   docker compose exec app npm install
   ```

3. **Run the dev server:**

   ```bash
   docker compose exec app npm run dev
   ```
   
   Access the playground at `http://localhost:5173`.

4. **Build the library:**

   ```bash
   docker compose exec app npm run build
   ```

5. **Run Linter:**
   
   ```bash
   docker compose exec app npm run lint
   ```

Alternatively, you can use `docker compose run --rm` for one-off commands if you don't want to leave the container running:

```bash
docker compose run --rm app npm install
docker compose run --rm -p 5173:5173 app npm run dev
```
