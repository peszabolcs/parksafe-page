// Vercel serverless function for contact messages
// Using Upstash Redis for persistent storage

import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const MESSAGES_KEY = 'parksafe_messages'

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to read existing messages from Redis
const readMessages = async () => {
  try {
    const messages = await redis.get(MESSAGES_KEY);
    // Redis returns null if key doesn't exist, ensure we return an array
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return [];
  }
};

// Helper function to write messages to Redis
const writeMessages = async (messages) => {
  try {
    await redis.set(MESSAGES_KEY, messages);
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
      const { name, email, message } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Név megadása kötelező' 
        });
      }

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ 
          error: 'Email cím megadása kötelező' 
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          error: 'Érvénytelen email cím formátum' 
        });
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Üzenet megadása kötelező' 
        });
      }

      // Read existing messages
      const messages = await readMessages();

      // Create new message entry
      const newMessage = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'unread'
      };

      messages.unshift(newMessage); // Add to beginning of array for chronological order

      // Write back to Redis
      await writeMessages(messages);

      // Return success response
      return res.status(200).json({ 
        success: true, 
        message: 'Üzenet sikeresen elküldve! Hamarosan válaszolunk.',
        id: newMessage.id
      });

    } catch (error) {
      console.error('Error in contact function:', error);
      return res.status(500).json({ 
        error: 'Szerver hiba történt. Kérlek próbáld újra!' 
      });
    }
  }

  // Handle GET request - return message count
  if (req.method === 'GET') {
    try {
      const messages = await readMessages();
      return res.status(200).json({ 
        totalMessages: messages.length,
        unreadMessages: messages.filter(msg => msg.status === 'unread').length
      });
    } catch (error) {
      console.error('Error reading messages:', error);
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