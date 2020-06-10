import { normalizeConfig, sortRules } from './config.ts'
import { assertEquals } from 'https://deno.land/std@0.56.0/testing/asserts.ts'

const config = {
  '/a': 'a',
  'localhost/a/': 'la',
  'localhost/a': {
    '/b': 'lab',
    '/a': 'laa',
  },
  '/b': {
    '/a': 'ba',
    '/b': 'bb',
  },
}

Deno.test('normalizeConfig', () => {
  let c = normalizeConfig(config)
  let e = [
    { path: '/a', module: 'a' },
    { path: 'localhost/a/', module: 'la' },
    { path: 'localhost/a/b', module: 'lab' },
    { path: 'localhost/a/a', module: 'laa' },
    { path: '/b/a', module: 'ba' },
    { path: '/b/b', module: 'bb' },
  ]
  assertEquals(c, e)
})

Deno.test('sortRules', () => {
  let c = normalizeConfig(config)
  c = sortRules(c)
  let e = [
    { path: 'localhost/a/', module: 'la' },
    { path: 'localhost/a/b', module: 'lab' },
    { path: 'localhost/a/a', module: 'laa' },
    { path: '/a', module: 'a' },
    { path: '/b/a', module: 'ba' },
    { path: '/b/b', module: 'bb' },
  ]
  assertEquals(c, e)
})
