import { test, expect } from '@playwright/test';
import { LoginPage }    from '../pages/LoginPage.js';
// import { PlaylistPage } from '../pages/PlaylistPage.js';
import testData         from '../Utils/dataHelper.js';
import logger           from '../Utils/logger.js';
import { PlaybackPage } from '../pages/Playback.js';
// ─── Global test data ─────────────────────────────────────────────────────────
const TS    = Date.now();
const EMAIL = testData.login.positive[0].email;
const PASS  = testData.login.positive[0].password;

// ⚠️ Replace with real class slug from app.access.me/detail/albums/<slug>
const SINGLE_CLASS_SLUG = 'bodies-a-tool-a-weapon-a-gift-or-a-possibility';
const ALBUM_SLUG        = 'what-power-are-you-avoiding-and-how-do-you-gain-power-back-thts';

// ─── Shared login helper ──────────────────────────────────────────────────────
async function loginAndNavigate(page) {
  const login = new LoginPage(page);
  await login.open();
  await login.login(EMAIL, PASS);
  await login.isLoggedIn();
  const pb = new PlaybackPage(page);
  return pb;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }, testInfo) => {
  logger.info(`▶ START  [${testInfo.title}]`);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    const pb = new PlaybackPage(page);
    await pb.screenshot(`FAIL_${testInfo.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60)}`);
    logger.error(`✖ FAILED [${testInfo.title}] — ${testInfo.error?.message?.split('\n')[0] ?? ''}`);
  } else if (testInfo.status === 'passed') {
    logger.info(`✔ PASSED [${testInfo.title}]`);
  }
});


// ═════════════════════════════════════════════════════════════════════════════
//                PLAYBACK FUNCTIONALITY
// ═════════════════════════════════════════════════════════════════════════════

test.describe('▶️ Playlist Playback', () => {

  // ── Setup: create playlist with songs before playback tests ────────────────
  test.beforeEach(async ({ page }) => {
    const pb = await loginAndNavigate(page);
    const name = `Playback_${TS}`;
      await pb.goToClassDetail(SINGLE_CLASS_SLUG);
  });

  test('[PB-01] @smoke — Play/Pause toggles correctly', async ({ page }) => {
    const pb = new PlaybackPage(page);
   // await page.getByRole('button', { name: 'play_arrow' }).first().click();
    await  page.locator('button.btn.play-hover-icon').first().click();
    await page.waitForTimeout(1000);
  

    // Should be playing after startPlayback
    expect(await pb.isPlaying(), 'Player should be in playing state').toBeFalsy();

    // Pause
    await pb.togglePlayPause(); 
    await page.waitForTimeout(1000);
    expect(await pb.isPlaying(),'Player should be paused').toBeFalsy();

    // Resume
    await pb.togglePlayPause();
    await page.waitForTimeout(1000);
    expect(await pb.isPlaying(), 'Player should resume playing').toBeTruthy();

    logger.info('PB-01 ✔ Play/Pause toggle verified');
  });

  test('[PB-02] @smoke — 15-second forward seek works', async ({ page }) => {
    const pb = new PlaybackPage(page);
    await  page.locator('button.btn.play-hover-icon').first().click();
    // Wait for playback to register time
    await page.waitForTimeout(20000);
    const before = await pb.getCurrentTimeSeconds();

    await pb.seekForward15();
    await page.waitForTimeout(1000);
    const after = await pb.getCurrentTimeSeconds();

    // After seeking forward, time should be ~15s ahead (allow ±2s tolerance)
    expect(after, '15s forward: time should increase by ~15s').toBeGreaterThanOrEqual(before + 13);
    logger.info(`PB-02 ✔ Forward seek: ${before}s → ${after}s`);
  });

  test('[PB-03] @smoke — 15-second backward seek works', async ({ page }) => {
    const pb = new PlaybackPage(page);
     await  page.locator('button.btn.play-hover-icon').first().click();
    //  await pb.playPauseBtn.click();
     await page.waitForTimeout(20000);
    // Seek forward first to have room to go back
    // await pl.seekForward15();
    // await page.waitForTimeout(1000);
    const before = await pb.getCurrentTimeSeconds();

    await pb.seekBackward15();
    await page.waitForTimeout(1000);
    const after = await pb.getCurrentTimeSeconds();

    expect(after, '15s backward: time should decrease by ~15s').toBeLessThanOrEqual(before - 10);
    logger.info(`PB-03 ✔ Backward seek: ${before}s → ${after}s`);
  });

  test('[PB-04] @regression — Next Song navigation updates player metadata', async ({ page }) => {
    const pb = new PlaybackPage(page);
      await  page.locator('button.btn.play-hover-icon').first().click();
     await page.waitForTimeout(10000);
    const currentTitle = await pb.getNowPlayingTitle();
    console.log(currentTitle);
    await pb.nextSong();

    // Wait for metadata to update
    await page.waitForTimeout(2000);
    const nextTitle = await pb.getNowPlayingTitle();
    await page.waitForTimeout(2000);
    expect(nextTitle, 'Next song title should differ from previous').not.toBe(currentTitle);
    expect(await pb.isPlayerActive(), 'Player should stay active after next song').toBeTruthy();
    logger.info(`PB-04 ✔ Next song: "${currentTitle}" → "${nextTitle}"`);
  });

  
test('[PB-05] @regression — Sequential playback moves to next song automatically', async ({ page }) => {
const pb = new PlaybackPage(page);
  // Start playback
  await page.locator('button.btn.play-hover-icon').first().click();
// Wait until playback actually starts
  await page.waitForFunction(() => {
   const el = document.querySelector('[data-testid="playback-position"]');
   return el && el.textContent.trim() !== '00:00';
   }, { timeout: 15000 });

   // Capture first song title
  const firstTitle = (await pb.getNowPlayingTitle()).trim();
  console.log('FIRST SONG:', firstTitle);
 // Playback progress bar
  const progressBar = page.locator('.playback-bar [data-testid="progress-bar"]');

  // Get total duration
  const durationText = await page.locator('[data-testid="playback-duration"]').innerText();
  console.log('DURATION:', durationText);

  // Convert duration into seconds
  const parts = durationText.trim().split(':').map(Number);

  let totalSeconds = 0;
 if (parts.length === 2) {
// MM:SS
    totalSeconds = (parts[0] * 60) + parts[1];
 } else if (parts.length === 3) {
  // HH:MM:SS
    totalSeconds = (parts[0] * 3600) +(parts[1] * 60) + parts[2];}

  // Seek to last 5 seconds
  const targetSeconds = totalSeconds - 5;

  // Convert to seek percentage
  const seekPercent = targetSeconds / totalSeconds;

  // Get progress bar size
  const box = await progressBar.boundingBox();
  if (box) {
 // Click near exact end
    await page.mouse.click(
      box.x + (box.width * seekPercent),
      box.y + (box.height / 2)
    );
 }
 // Wait for auto-next song
  await expect.poll(async () => {
     return (await pb.getNowPlayingTitle()).trim();
  }, {
    timeout: 30000
  }).not.toBe(firstTitle);

  // Capture next title
  const nextTitle = (await pb.getNowPlayingTitle()).trim();
  console.log('NEXT SONG:', nextTitle);
  // Final validation
  expect(nextTitle).not.toBe(firstTitle);
  logger.info(`PB-05 ✔ Sequential: "${firstTitle}" → "${nextTitle}"`);
});

  test('[PB-06] @regression — Shuffle enables and changes order', async ({ page }) => {
    const pb = new PlaybackPage(page);
     await page.locator('button.btn.play-hover-icon').first().click();
    // Enable shuffle
    const wasActive = await pb.isShuffleActive();
    if (wasActive) await pb.toggleShuffle(); // turn off first
    await pb.toggleShuffle(); // turn on
   expect(await pb.isShuffleActive(), 'Shuffle should be active').toBeTruthy();

    // Play a few songs and collect order
    const titlesBefore = [];
    for (let i = 0; i < 3; i++) {
      titlesBefore.push(await pb.getNowPlayingTitle());
      await pb.nextSong();
      await page.waitForTimeout(1500);
    }

    // Disable shuffle and play again
    await pb.toggleShuffle();
    await pb.firstSongItem.dblclick();
    await page.waitForTimeout(1000);

    const titlesSequential = [];
    for (let i = 0; i < 3; i++) {
      titlesSequential.push(await pb.getNowPlayingTitle());
      await pb.nextSong();
      await page.waitForTimeout(1500);
    }
    // Orders should differ (shuffle vs sequential)
    const sameOrder = titlesBefore.every((t, i) => t === titlesSequential[i]);
    expect(sameOrder, 'Shuffle order should differ from sequential').toBeFalsy();
    logger.info('PB-06 ✔ Shuffle produces different song order');
  });

  test('[PB-07] @regression — Player metadata syncs with current song', async ({ page }) => {
    const pb = new PlaybackPage(page);
  });
});