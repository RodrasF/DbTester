using System.Security.Cryptography;
using System.Text;
using DbTester.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DbTester.Infrastructure.Security;

public class EncryptionService : IEncryptionService
{
    private readonly string _encryptionKey;

    public EncryptionService(IConfiguration configuration)
    {
        // Get the encryption key from configuration
        _encryptionKey = configuration["EncryptionKey"] ??
            throw new InvalidOperationException("Encryption key is not configured");
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return string.Empty;

        byte[] iv = new byte[16];
        byte[] array;

        using (Aes aes = Aes.Create())
        {
            aes.Key = Encoding.UTF8.GetBytes(EnsureValidKeyLength(_encryptionKey));
            aes.IV = iv;

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using var memoryStream = new MemoryStream();
            using var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write);
            using (var streamWriter = new StreamWriter(cryptoStream))
            {
                streamWriter.Write(plainText);
            }

            array = memoryStream.ToArray();
        }

        return Convert.ToBase64String(array);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return string.Empty;

        byte[] iv = new byte[16];
        byte[] buffer = Convert.FromBase64String(cipherText);

        using Aes aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(EnsureValidKeyLength(_encryptionKey));
        aes.IV = iv;

        ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        using var memoryStream = new MemoryStream(buffer);
        using var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read);
        using var streamReader = new StreamReader(cryptoStream);

        return streamReader.ReadToEnd();
    }

    // Ensure the key is exactly 32 bytes (256 bits) for AES-256
    private string EnsureValidKeyLength(string key)
    {
        if (key.Length < 32)
        {
            // If key is too short, pad it
            return key.PadRight(32, 'X');
        }
        if (key.Length > 32)
        {
            // If key is too long, truncate it
            return key.Substring(0, 32);
        }

        return key;
    }
}