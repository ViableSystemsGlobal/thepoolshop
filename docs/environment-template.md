# Environment Variables Template

Copy this to your `.env` file on the server:

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/adpoolsgroup"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"

# Email Configuration (Optional - for notifications)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USERNAME=""
SMTP_PASSWORD=""
SMTP_FROM_ADDRESS="noreply@yourdomain.com"
SMTP_FROM_NAME="AdPools Group"

# SMS Configuration (Optional)
SMS_PROVIDER=""
SMS_API_KEY=""
SMS_FROM_NUMBER=""

# AI Configuration (Optional - for AI features)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=""

# File Upload Settings
MAX_FILE_SIZE="10485760"
```

## Important Notes:

1. **DATABASE_URL**: Replace with your actual PostgreSQL connection string from Hostinger
2. **NEXTAUTH_URL**: Replace with your actual domain
3. **NEXTAUTH_SECRET**: Generate a secure random string (32+ characters)
4. **Optional variables**: Only set if you plan to use those features
