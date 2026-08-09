/** @jest-environment node */

import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

describe('proxy mystery route', () => {
  it('reescreve /??? internamente para a tela de progresso', () => {
    const response = proxy(new NextRequest('https://manga.example/???', {
      headers: { 'user-agent': 'Mozilla/5.0' },
    }));

    expect(response.headers.get('x-middleware-rewrite')).toBe('https://manga.example/soon');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('permite que a tela intermediária seja renderizada antes de ocultar seu endereço', () => {
    const response = proxy(new NextRequest('https://manga.example/soon', {
      headers: { 'user-agent': 'Mozilla/5.0' },
    }));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('location')).toBeNull();
  });
});
