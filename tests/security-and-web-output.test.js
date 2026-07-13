import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { build } from 'vite'
import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const projectRoot = process.cwd()
let tempRoot
let sanitizerOutput
let sanitizerResult
let webOutput

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean)

  return candidates.find(candidate => existsSync(candidate))
}

async function runSanitizerInBrowser() {
  const harness = `<!doctype html><html><body><script type="module">
    import { sanitizeHtml } from './sanitize.js'
    const unsafe = sanitizeHtml('<script>alert(1)<\\/script><p onclick="steal()">Safe text</p><img src="x" onerror="steal()"><a href="javascript:steal()">bad link</a><iframe srcdoc="bad"></iframe>')
    const safe = sanitizeHtml('<p><strong>السَّلَامُ عَلَيْكُمْ</strong><br><em>Preserved formatting</em></p>')
    document.documentElement.dataset.result = encodeURIComponent(JSON.stringify({ unsafe, safe }))
  </script></body></html>`
  await writeFile(path.join(sanitizerOutput, 'harness.html'), harness)

  const server = createServer(async (request, response) => {
    const filename = request.url === '/sanitize.js' ? 'sanitize.js' : 'harness.html'
    response.setHeader('Content-Type', filename.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8')
    response.end(await readFile(path.join(sanitizerOutput, filename)))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

  try {
    const executable = chromeExecutable()
    if (!executable) throw new Error('Chrome/Chromium is required for the DOMPurify browser regression test')
    const port = server.address().port
    const { stdout } = await execFileAsync(executable, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--dump-dom',
      `http://127.0.0.1:${port}/harness.html`
    ], { maxBuffer: 1024 * 1024 })
    const match = stdout.match(/data-result="([^"]+)"/)
    if (!match) throw new Error(`Sanitizer harness did not produce a result: ${stdout}`)
    return JSON.parse(decodeURIComponent(match[1].replaceAll('&amp;', '&')))
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

beforeAll(async () => {
  tempRoot = await mkdtemp(path.join(tmpdir(), 'islamqa-invariants-'))
  sanitizerOutput = path.join(tempRoot, 'sanitizer')
  webOutput = path.join(tempRoot, 'web')

  await build({
    configFile: false,
    root: projectRoot,
    logLevel: 'silent',
    build: {
      outDir: sanitizerOutput,
      emptyOutDir: true,
      lib: {
        entry: path.join(projectRoot, 'src/utils/sanitizeHtml.js'),
        formats: ['es'],
        fileName: () => 'sanitize.js'
      }
    }
  })

  await build({
    configFile: path.join(projectRoot, 'vite.config.web.js'),
    root: projectRoot,
    logLevel: 'silent',
    build: { outDir: webOutput, emptyOutDir: true }
  })

  sanitizerResult = await runSanitizerInBrowser()
}, 30_000)

afterAll(async () => {
  if (tempRoot) await rm(tempRoot, { recursive: true, force: true })
})

describe('HTML sanitization', () => {
  test('removes executable markup and unsafe URL schemes', () => {
    const { unsafe } = sanitizerResult

    expect(unsafe).toContain('Safe text')
    expect(unsafe).not.toMatch(/<script|onerror|onclick|javascript:|<iframe|srcdoc/i)
  })

  test('preserves safe formatting and fully vocalized Arabic', () => {
    const { safe } = sanitizerResult

    expect(safe).toContain('<strong>السَّلَامُ عَلَيْكُمْ</strong>')
    expect(safe).toContain('<br>')
    expect(safe).toContain('<em>Preserved formatting</em>')
  })
})

describe('GitHub Pages web output', () => {
  test('uses base-prefixed app icons and excludes Cordova runtime loading', async () => {
    const html = await readFile(path.join(webOutput, 'index.html'), 'utf8')

    expect(html).toMatch(/href="\/islamqa\/favicon\.png"/)
    expect(html).toMatch(/href="\/islamqa\/apple-touch-icon\.png"/)
    expect(html).toMatch(/(?:src|href)="\/islamqa\/assets\//)
    expect(html).not.toMatch(/cordova\.js/i)
  })
})
