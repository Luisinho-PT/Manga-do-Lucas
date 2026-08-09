import type { User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { canAccessSecret, getVerifiedDiscordId, SECRET_OWNER_DISCORD_ID } from '../secretAccess';

jest.mock('@supabase/ssr', () => ({ createServerClient: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));

const mockedCreateServerClient = jest.mocked(createServerClient);
const mockedCookies = jest.mocked(cookies);

function discordUser(providerId: string): User {
  return {
    id: 'supabase-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-08-09T00:00:00.000Z',
    identities: [{
      id: providerId,
      user_id: 'supabase-user-id',
      identity_data: { provider_id: providerId },
      provider: 'discord',
      created_at: '2026-08-09T00:00:00.000Z',
      updated_at: '2026-08-09T00:00:00.000Z',
    }],
  } as User;
}

describe('secretAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    mockedCookies.mockResolvedValue({ getAll: () => [] } as never);
  });

  it('extrai somente o ID de uma identidade Discord verificada', () => {
    expect(getVerifiedDiscordId(discordUser(SECRET_OWNER_DISCORD_ID))).toBe(SECRET_OWNER_DISCORD_ID);
    expect(getVerifiedDiscordId({
      ...discordUser('111111111111111111'),
      identities: [],
      user_metadata: { provider_id: SECRET_OWNER_DISCORD_ID },
    })).toBeNull();
  });

  it('autoriza exclusivamente o Discord configurado como proprietário', async () => {
    mockedCreateServerClient.mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: discordUser(SECRET_OWNER_DISCORD_ID) }, error: null }) },
    } as never);

    await expect(canAccessSecret()).resolves.toBe(true);
  });

  it('nega outro Discord e sessões inválidas', async () => {
    const getUser = jest.fn()
      .mockResolvedValueOnce({ data: { user: discordUser('111111111111111111') }, error: null })
      .mockResolvedValueOnce({ data: { user: null }, error: new Error('invalid session') });
    mockedCreateServerClient.mockReturnValue({ auth: { getUser } } as never);

    await expect(canAccessSecret()).resolves.toBe(false);
    await expect(canAccessSecret()).resolves.toBe(false);
  });
});
