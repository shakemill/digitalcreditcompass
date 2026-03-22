const LOGO_URL = "https://digitalcreditcompass.com/logo-dcc.png";
const TAGLINE = "Digital Credit Compass — Clarity Before Capital";
const SUPPORT_EMAIL = "support@digitalcreditcompass.com";

/**
 * Wraps email body content in a responsive table-based layout.
 * Max-width 600px, inline CSS for Gmail/Outlook compatibility.
 */
export function wrapEmail(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Digital Credit Compass</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:24px;">
              <a href="https://digitalcreditcompass.com" style="text-decoration:none;">
                <img src="${LOGO_URL}" alt="Digital Credit Compass" width="120" height="48" style="display:inline-block;max-height:48px;width:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-size:16px;line-height:1.6;color:#333333;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-size:12px;color:#666666;border-top:1px solid #eeeeee;">
              ${TAGLINE}<br />
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#666666;">${SUPPORT_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}
