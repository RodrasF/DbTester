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
- Node.js 20+ and npm
- PostgreSQL 14+

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RodrasF/DbTester.git
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

## Usage

1. **Create a connection**: Add your PostgreSQL database connection details
2. **Add test users**: Configure users with different permission levels
3. **Create workflows**: Build SQL test operations to validate permissions
4. **Run tests**: Execute workflows and view results

## License

[MIT](LICENSE)
