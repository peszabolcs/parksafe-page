// Vercel serverless function for email subscription
// Using Upstash Redis for persistent storage

import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const EMAILS_KEY = 'parksafe_emails'

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to read existing emails from Redis
const readEmails = async () => {
  try {
    const emails = await redis.get(EMAILS_KEY);
    // Redis returns null if key doesn't exist, ensure we return an array
    return Array.isArray(emails) ? emails : [];
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return [];
  }
};

// Helper function to write emails to Redis
const writeEmails = async (emails) => {
  try {
    await redis.set(EMAILS_KEY, emails);
  } catch (error) {
    console.error('Error writing to Redis:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ 
          error: 'Email cím szükséges' 
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          error: 'Érvénytelen email cím formátum' 
        });
      }

      // Read existing emails
      const emails = await readEmails();

      // Check if email already exists
      const existingEmail = emails.find(item => item.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        return res.status(400).json({ 
          error: 'Ez az email cím már fel van iratkozva' 
        });
      }

      // Add new email with timestamp
      const newEmailEntry = {
        email: email.toLowerCase().trim(),
        subscribedAt: new Date().toISOString(),
        id: Date.now().toString()
      };

      emails.push(newEmailEntry);

      // Write back to file
      await writeEmails(emails);

      // Return success response
      return res.status(200).json({ 
        success: true, 
        message: 'Sikeresen feliratkoztál!',
        totalSubscribers: emails.length
      });

    } catch (error) {
      console.error('Error in subscribe function:', error);
      return res.status(500).json({ 
        error: 'Szerver hiba történt. Kérlek próbáld újra!' 
      });
    }
  }

  // Handle GET request - return subscriber count
  if (req.method === 'GET') {
    try {
      const emails = await readEmails();
      return res.status(200).json({ 
        totalSubscribers: emails.length 
      });
    } catch (error) {
      console.error('Error reading subscribers:', error);
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