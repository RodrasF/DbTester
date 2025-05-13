using DbTester.Application.Interfaces;
using DbTester.Infrastructure.Data;
using DbTester.Infrastructure.Security;
using DbTester.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using DbTester.Application.ConnectionManagement;
using DbTester.Application.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Register DbConnectionFactory
builder.Services.AddSingleton<DbConnectionFactory>();

// Register application services
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<IDatabaseService, PostgreSqlDatabaseService>();
builder.Services.AddSingleton<IUserService, UserService>();

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

app.Run();