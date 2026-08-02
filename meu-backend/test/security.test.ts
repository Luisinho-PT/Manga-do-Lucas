import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { createUserRateLimit } from '../src/middleware/userRateLimitMiddleware';
import { getDiscordId, getDisplayName, getProviderAvatar } from '../src/utils/auth';

function userWithIdentities(identities: User['identities']): User {
  return {
    id: 'user-123',
    app_metadata: {},
    user_metadata: { full_name: 'Nome controlado no cliente' },
    aud: 'authenticated',
    created_at: new Date(0).toISOString(),
    identities,
  } as User;
}

test('usa identidade OAuth confiável para nome, avatar e ID do Discord', () => {
  const user = userWithIdentities([{
    id: 'identity-1',
    identity_id: 'identity-1',
    user_id: 'user-123',
    identity_data: {
      provider_id: '123456789012345678',
      full_name: '  Nome\nDiscord  ',
      avatar_url: 'https://cdn.discordapp.com/avatar.png',
    },
    provider: 'discord',
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  }]);

  assert.equal(getDiscordId(user), '123456789012345678');
  assert.equal(getDisplayName(user), 'NomeDiscord');
  assert.equal(getProviderAvatar(user), 'https://cdn.discordapp.com/avatar.png');
});

test('rejeita identificador Discord e avatar inseguros', () => {
  const user = userWithIdentities([{
    id: 'identity-1',
    identity_id: 'identity-1',
    user_id: 'user-123',
    identity_data: { provider_id: '../admin', avatar_url: 'javascript:alert(1)' },
    provider: 'discord',
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  }]);

  assert.equal(getDiscordId(user), null);
  assert.equal(getProviderAvatar(user), null);
});

test('limita ações autenticadas por usuário', () => {
  const middleware = createUserRateLimit({ max: 2, windowMs: 60_000, message: 'Limite atingido.' });
  const statuses: number[] = [];
  const payloads: unknown[] = [];
  const headers = new Map<string, string>();
  let nextCalls = 0;
  const request = { user: { id: 'user-123' } } as Request;
  const response = {
    set(name: string, value: string) { headers.set(name, value); return this; },
    status(code: number) { statuses.push(code); return this; },
    json(payload: unknown) { payloads.push(payload); return this; },
  } as unknown as Response;
  const next = (() => { nextCalls += 1; }) as NextFunction;

  middleware(request, response, next);
  middleware(request, response, next);
  middleware(request, response, next);

  assert.equal(nextCalls, 2);
  assert.deepEqual(statuses, [429]);
  assert.deepEqual(payloads, [{ error: 'Limite atingido.' }]);
  assert.equal(headers.get('RateLimit-Remaining'), '0');
});
