using FluentValidation;

namespace DbTester.Application.ConnectionManagement;

public class CreateDatabaseConnectionValidator : AbstractValidator<CreateDatabaseConnectionRequest>
{
    public CreateDatabaseConnectionValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Connection name is required")
            .MaximumLength(100).WithMessage("Connection name cannot exceed 100 characters");

        RuleFor(x => x.Server)
            .NotEmpty().WithMessage("Server address is required");

        RuleFor(x => x.Port)
            .InclusiveBetween(1, 65535).WithMessage("Port must be between 1 and 65535");

        RuleFor(x => x.DatabaseName)
            .NotEmpty().WithMessage("Database name is required");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");

        RuleFor(x => x.MaxPoolSize)
            .GreaterThan(0).WithMessage("Max pool size must be greater than 0");

        RuleFor(x => x.MinPoolSize)
            .GreaterThanOrEqualTo(0).WithMessage("Min pool size must be at least 0");

        RuleFor(x => x.ConnectionTimeout)
            .GreaterThan(0).WithMessage("Connection timeout must be greater than 0");
    }
}

public class UpdateDatabaseConnectionValidator : AbstractValidator<UpdateDatabaseConnectionRequest>
{
    public UpdateDatabaseConnectionValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Connection ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Connection name is required")
            .MaximumLength(100).WithMessage("Connection name cannot exceed 100 characters");

        RuleFor(x => x.Server)
            .NotEmpty().WithMessage("Server address is required");

        RuleFor(x => x.Port)
            .InclusiveBetween(1, 65535).WithMessage("Port must be between 1 and 65535");

        RuleFor(x => x.DatabaseName)
            .NotEmpty().WithMessage("Database name is required");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required");

        // Password can be empty for updates (to keep existing password)

        RuleFor(x => x.MaxPoolSize)
            .GreaterThan(0).WithMessage("Max pool size must be greater than 0");

        RuleFor(x => x.MinPoolSize)
            .GreaterThanOrEqualTo(0).WithMessage("Min pool size must be at least 0");

        RuleFor(x => x.ConnectionTimeout)
            .GreaterThan(0).WithMessage("Connection timeout must be greater than 0");
    }
}

public class TestConnectionValidator : AbstractValidator<TestConnectionRequest>
{
    public TestConnectionValidator()
    {
        // Either ID or connection details must be provided
        RuleFor(x => x)
            .Must(x => x.Id.HasValue ||
                  (!string.IsNullOrEmpty(x.Server) &&
                   !string.IsNullOrEmpty(x.DatabaseName) &&
                   !string.IsNullOrEmpty(x.Username) &&
                   !string.IsNullOrEmpty(x.Password)))
            .WithMessage("Either Connection ID or full connection details (Server, Database, Username, Password) must be provided");

        When(x => !x.Id.HasValue, () =>
        {
            RuleFor(x => x.Server)
                .NotEmpty().WithMessage("Server address is required");

            RuleFor(x => x.Port)
                .InclusiveBetween(1, 65535).WithMessage("Port must be between 1 and 65535");

            RuleFor(x => x.DatabaseName)
                .NotEmpty().WithMessage("Database name is required");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        });
    }
}