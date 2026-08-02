import 'dotenv/config';

type DiscordUser = {
  avatar: string | null;
};

const DiscordService = {
  async getAvatar(discordId: string): Promise<{ avatar_url: string }> {
    if (!/^\d{15,22}$/.test(discordId)) throw new Error('ID do Discord inválido.');

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) throw new Error('DISCORD_BOT_TOKEN não configurado.');

    const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      signal: AbortSignal.timeout(5_000),
      headers: {
        Authorization: `Bot ${botToken}`,
        'User-Agent': 'MangaDoLucas/1.0',
      },
    });

    if (!response.ok) throw new Error(`Erro na API do Discord: ${response.status}`);
    const userData = await response.json() as DiscordUser;

    if (userData.avatar) {
      const extension = userData.avatar.startsWith('a_') ? 'gif' : 'png';
      return { avatar_url: `https://cdn.discordapp.com/avatars/${discordId}/${userData.avatar}.${extension}?size=128` };
    }

    const defaultIndex = (BigInt(discordId) >> 22n) % 6n;
    return { avatar_url: `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png` };
  },
};

export default DiscordService;
