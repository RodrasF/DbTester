using DbTester.Application.Authentication;
using DbTester.Application.ConnectionManagement;
using DbTester.Application.Interfaces;
using DbTester.Application.UserManagement;
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
builder.Services.AddValidatorsFromAssemblyContaining<CreateTestUserRequestValidator>();

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:Key"] ?? throw new InvalidOperationException("JWT key is not configured"))),
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

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Initialize the database
await app.InitializeDatabaseAsync();

app.UseHttpsRedirection();

// Use CORS before authorization
app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
