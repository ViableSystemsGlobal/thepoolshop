# Notification System Setup Guide

This guide will help you configure the notification system for AD Pools Sales Management System.

## Overview

The notification system supports three channels:
- **Email** - SMTP, SendGrid, or AWS SES
- **SMS** - Deywuro, Twilio, or AWS SNS
- **WhatsApp** - WhatsApp Business API or Twilio WhatsApp

## Environment Variables

Add the following variables to your `.env` file:

### Database & Authentication
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Email Configuration

#### SMTP (Recommended for Gmail, Outlook, etc.)
```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com
SMTP_REPLY_TO=support@yourcompany.com
```

#### SendGrid (Alternative)
```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM=noreply@yourcompany.com
```

#### AWS SES (Alternative)
```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SES_FROM=noreply@yourcompany.com
```

### SMS Configuration

#### Deywuro (Recommended for Ghana)
```env
SMS_ENABLED=true
SMS_PROVIDER=deywuro
SMS_USERNAME=your-deywuro-username
SMS_PASSWORD=your-deywuro-password
SMS_SENDER_ID=YourCompany  # Max 11 characters, alphanumeric
SMS_BASE_URL=https://deywuro.com/api
```

**API Specification:**
- **Endpoint**: https://deywuro.com/api/sms
- **Method**: POST
- **Content-Type**: application/x-www-form-urlencoded
- **Response Codes**: 0=Success, 401=Invalid Credential, 402=Missing Fields, 403=Insufficient Balance, 404=Not Routable, 500=Others

#### Twilio (Alternative)
```env
SMS_ENABLED=true
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM=+1234567890
```

#### AWS SNS (Alternative)
```env
SMS_ENABLED=true
SMS_PROVIDER=aws
AWS_SNS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### WhatsApp Configuration

#### WhatsApp Business API
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=business
WHATSAPP_API_KEY=your-whatsapp-business-api-key
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_WEBHOOK_TOKEN=your-webhook-verification-token
```

#### Twilio WhatsApp (Alternative)
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
```

### System Configuration
```env
NOTIFICATION_PROCESSING_INTERVAL=60000
NOTIFICATION_MAX_RETRIES=3
NOTIFICATION_RETRY_DELAY=30000
NOTIFICATION_BATCH_SIZE=10
```

## Setup Instructions

### 1. Email Setup

#### For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASSWORD`

#### For SendGrid:
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with "Mail Send" permissions
3. Verify your sender identity

#### For AWS SES:
1. Set up AWS SES in your AWS account
2. Verify your email address or domain
3. Create IAM credentials with SES permissions

### 2. SMS Setup

#### For Deywuro:
1. Sign up at [Deywuro](https://deywuro.com/)
2. Get your API key from the dashboard
3. Set up your sender ID (must be approved)

#### For Twilio:
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Purchase a phone number for SMS

### 3. WhatsApp Setup

#### For WhatsApp Business API:
1. Set up a Meta Business account
2. Create a WhatsApp Business API app
3. Get your API credentials from Meta for Developers

#### For Twilio WhatsApp:
1. Set up Twilio account
2. Enable WhatsApp messaging
3. Get your WhatsApp-enabled phone number

## Configuration Page

Once you've set up your environment variables, you can:

1. Go to **Settings → Notification Config**
2. Review and test your configuration
3. Save the settings
4. Copy the generated environment variables to your `.env` file

## Testing

The configuration page includes test buttons for each channel:
- **Test Email** - Sends a test email to verify SMTP settings
- **Test SMS** - Sends a test SMS to verify SMS provider settings
- **Test WhatsApp** - Sends a test WhatsApp message

## Troubleshooting

### Common Issues:

1. **Gmail SMTP Issues**:
   - Make sure you're using an App Password, not your regular password
   - Check that 2FA is enabled
   - Verify the SMTP settings match Gmail's requirements

2. **SMS Not Working**:
   - Verify your API credentials
   - Check that your sender ID is approved (for Deywuro)
   - Ensure you have sufficient credits/balance

3. **WhatsApp Issues**:
   - Verify your phone number ID
   - Check that your webhook is properly configured
   - Ensure your business account is approved

### Logs:
Check the console logs for detailed error messages when testing notifications.

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords and API keys
- Regularly rotate your credentials
- Monitor your usage to prevent abuse

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify your environment variables
3. Test each channel individually
4. Contact the respective service providers for API-specific issues
