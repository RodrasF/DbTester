using DbTester.Application.Authentication;
using DbTester.Application.ConnectionManagement;
using DbTester.Application.Interfaces;
using DbTester.Infrastructure.Data;
using DbTester.Infrastructure.Repositories;
using DbTester.Infrastructure.Security;
using DbTester.Infrastructure.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

// Register DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register application services
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IDatabaseService, PostgreSqlDatabaseService>();
builder.Services.AddScoped<IUserService, UserService>();

// Register repositories
builder.Services.AddScoped<IDatabaseConnectionRepository, DatabaseConnectionRepository>();
builder.Services.AddScoped<ITestUserRepository, TestUserRepository>();
builder.Services.AddScoped<ITestWorkflowRepository, TestWorkflowRepository>();

// Register database initializer
builder.Services.AddScoped<DbInitializer>();

// Register validators
builder.Services.AddValidatorsFromAssemblyContaining<CreateDatabaseConnectionValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:Key"] ?? "DefaultDevelopmentKeyForDbTesterAppSecurity12345")),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"]
        };
    });

// Add authorization policies
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use CORS before authorization
app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

// Initialize the database
await app.InitializeDatabaseAsync();

app.Run();
