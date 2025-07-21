# My Project Gemini

This is a Node.js application that provides user registration, login, and system performance monitoring endpoints. The project is fully containerized using Docker for easy setup and deployment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone <your-repository-url>
cd my_project_gemini
```

### 2. Configure Environment Variables

The application uses environment variables for database configuration. These are managed in a `.env` file. A template is provided in `.env.example`.

Create your own `.env` file by copying the example:

```bash
cp .env.example .env
```

Now, open the `.env` file and customize the values for `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_ROOT_PASSWORD` as needed. **The values in this file will be used to initialize the database.**

### 3. Build and Run the Application

With Docker and Docker Compose installed, you can build and run the application using a single command. This command will build the Docker image, create the services defined in `docker-compose.yml`, and start them in the background.

```bash
docker-compose --project-name my_project_gemini up --build -d
```

### 4. Verify the Application is Running

You can check the status of the running containers:

```bash
docker-compose --project-name my_project_gemini ps
```

You should see two containers running: `my_project_gemini_app` and `my_project_gemini_db`.

## Accessing the Application

Once the application is running, you can access it at:

- **Main Page:** `http://localhost:3000`
- **API Endpoints:**
    - `POST /register`
    - `POST /login`
    - `GET /performance`
    - `GET /users`

## Useful Docker Commands

- **View Logs:** To see the logs from the application or database container:
  ```bash
  # Application logs
  docker-compose --project-name my_project_gemini logs -f app

  # Database logs
  docker-compose --project-name my_project_gemini logs -f db
  ```

- **Stop the Application:** To stop and remove the containers, networks, and volumes:
  ```bash
  docker-compose --project-name my_project_gemini down
  ```
