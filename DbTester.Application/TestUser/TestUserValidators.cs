using FluentValidation;

namespace DbTester.Application.UserManagement;

public class CreateTestUserRequestValidator : AbstractValidator<CreateTestUserRequest>
{
    public CreateTestUserRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters long")
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters");

        RuleFor(x => x.ConnectionId)
            .NotEmpty().WithMessage("Connection ID is required");
    }
}

public class UpdateTestUserRequestValidator : AbstractValidator<UpdateTestUserRequest>
{
    public UpdateTestUserRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required");

        // Username can be empty for updates (to keep existing username)
        RuleFor(x => x.Username)
            .MinimumLength(3).When(x => !string.IsNullOrEmpty(x.Username))
            .WithMessage("Username must be at least 3 characters long")
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Username))
            .WithMessage("Username cannot exceed 50 characters");
    }
}
