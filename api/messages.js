// Admin endpoint to view all contact messages
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const MESSAGES_KEY = 'parksafe_messages'

// Helper function to read existing messages from Redis
const readMessages = async () => {
  try {
    const messages = await redis.get(MESSAGES_KEY);
    return messages || [];
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return [];
  }
};

// Helper function to update message status
const updateMessageStatus = async (messageId, status) => {
  try {
    const messages = await readMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages[messageIndex].status = status;
      await redis.set(MESSAGES_KEY, messages);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating message status:', error);
    return false;
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

  // Handle POST request to mark message as read
  if (req.method === 'POST') {
    try {
      const { messageId, status } = req.body;
      
      if (!messageId || !status) {
        return res.status(400).json({ error: 'Message ID and status required' });
      }

      const updated = await updateMessageStatus(messageId, status);
      
      if (updated) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const messages = await readMessages();
      const unreadCount = messages.filter(msg => msg.status === 'unread').length;
      
      // Return HTML page with message list
      const html = `
        <!DOCTYPE html>
        <html lang="hu">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ParkSafe - Üzenetek</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 1000px;
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
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-card h2 {
              color: #10b981;
              margin: 0;
              font-size: 32px;
            }
            .stat-card.unread h2 {
              color: #ef4444;
            }
            .stat-card p {
              color: #6b7280;
              margin: 5px 0 0 0;
            }
            .controls {
              display: flex;
              gap: 15px;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .btn {
              background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            .btn.secondary {
              background: #6b7280;
            }
            .message-list {
              display: flex;
              flex-direction: column;
              gap: 15px;
            }
            .message-item {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              transition: all 0.2s;
            }
            .message-item.unread {
              border-left: 4px solid #ef4444;
              background: #fef2f2;
            }
            .message-item.read {
              border-left: 4px solid #10b981;
              background: #f0fdf4;
            }
            .message-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
              flex-wrap: wrap;
              gap: 10px;
            }
            .message-sender {
              font-weight: 600;
              color: #1f2937;
              font-size: 16px;
            }
            .message-email {
              color: #6b7280;
              font-size: 14px;
              margin-top: 2px;
            }
            .message-date {
              color: #9ca3af;
              font-size: 14px;
            }
            .message-status {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-unread {
              background: #fee2e2;
              color: #dc2626;
            }
            .status-read {
              background: #dcfce7;
              color: #16a34a;
            }
            .message-content {
              color: #374151;
              line-height: 1.6;
              margin-top: 15px;
              white-space: pre-wrap;
            }
            .message-actions {
              margin-top: 15px;
              display: flex;
              gap: 10px;
            }
            .btn-small {
              padding: 6px 12px;
              font-size: 12px;
            }
            .no-messages {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
            }
            @media (max-width: 768px) {
              .container {
                padding: 20px;
                margin: 10px;
              }
              .message-header {
                flex-direction: column;
                align-items: flex-start;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>💬 ParkSafe Üzenetek</h1>
            
            <div class="stats">
              <div class="stat-card">
                <h2>${messages.length}</h2>
                <p>Összes üzenet</p>
              </div>
              <div class="stat-card unread">
                <h2>${unreadCount}</h2>
                <p>Olvasatlan üzenet</p>
              </div>
            </div>

            <div class="controls">
              <button class="btn" onclick="location.reload()">🔄 Frissítés</button>
              <a href="/api/admin" class="btn secondary">📧 Email lista</a>
              <button class="btn secondary" onclick="markAllAsRead()">✅ Összes megjelölése olvasottként</button>
            </div>

            ${messages.length > 0 ? `
              <div class="message-list">
                ${messages.map(message => `
                  <div class="message-item ${message.status}" id="message-${message.id}">
                    <div class="message-header">
                      <div class="message-info">
                        <div class="message-sender">${message.name}</div>
                        <div class="message-email">${message.email}</div>
                      </div>
                      <div class="message-meta">
                        <div class="message-date">${new Date(message.createdAt).toLocaleString('hu-HU')}</div>
                        <span class="message-status status-${message.status}">${message.status === 'unread' ? 'olvasatlan' : 'olvasott'}</span>
                      </div>
                    </div>
                    <div class="message-content">${message.message}</div>
                    ${message.status === 'unread' ? `
                      <div class="message-actions">
                        <button class="btn btn-small" onclick="markAsRead('${message.id}')">✅ Megjelölés olvasottként</button>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="no-messages">
                📭 Még nincsenek üzenetek
              </div>
            `}
          </div>

          <script>
            async function markAsRead(messageId) {
              try {
                const response = await fetch('/api/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ messageId, status: 'read' })
                });

                if (response.ok) {
                  location.reload();
                } else {
                  alert('Hiba történt az üzenet megjelölése során');
                }
              } catch (error) {
                alert('Hálózati hiba történt');
              }
            }

            async function markAllAsRead() {
              const unreadMessages = document.querySelectorAll('.message-item.unread');
              
              if (unreadMessages.length === 0) {
                alert('Nincsenek olvasatlan üzenetek');
                return;
              }

              if (!confirm(\`Biztosan meg szeretnéd jelölni mind a \${unreadMessages.length} üzenetet olvasottként?\`)) {
                return;
              }

              for (let messageElement of unreadMessages) {
                const messageId = messageElement.id.replace('message-', '');
                try {
                  await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messageId, status: 'read' })
                  });
                } catch (error) {
                  console.error('Error marking message as read:', error);
                }
              }
              
              location.reload();
            }
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
      
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