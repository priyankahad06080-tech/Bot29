# FF Guild Glory Bot - Deployment Guide

## Quick Start

### 1. Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "FF Guild Glory Bot"
3. Go to the "Bot" section and click "Add Bot"
4. Under TOKEN, click "Copy" to copy your bot token
5. Keep this token safe - never share it publicly!

### 2. Invite Bot to Your Server

1. Go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Add Reactions
4. Copy the generated URL and open it in browser
5. Select your guild and authorize

### 3. Setup on Your Machine

```bash
# Clone the repository
git clone https://github.com/priyankahad06080-tech/Bot29.git
cd Bot29

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Discord token
# DISCORD_TOKEN=your_token_here
```

### 4. Run the Bot

```bash
npm start
```

You should see: `✅ FF Guild Glory Bot is online as [BotName]#0000`

## Deployment Options

### Option 1: Heroku Deployment

1. Install Heroku CLI
2. Create a Procfile:
```
worker: node index.js
```

3. Deploy:
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku ps:scale worker=1
```

### Option 2: Keep it Running (Using PM2)

```bash
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name "ff-guild-bot"

# Make it auto-restart on reboot
pm2 startup
pm2 save
```

### Option 3: VPS/Server Deployment

1. SSH into your server
2. Clone the repository
3. Install Node.js and npm
4. Follow setup steps above
5. Use a process manager like PM2 or systemd

## Bot Commands

### Glory Management
- `!glory add <member> <points>` - Add glory points
- `!glory leaderboard` - View top members
- `!glory status <member>` - Check member stats
- `!glory reset <member>` - Reset member glory (Admin)

### Events
- `!event create <name>` - Create event
- `!event list` - List all events
- `!event join <event_id>` - Join event

### Admin Commands
- `!announcement <message>` - Post announcement
- `!stats` - View guild statistics

### Help
- `!help` - Show all commands

## Troubleshooting

**Bot not responding?**
- Check if token is correct in .env
- Verify bot has message permissions in channel
- Check console for errors

**Bot offline?**
- Make sure the process is still running
- Check `pm2 logs` or console output

**Data not saving?**
- Ensure bot has write permissions in directory
- Check guild_data.json file exists

## Support

For issues, create an issue in the GitHub repository or check the logs for error messages.