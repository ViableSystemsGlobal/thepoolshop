import { prisma } from '@/lib/prisma';
import { getCompanyName } from './payment-order-notifications';

/**
 * Get email template settings from database
 */
async function getEmailTemplateSettings() {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'email_template_header',
            'email_template_footer',
            'primary_color',
            'secondary_color',
            'company_name',
            'company_address',
            'company_phone',
            'company_email',
            'company_website'
          ]
        }
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const companyName = await getCompanyName();

    return {
      header: settingsMap.email_template_header || '',
      footer: settingsMap.email_template_footer || '',
      primaryColor: settingsMap.primary_color || '#dc2626',
      secondaryColor: settingsMap.secondary_color || '#b91c1c',
      companyName: companyName || settingsMap.company_name || 'AdPools Group',
      companyAddress: settingsMap.company_address || '',
      companyPhone: settingsMap.company_phone || '',
      companyEmail: settingsMap.company_email || '',
      companyWebsite: settingsMap.company_website || ''
    };
  } catch (error) {
    console.error('Error fetching email template settings:', error);
    return {
      header: '',
      footer: '',
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      companyName: 'AdPools Group',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyWebsite: ''
    };
  }
}

/**
 * Replace variables in template string with actual values
 * @param template - Template string with variables like {companyName}
 * @param variables - Object with variable values
 * @returns Template with variables replaced
 */
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  // Replace all {variableName} with actual values
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
}

/**
 * Generate HTML email template with theme colors
 * @param content - The main email content (HTML)
 * @returns Complete HTML email template
 */
export async function generateEmailTemplate(content: string): Promise<string> {
  const settings = await getEmailTemplateSettings();

  // Default header if none provided
  const defaultHeader = `
    <div style="background-color: ${settings.primaryColor}; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
        ${settings.companyName}
      </h1>
    </div>
  `;

  // Default footer if none provided
  const defaultFooter = `
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 3px solid ${settings.primaryColor}; margin-top: 30px;">
      <p style="color: #6c757d; margin: 0; font-size: 14px;">
        © ${new Date().getFullYear()} ${settings.companyName}. All rights reserved.
      </p>
    </div>
  `;

  let header = settings.header || defaultHeader;
  let footer = settings.footer || defaultFooter;

  // Prepare variables for replacement
  const variables = {
    companyName: settings.companyName,
    companyAddress: settings.companyAddress,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail,
    companyWebsite: settings.companyWebsite,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    currentYear: new Date().getFullYear().toString()
  };

  // Replace variables in header and footer
  header = replaceTemplateVariables(header, variables);
  footer = replaceTemplateVariables(footer, variables);

  // Complete HTML email template
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              ${header}
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return htmlTemplate;
}

/**
 * Generate plain text version of email (for text fallback)
 * @param htmlContent - The HTML content
 * @returns Plain text version
 */
export function generatePlainText(htmlContent: string): string {
  // Remove HTML tags and convert basic HTML entities
  let text = htmlContent
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();
  
  return text;
}

