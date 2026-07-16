import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import axeCore from 'axe-core';

const port = 4173;
const url = `http://127.0.0.1:${port}`;
const viteBin = new URL('../node_modules/vite/bin/vite.js', import.meta.url);
const outputDir = new URL('../test-results/', import.meta.url);

async function waitForServer(timeout = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Retry while Vite starts.
    }
    await delay(200);
  }
  throw new Error('O preview Vite não arrancou a tempo.');
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const exited = once(server, 'exit').then(() => true);
  server.kill('SIGTERM');
  const stopped = await Promise.race([exited, delay(4_000).then(() => false)]);
  if (!stopped && server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
}

async function assertAxe(page, name) {
  await page.addScriptTag({ content: axeCore.source });
  const violations = await page.evaluate(async () => {
    const result = await window.axe.run(document);
    return result.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      targets: nodes.map((node) => node.target),
    }));
  });
  if (violations.length) throw new Error(`Axe ${name}: ${JSON.stringify(violations, null, 2)}`);
}

async function checkViewport(browser, name, viewport, mobile = false) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  const response = await page.goto(url, { waitUntil: 'load' });
  if (!response?.ok()) throw new Error(`HTTP inválido em ${name}.`);
  await page.locator('h1').waitFor({ state: 'visible' });

  await page.locator('img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(180);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete), undefined, { timeout: 10_000 });
  await page.evaluate(() => window.scrollTo(0, 0));

  const diagnostics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    brokenImages: [...document.images].filter((image) => image.naturalWidth === 0).map((image) => image.src),
    robots: document.querySelector('meta[name="robots"]')?.content,
    title: document.title,
  }));
  if (diagnostics.scrollWidth > diagnostics.viewportWidth + 1) throw new Error(`Overflow em ${name}: ${JSON.stringify(diagnostics)}`);
  if (diagnostics.brokenImages.length) throw new Error(`Imagens inválidas em ${name}: ${diagnostics.brokenImages.join(', ')}`);
  if (diagnostics.robots !== 'noindex,nofollow') throw new Error(`Robots inválido em ${name}: ${diagnostics.robots}`);
  if (!diagnostics.title.includes('Restaurante Sampaio')) throw new Error(`Título inválido em ${name}.`);

  const expectedLinks = [
    'tel:+351' + '255534540',
    'https://ementa.restaurantesampaio.pt/',
    'https://g.page/restaurantesampaio-pt?share',
    'https://g.page/restaurantesampaio-pt/review?rc',
    'https://restaurantesampaio.pt/',
    'https://facebook.com/restaurantesampaiopt',
    'https://www.instagram.com/restaurantesampaio',
  ];
  for (const href of expectedLinks) {
    if ((await page.locator(`a[href="${href}"]`).count()) === 0) throw new Error(`Link em falta em ${name}: ${href}`);
  }

  if (mobile) {
    const toggle = page.locator('.nav-toggle');
    await toggle.click();
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') throw new Error('O menu móvel não abriu.');
    await page.locator('#primary-navigation').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.locator('#primary-navigation').waitFor({ state: 'hidden' });
    if ((await toggle.getAttribute('aria-expanded')) !== 'false') throw new Error('O menu móvel não fechou com Escape.');
    if (!(await page.locator('.mobile-actions').isVisible())) throw new Error('Ações rápidas móveis invisíveis.');
  }

  await assertAxe(page, name);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: new URL(`${name}.png`, outputDir).pathname, fullPage: true });
  if (runtimeErrors.length) throw new Error(`Erros de runtime em ${name}: ${runtimeErrors.join(' | ')}`);
  await context.close();
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const server = spawn(process.execPath, [viteBin.pathname, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CI: '1' },
  });

  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    try {
      await checkViewport(browser, 'desktop-1440', { width: 1440, height: 1000 });
      await checkViewport(browser, 'tablet-768', { width: 768, height: 1024 });
      await checkViewport(browser, 'mobile-375', { width: 375, height: 812 }, true);

      const noJs = await browser.newContext({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });
      const noJsPage = await noJs.newPage();
      const response = await noJsPage.goto(url, { waitUntil: 'load' });
      if (!response?.ok() || !(await noJsPage.locator('h1').isVisible()) || !(await noJsPage.locator('#primary-navigation').isVisible())) {
        throw new Error('A página não degrada corretamente sem JavaScript.');
      }
      await noJs.close();
    } finally {
      await browser.close();
    }
  } finally {
    await stopServer(server);
  }

  console.log('Visual QA: desktop, tablet, mobile, sem JS, links, imagens e Axe — OK');
  console.log(`Screenshots: ${new URL('desktop-1440.png', outputDir).pathname} e ${new URL('mobile-375.png', outputDir).pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
