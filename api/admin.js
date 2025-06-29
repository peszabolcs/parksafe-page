// Admin endpoint to view all emails
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const EMAILS_KEY = 'parksafe_emails'

// Helper function to read existing emails from Redis
const readEmails = async () => {
  try {
    const emails = await redis.get(EMAILS_KEY);
    return emails || [];
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return [];
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const emails = await readEmails();
      
      // Return HTML page with email list
      const html = `
        <!DOCTYPE html>
        <html lang="hu">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ParkSafe - Email Lista</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 {
              color: #1f2937;
              text-align: center;
              margin-bottom: 30px;
              font-size: 28px;
            }
            .stats {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .stats h2 {
              color: #10b981;
              margin: 0;
              font-size: 36px;
            }
            .stats p {
              color: #6b7280;
              margin: 5px 0 0 0;
            }
            .email-list {
              list-style: none;
              padding: 0;
            }
            .email-item {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .email-address {
              font-weight: 600;
              color: #1f2937;
            }
            .email-date {
              color: #6b7280;
              font-size: 14px;
            }
            .no-emails {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
            }
            .refresh-btn {
              background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .refresh-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚗 ParkSafe Email Lista</h1>
            
            <div class="stats">
              <h2>${emails.length}</h2>
              <p>Feliratkozó összesen</p>
            </div>

            <button class="refresh-btn" onclick="location.reload()">🔄 Frissítés</button>

            ${emails.length > 0 ? `
              <ul class="email-list">
                ${emails.map(email => `
                  <li class="email-item">
                    <span class="email-address">${email.email}</span>
                    <span class="email-date">${new Date(email.subscribedAt).toLocaleString('hu-HU')}</span>
                  </li>
                `).join('')}
              </ul>
            ` : `
              <div class="no-emails">
                📭 Még nincsenek feliratkozók
              </div>
            `}
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
      
    } catch (error) {
      console.error('Error reading emails:', error);
      return res.status(500).json({ 
        error: 'Szerver hiba történt' 
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
}
