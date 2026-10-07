# Docker Run Guide for Dune AI

This guide explains how to build, run, and configure the application using Docker and Docker Compose.

---

## 1. Prerequisites

- Install and start **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS) or Docker Engine (Linux).
- Ensure Docker daemon is running by opening a terminal and checking:
  ```bash
  docker --version
  docker compose version
  ```

---

## 2. Environment Configuration

Before launching the container, configure your API keys. Copy [.env.example](.env.example) to `.env.local`:

**PowerShell (Windows):**
```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

**Bash (Linux / macOS):**
```bash
test -f .env.local || cp .env.example .env.local
```

Open `.env.local` and add your keys:
```dotenv
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

*(Note: The application UI and container will build and start even without keys; API keys are only required when generating AI text, code, images, or audio).*

---

## 3. How to Run with Docker

### Option A: Using Docker Compose (Recommended)

Docker Compose automatically configures port mapping and loads your `.env.local` / `.env` environment variables.

1. **Build and start the container:**
   ```bash
   docker compose up --build -d
   ```
   - `--build`: Rebuilds the image with current code changes.
   - `-d`: Runs container in detached (background) mode.

2. **Access the application:**
   Open your browser and visit:
   [http://localhost:3000](http://localhost:3000)

3. **View live container logs:**
   ```bash
   docker compose logs -f
   ```

4. **Stop the container:**
   ```bash
   docker compose down
   ```

---

### Option B: Using Docker CLI Directly

If you prefer building and running with Docker commands:

1. **Build the image:**
   ```bash
   docker build -t dune-ai .
   ```

2. **Run the container with your `.env.local` file:**
   ```bash
   docker run -d -p 3000:3000 --name dune-ai --env-file .env.local dune-ai
   ```

   *Alternatively, pass environment variables inline:*
   ```bash
   docker run -d -p 3000:3000 --name dune-ai \
     -e OPENAI_API_KEY="your_openai_api_key" \
     -e GEMINI_API_KEY="your_gemini_api_key" \
     dune-ai
   ```

3. **Useful management commands:**
   ```bash
   # Follow logs
   docker logs -f dune-ai

   # Stop container
   docker stop dune-ai

   # Remove container
   docker rm dune-ai
   ```

---

## 4. Customizing the Port

If port `3000` is already in use on your machine, you can change the host port:

- **Docker Compose:**
  ```bash
  PORT=8080 docker compose up -d
  ```
  *(or modify `ports: - "8080:3000"` in [docker-compose.yml](docker-compose.yml))*

- **Docker CLI:**
  ```bash
  docker run -d -p 8080:3000 --name dune-ai --env-file .env.local dune-ai
  ```

Then open [http://localhost:8080](http://localhost:8080).

---

## 5. Docker Architecture & Optimization

- **Multi-Stage Build:** Uses Node 22 Alpine across 4 distinct stages (`base`, `deps`, `builder`, `runner`).
- **Next.js Standalone Mode:** Configured with `output: 'standalone'` in [next.config.js](next.config.js) to bundle only runtime dependencies, drastically reducing image size (~150MB instead of ~1GB).
- **Security:** Drops root permissions and executes under an unprivileged `nextjs` system user (`UID 1001`).
- **Clean Context:** [.dockerignore](.dockerignore) prevents local cache, `node_modules`, and sensitive credentials from leaking into the container image.
