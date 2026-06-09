# FF Guild Glory Bot

A Discord bot for managing Final Fantasy guild activities and glory tracking.

## Features

- **Glory Tracking**: Track and display guild member glory points
- **Member Management**: Manage guild members and their contributions
- **Leaderboards**: Display top performers and guild rankings
- **Announcements**: Post guild announcements and updates
- **Event Management**: Create and manage guild events

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Discord.js library
- A Discord server for your guild
- Discord Bot Token

## Installation

1. Clone the repository:
```bash
git clone https://github.com/priyankahad06080-tech/Bot29.git
cd Bot29
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your bot token:
```
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
```

## Usage

1. Start the bot:
```bash
npm start
```

2. Use commands in your Discord server:
```
!glory add <member> <points>  - Add glory points to a member
!glory leaderboard           - Display guild leaderboard
!glory status <member>       - Check member's glory status
!event create <name>         - Create a new guild event
!announcement <message>      - Post guild announcement
```

## Configuration

Edit `config.json` to customize:
- Guild ID
- Role assignments
- Glory point multipliers
- Event settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
