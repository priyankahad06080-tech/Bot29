const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

const PREFIX = process.env.PREFIX || '!';
const DATA_FILE = path.join(__dirname, 'guild_data.json');

// Load or initialize guild data
let guildData = {};

function loadGuildData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      guildData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error loading guild data:', error);
      guildData = {};
    }
  }
}

function saveGuildData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(guildData, null, 2));
}

function initializeGuild(guildId) {
  if (!guildData[guildId]) {
    guildData[guildId] = {
      members: {},
      events: [],
      totalGlory: 0,
      createdAt: new Date(),
    };
    saveGuildData();
  }
  return guildData[guildId];
}

client.once('ready', () => {
  console.log(`✅ FF Guild Glory Bot is online as ${client.user.tag}`);
  client.user.setActivity('🏆 Guild Glory | !help', { type: 'WATCHING' });
  loadGuildData();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  try {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const guild = initializeGuild(message.guildId);

    // ============ GLORY COMMANDS ============
    if (command === 'glory') {
      const subcommand = args[0]?.toLowerCase();

      if (subcommand === 'add') {
        const member = args[1];
        const points = parseInt(args[2]);

        if (!member || isNaN(points) || points < 0) {
          const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Invalid Command')
            .setDescription('Usage: `!glory add <member> <points>`')
            .setFooter({ text: 'Points must be a positive number' });
          return message.reply({ embeds: [embed] });
        }

        if (!guild.members[member]) {
          guild.members[member] = {
            glory: 0,
            rank: 'Member',
            joinedAt: new Date(),
            contributions: [],
          };
        }

        guild.members[member].glory += points;
        guild.totalGlory += points;
        guild.members[member].contributions.push({
          type: 'glory_add',
          amount: points,
          date: new Date(),
          by: message.author.username,
        });

        saveGuildData();

        const embed = new EmbedBuilder()
          .setColor('#51CF66')
          .setTitle('✨ Glory Added!')
          .addFields(
            { name: 'Member', value: member, inline: true },
            { name: 'Points Added', value: `+${points}`, inline: true },
            { name: 'Total Glory', value: `${guild.members[member].glory}`, inline: true }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }

      if (subcommand === 'leaderboard') {
        const sorted = Object.entries(guild.members)
          .sort((a, b) => b[1].glory - a[1].glory)
          .slice(0, 10);

        if (sorted.length === 0) {
          return message.reply('📊 No members with glory yet!');
        }

        let description = '';
        sorted.forEach((entry, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          description += `${medal} **${entry[0]}** - ${entry[1].glory} glory\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#4C72B0')
          .setTitle('🏆 Guild Leaderboard')
          .setDescription(description)
          .setFooter({ text: `Total Guild Glory: ${guild.totalGlory}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }

      if (subcommand === 'status') {
        const member = args[1];
        if (!member || !guild.members[member]) {
          return message.reply('❌ Member not found!');
        }

        const memberData = guild.members[member];
        const embed = new EmbedBuilder()
          .setColor('#9775FA')
          .setTitle(`📊 ${member}'s Glory Status`)
          .addFields(
            { name: 'Glory Points', value: `${memberData.glory}`, inline: true },
            { name: 'Rank', value: memberData.rank, inline: true },
            { name: 'Joined', value: memberData.joinedAt.toString().split('T')[0], inline: true },
            { name: 'Contributions', value: memberData.contributions.length.toString(), inline: true }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }

      if (subcommand === 'reset') {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
          return message.reply('❌ You need administrator permissions!');
        }

        const member = args[1];
        if (!member || !guild.members[member]) {
          return message.reply('❌ Member not found!');
        }

        const oldGlory = guild.members[member].glory;
        guild.members[member].glory = 0;
        guild.totalGlory -= oldGlory;
        saveGuildData();

        message.reply(`✅ Reset ${member}'s glory from ${oldGlory} to 0`);
      }
    }

    // ============ EVENT COMMANDS ============
    if (command === 'event') {
      const subcommand = args[0]?.toLowerCase();

      if (subcommand === 'create') {
        const eventName = args.slice(1).join(' ');
        if (!eventName) {
          return message.reply('Usage: `!event create <event name>`');
        }

        const eventId = Date.now();
        guild.events.push({
          id: eventId,
          name: eventName,
          created: new Date(),
          createdBy: message.author.username,
          participants: [],
          status: 'active',
        });

        saveGuildData();

        const embed = new EmbedBuilder()
          .setColor('#FF922B')
          .setTitle('🎉 Event Created!')
          .addFields(
            { name: 'Event Name', value: eventName },
            { name: 'Created By', value: message.author.username },
            { name: 'Event ID', value: eventId.toString() }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }

      if (subcommand === 'list') {
        if (guild.events.length === 0) {
          return message.reply('📋 No events scheduled!');
        }

        let description = '';
        guild.events.forEach((event, index) => {
          description += `${index + 1}. **${event.name}** (${event.participants.length} participants) - Status: ${event.status}\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#339AF0')
          .setTitle('📋 Guild Events')
          .setDescription(description)
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }

      if (subcommand === 'join') {
        const eventId = parseInt(args[1]);
        const event = guild.events.find((e) => e.id === eventId);

        if (!event) {
          return message.reply('❌ Event not found!');
        }

        if (event.participants.includes(message.author.username)) {
          return message.reply('⚠️ You already joined this event!');
        }

        event.participants.push(message.author.username);
        saveGuildData();

        message.reply(`✅ ${message.author.username} joined "${event.name}"!`);
      }
    }

    // ============ ANNOUNCEMENT COMMANDS ============
    if (command === 'announcement') {
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('❌ You need administrator permissions!');
      }

      const announcement = args.join(' ');
      if (!announcement) {
        return message.reply('Usage: `!announcement <message>`');
      }

      const embed = new EmbedBuilder()
        .setColor('#E599F7')
        .setTitle('📢 Guild Announcement')
        .setDescription(announcement)
        .setAuthor({ name: message.author.username })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      message.reply('✅ Announcement posted!');
    }

    // ============ STATS COMMANDS ============
    if (command === 'stats') {
      const totalMembers = Object.keys(guild.members).length;
      const totalEvents = guild.events.length;
      const topMember = Object.entries(guild.members).sort((a, b) => b[1].glory - a[1].glory)[0];

      const embed = new EmbedBuilder()
        .setColor('#5C7CFA')
        .setTitle('📈 Guild Statistics')
        .addFields(
          { name: 'Total Members', value: totalMembers.toString(), inline: true },
          { name: 'Total Events', value: totalEvents.toString(), inline: true },
          { name: 'Total Glory', value: guild.totalGlory.toString(), inline: true },
          {
            name: 'Top Member',
            value: topMember ? `${topMember[0]} (${topMember[1].glory} glory)` : 'N/A',
            inline: false,
          }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }

    // ============ HELP COMMAND ============
    if (command === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('🎮 FF Guild Glory Bot Commands')
        .addFields(
          {
            name: '💎 Glory Commands',
            value:
              '`!glory add <member> <points>` - Add glory to a member\n' +
              '`!glory leaderboard` - View guild leaderboard\n' +
              '`!glory status <member>` - Check member glory status\n' +
              '`!glory reset <member>` - Reset member glory (Admin)',
            inline: false,
          },
          {
            name: '🎉 Event Commands',
            value:
              '`!event create <name>` - Create a new event\n' +
              '`!event list` - List all events\n' +
              '`!event join <event_id>` - Join an event',
            inline: false,
          },
          {
            name: '📢 Other Commands',
            value:
              '`!announcement <message>` - Post announcement (Admin)\n' +
              '`!stats` - View guild statistics\n' +
              '`!help` - Show this help message',
            inline: false,
          }
        )
        .setFooter({ text: 'Prefix: ' + PREFIX })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error processing command:', error);
    message.reply('❌ An error occurred while processing your command.');
  }
});

client.login(process.env.DISCORD_TOKEN);
