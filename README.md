# DbTester

A comprehensive tool for testing PostgreSQL database connections, user permissions, and workflows.

## Overview

DbTester allows database administrators and developers to validate and test database permissions in a structured way. It's particularly useful for ensuring that:

- Database connections are correctly configured
- Test users have exactly the permissions they need
- Complex database workflows work with specific user permissions
- Permissions are consistent across environments

The application follows a clean architecture pattern with separate layers for Domain, Application, Infrastructure, and WebApi.

## Key Features

- **Connection Management**: Create, test, and manage database connections
- **User Management**: Define test users with specific permissions
- **Workflow Builder**: Create reusable test workflows with specific SQL operations
- **Templates**: Create workflow templates that can be reused with different connections/users
- **Results Dashboard**: View detailed results of test runs

## Project Structure

## Project Structure

### Backend (.NET)

The backend is built with .NET 8 using a clean architecture approach:

- **DbTester.Domain**: Contains entities, enums, and domain logic
- **DbTester.Application**: Contains DTOs, interfaces, and application services
- **DbTester.Infrastructure**: Contains implementations of repositories and services
- **DbTester.WebApi**: Contains API controllers and configuration

### Frontend (React)

The frontend is built with React, TypeScript, Vite, and shadcn/ui:

- **ClientApp**: Contains the React application
  - **src/components**: Reusable UI components
  - **src/pages**: Main pages of the application
  - **src/services**: API service layer
  - **src/lib**: Utility functions

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- PostgreSQL 14+

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/DbTester.git
   cd DbTester
   ```

2. Set up the backend:

   ```bash
   dotnet restore
   dotnet build
   ```

3. Set up the frontend:

   ```bash
   cd ClientApp
   npm install
   ```

4. Configure your database connection in `appsettings.json` or through environment variables.

### Development

1. Start the API:

   ```bash
   cd DbTester.WebApi
   dotnet run
   ```

2. Start the React development server:

   ```bash
   cd ClientApp
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Create a connection**: Add your PostgreSQL database connection details
2. **Add test users**: Configure users with different permission levels
3. **Create workflows**: Build SQL test operations to validate permissions
4. **Run tests**: Execute workflows and view results

- **DbTester.Infrastructure**: Contains implementations of repositories and services
- **DbTester.WebApi**: Contains API controllers and configuration

### Frontend (React + TypeScript)

- **ClientApp/src/components**: UI components built with shadcn-ui
- **ClientApp/src/pages**: Application pages and features
- **ClientApp/src/services**: API services and types

## Getting Started

### Running the Backend

1. Navigate to the project root directory
2. Restore dependencies:

```sh
dotnet restore
```

3. Run the application:

```sh
dotnet run --project DbTester.WebApi
```

The API will start on http://localhost:5000.

### Running the Frontend

1. Navigate to the ClientApp directory

```sh
cd ClientApp
```

2. Install dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
```

The frontend will start on http://localhost:5173.

## Features

### Database Connections

Manage PostgreSQL database connections with full CRUD operations. Test connections to verify they're working properly.

### Test Users

Create and manage test database users with specific permissions. Validate that users have the permissions they're supposed to have.

### Test Workflows

Build test workflows consisting of SQL operations to test database permissions. Run workflows against specific connections and users.

### Results Viewing

View detailed results of test workflow executions, including success/failure status, execution time, and any error messages.

## License

[MIT](LICENSE)
