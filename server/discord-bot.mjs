import { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import bcrypt from 'bcryptjs';
import { getDatabase } from './lib/db-instance.mjs';
import { randomBytes } from 'crypto';
import { SERVER_CONFIG } from './config.mjs';

const db = getDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

function generateRandomUsername() {
  const adjectives = ['Swift', 'Brave', 'Silent', 'Dark', 'Bright', 'Epic', 'Wild', 'Cool', 'Fire', 'Ice'];
  const nouns = ['Dragon', 'Tiger', 'Wolf', 'Eagle', 'Phoenix', 'Ninja', 'Warrior', 'Knight', 'Hunter', 'Storm'];
  const randomNum = Math.floor(Math.random() * 9999);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${randomNum}`;
}

function generateRandomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomValues = randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  return password;
}

async function createTemporaryAccount(discordUserId, discordUsername) {
  try {
    const existingAccount = await db.get(
      `SELECT * FROM users WHERE discord_id = ? AND expires_at > datetime('now')`,
      [discordUserId]
    );

    if (existingAccount) {
      const timeLeft = new Date(existingAccount.expires_at).getTime() - Date.now();
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return {
        success: false,
        message: `Tu as déjà un compte actif!\n\n**Username:** ${existingAccount.username}\n**Expire dans:** ${hoursLeft}h ${minutesLeft}m`
      };
    }

    const username = generateRandomUsername();
    const password = generateRandomPassword();
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.run(
      `INSERT INTO users (id, username, password_hash, role, discord_id, discord_username, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, passwordHash, 'viewer', discordUserId, discordUsername, expiresAt.toISOString(), 1]
    );

    await db.addActivityLog({
      action_type: 'ACCOUNT_CREATED',
      username: username,
      ip_address: '',
      fingerprint: discordUserId,
      details: { discord_username: discordUsername, expires_at: expiresAt.toISOString() },
      severity: 'low',
      admin_username: 'discord-bot'
    });

    return {
      success: true,
      username,
      password,
      expiresAt
    };
  } catch (error) {
    console.error('Erreur création compte:', error);
    return {
      success: false,
      message: 'Erreur lors de la création du compte. Réessaye plus tard.'
    };
  }
}

client.once('clientReady', () => {
  console.log(`✅ Bot Discord connecté: ${client.user.tag}`);
  console.log('🤖 Commandes disponibles: /account');

  const commands = [
    new SlashCommandBuilder()
      .setName('account')
      .setDescription('Génère un compte temporaire de 24h pour le stream')
      .toJSON()
  ];

  client.application.commands.set(commands).then(() => {
    console.log('✅ Slash commands enregistrées');
  }).catch(console.error);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'account') {
    await interaction.deferReply({ flags: 64 }); // 64 = EPHEMERAL flag

    const result = await createTemporaryAccount(
      interaction.user.id,
      interaction.user.username
    );

    if (!result.success) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('❌ Compte Existant')
        .setDescription(result.message)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const dmEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Compte Temporaire Créé !')
      .setDescription('Voici tes identifiants pour accéder au stream :')
      .addFields(
        { name: '👤 Username', value: `\`${result.username}\``, inline: true },
        { name: '🔑 Password', value: `\`${result.password}\``, inline: true },
        { name: '⏰ Expire le', value: `<t:${Math.floor(result.expiresAt.getTime() / 1000)}:F>`, inline: false },
        { name: '⚠️ Important', value: '• Ces identifiants sont **temporaires** (24h)\n• Ne les partage avec **personne**\n• Connecte-toi sur le site du stream', inline: false }
      )
      .setFooter({ text: 'Compte valide pendant 24 heures' })
      .setTimestamp();

    try {
      await interaction.user.send({ embeds: [dmEmbed] });

      const confirmEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Compte Créé')
        .setDescription('Tes identifiants ont été envoyés en **message privé** !')
        .addFields(
          { name: 'ℹ️ Note', value: 'Vérifie tes DMs. Si tu ne reçois rien, active les messages privés.' }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [confirmEmbed] });

    } catch (error) {
      console.error('Erreur envoi DM:', error);

      const fallbackEmbed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('⚠️ Impossible d\'envoyer en DM')
        .setDescription('**Tes identifiants :**')
        .addFields(
          { name: '👤 Username', value: `\`${result.username}\``, inline: true },
          { name: '🔑 Password', value: `\`${result.password}\``, inline: true },
          { name: '⏰ Expire le', value: `<t:${Math.floor(result.expiresAt.getTime() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: '⚠️ Supprime ce message après avoir noté tes identifiants !' })
        .setTimestamp();

      await interaction.editReply({ embeds: [fallbackEmbed] });
    }
  }
});

async function cleanupExpiredAccounts() {
  try {
    const expiredAccounts = await db.all(
      `SELECT * FROM users WHERE expires_at IS NOT NULL AND expires_at <= datetime('now') AND is_active = 1`
    );

    for (const account of expiredAccounts) {
      await db.run('DELETE FROM users WHERE id = ?', [account.id]);

      await db.addActivityLog({
        action_type: 'ACCOUNT_EXPIRED',
        username: account.username,
        ip_address: '',
        fingerprint: account.discord_id || '',
        details: { discord_username: account.discord_username, expired_at: new Date().toISOString() },
        severity: 'low',
        admin_username: 'discord-bot'
      });

      console.log(`🗑️  Compte expiré supprimé: ${account.username} (Discord: ${account.discord_username})`);
    }

    if (expiredAccounts.length > 0) {
      console.log(`✅ ${expiredAccounts.length} compte(s) expiré(s) supprimé(s)`);
    }
  } catch (error) {
    console.error('Erreur cleanup comptes expirés:', error);
  }
}

setInterval(cleanupExpiredAccounts, 5 * 60 * 1000);

client.on('error', console.error);
client.on('warn', console.warn);

const DISCORD_TOKEN = SERVER_CONFIG.DISCORD_BOT_TOKEN;

if (!DISCORD_TOKEN || DISCORD_TOKEN === 'your_discord_bot_token_here') {
  console.error('❌ DISCORD_BOT_TOKEN manquant dans config.mjs !');
  console.error('💡 Ouvrez server/config.mjs et remplacez "your_discord_bot_token_here" par votre token Discord');
  console.error('💡 Pour obtenir un token: https://discord.com/developers/applications');
  process.exit(1);
}

client.login(DISCORD_TOKEN).catch(error => {
  console.error('❌ Erreur connexion Discord:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du bot Discord...');
  await client.destroy();
  db.close();
  process.exit(0);
});

export default client;
