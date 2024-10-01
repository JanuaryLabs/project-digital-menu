import { defineConfig } from '@january/canary';
import { fly } from '@january/extensions/fly';
import { hono } from '@january/extensions/hono';
import { identity } from '@january/extensions/identity';
import { postgresql, typeorm } from '@january/extensions/typeorm';

export default defineConfig({
  extensions: [
    identity,
    hono,
    fly,
    typeorm({
      database: postgresql(),
    }),
  ],
});