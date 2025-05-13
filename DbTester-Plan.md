# What is DbTester?

DbTester is a fullstack application meant to give its users the ability to configure test workflows to run against a database. It aims to provide an easy way to test things like user permissions in detail and provide clear results based on what's expected.

## Product Vision

DbTester streamlines database permission testing for database administrators, security teams, and developers. By automating complex permission verification scenarios, it reduces human error, improves security compliance, and provides auditable test reports. The tool helps organizations maintain proper security boundaries while ensuring necessary access for all database users.

## Core Requirements

### User Interface

- The app should have a responsive frontend built in React using shad-cn
- The interface should include:
  - Dashboard overview showing recent test results and saved workflows
  - Test configuration workspace to define new test cases
  - Connection management section for managing database connections
  - Results viewer with detailed test outcomes
  - User management section to define and organize test users

### Database Testing Capabilities

- The user should be able to test if a database user has permission to:
  - Create/drop/select/insert/update/delete tables
  - Execute stored procedures and functions
  - Create/modify database objects (views, indexes, etc.)
  - Grant/revoke permissions to other users
  - Access system tables and information schemas
- Permission tests should verify both positive (user can perform action) and negative (user cannot perform action) scenarios
- Tests should support conditional assertions (e.g., user can select from Table A but not Table B)

### Test Workflow Configuration

- Some tests might have multiple operations and it should be possible for the user to specify them, based on a given list of operations, and their respective order of execution
- Each test operation must have a respective user which will execute it
- Support for test parameterization to reuse workflows across different database environments
- Allow users to group tests into logical test suites
- Enable saving and loading test configurations from files
- Support for test workflow templates for common testing scenarios

### Database Connectivity

- The user should be able to provide the server and database information on which the tests will run
- Support for secure credential management (encrypted storage)
- Allow connection pooling configuration for performance optimization
- Connection authentication is only supported using username/password for now
- Connection health checks before test execution

### User Management

- The user should be able to configure multiple database users and their expected permissions for a given Test
- Support for role-based permission testing
- Allow testing of permission inheritance and role hierarchies

### Supported Database Systems

- The app will only support PostgreSQL for now as a database system
- Architecture should be designed for future expansion to other database systems (SQL Server, MySQL, Oracle, etc.)

### Technical Architecture

- The app should have a backend in .NET 8 C# that serves the frontend, exposes an API and interacts with the database using Dapper
- RESTful API design with OpenAPI/Swagger documentation
- Clean architecture with separation of concerns:
  - Domain Layer: Core business logic and entities
  - Application Layer: Use cases and application services
  - Infrastructure Layer: Database access, external services
  - Presentation Layer: API controllers and frontend
- Authentication and authorization for the application itself (JWT-based)
- Containerization support (Docker) for easy deployment
- Unit and integration testing coverage

### Test Results & Reporting

- The user should be able to execute the test workflows and obtain a report of all the test results, succeeded and failed, along with any meaningful messages to describe the result
- Visual representation of test results (charts, graphs)
- Exportable reports (PDF, Excel, CSV)
- Historical test results for trend analysis
- Ability to compare test results across different runs
- Detailed error logging and diagnostics

## Non-Functional Requirements

### Performance

- Test execution should be optimized and run in parallel where possible
- The application should handle large test suites without significant degradation
- Response time for UI interactions should be under 1 second

### Security

- Secure storage of database credentials
- Role-based access control for the application itself
- Prevention of SQL injection in dynamically generated test queries
- Compliance with OWASP security standards

### Scalability

- Support for concurrent users running different test workflows
- Horizontal scaling capability for high-volume environments

### Usability

- Intuitive UI with minimal learning curve
- Comprehensive documentation and help resources
- Guided workflow for first-time users
- Dark/light theme support

## Future Considerations

### Potential Extensions

- Support for additional database systems (SQL Server, MySQL, Oracle)
- Integration with CI/CD pipelines for automated testing
- API for programmatic test execution
- AI-assisted test generation based on database schema

### Integration Points

- Version control systems (Git) for test workflow versioning
- Issue tracking systems (GitHub Projects)
- Notification systems (email) for test results
- Identity providers (Microsoft Entra) for SSO

## Development Roadmap

### Phase 1: Core Functionality

- Basic PostgreSQL connectivity
- Simple permission tests (CRUD operations)
- Basic test workflow definition
- Minimal viable frontend

### Phase 2: Enhanced Features

- Complex test workflows with multiple steps
- User and role management
- Test templates and reusable components
- Improved reporting capabilities

### Phase 3: Enterprise Features

- Advanced reporting and analytics
- High availability and scaling options
- Integration capabilities
