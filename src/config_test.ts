import { normalizeConfig, sortRules, loadConfig } from './config.ts'
import { assertEquals } from 'https://deno.land/std@0.56.0/testing/asserts.ts'
import config from './config_test.uapi.map.ts'

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

Deno.test('loadConfig', async () => {
  let testConfigFilepath = new URL('./config_test.uapi.map.ts', import.meta.url)
    .href
  let c = await loadConfig(testConfigFilepath)
  assertEquals(c, config)
})
