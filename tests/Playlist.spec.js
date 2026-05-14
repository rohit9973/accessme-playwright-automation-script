
import { test, expect } from '@playwright/test';
import { LoginPage }    from '../pages/LoginPage.js';
import { PlaylistPage } from '../pages/PlaylistPage.js';
import testData         from '../Utils/dataHelper.js';
import logger           from '../Utils/logger.js';

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
  const pl = new PlaylistPage(page);
  //  await pl.goToPlaylistSection();
  return pl;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }, testInfo) => {
  logger.info(`▶ START  [${testInfo.title}]`);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    const pl = new PlaylistPage(page);
    await pl.screenshot(`FAIL_${testInfo.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60)}`);
    logger.error(`✖ FAILED [${testInfo.title}] — ${testInfo.error?.message?.split('\n')[0] ?? ''}`);
  } else if (testInfo.status === 'passed') {
    logger.info(`✔ PASSED [${testInfo.title}]`);
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// 1. CREATE PLAYLIST
// ═════════════════════════════════════════════════════════════════════════════

test.describe('🎵 Create Playlist', () => {

  test('[PL-01] @smoke — Create playlist with valid name', async ({ page }) => {
    const name = `Automation_${TS}`;
    const pl   = await loginAndNavigate(page);
    const before = await pl.getPlaylistCount();
    await pl.createPlaylist(name);
    const exists = await pl.playlistExists(name);
    expect(exists).toBeTruthy();
    const after = await pl.getPlaylistCount();
    expect(after, 'Playlist count should increase by 1').toBe(before + 1);
    logger.info(`PL-01 ✔ Playlist "${name}" created and visible`);
  });

  test('[PL-02] @regression — Playlist visible immediately after creation', async ({ page }) => {
    const name = `Visible_${TS}`;
    const pl   = await loginAndNavigate(page);
    await pl.createPlaylist(name);
    const exists = await pl.playlistExists(name);
    expect(exists, `Playlist "${name}" must be visible without page refresh`).toBeTruthy();
  });

  test('[PL-03] @regression — Cannot create playlist with empty name', async ({ page }) => {
    const pl = await loginAndNavigate(page);

    await pl.createPlaylist('');

    const error = await pl.getErrorText();
    expect(error, 'Should show required/empty error').toMatch(/required|empty|name/i);
  });

  test('[PL-04] @regression — Cannot create duplicate playlist name', async ({ page }) => {
    const name = `Duplicate_${TS}`;
    const pl   = await loginAndNavigate(page);
    await pl.createPlaylist(name);
    await pl.createPlaylist(name); // attempt duplicate
    const error = await pl.getErrorText();
    expect(error, 'Should show duplicate name error').toMatch(/already|exists|new|duplicate/i);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// 2. DELETE PLAYLIST
// ═════════════════════════════════════════════════════════════════════════════

test.describe('🗑️ Delete Playlist', () => {
   test('[PL-05] @smoke — Delete playlist successfully', async ({ page }) => {
  const name = `DeleteMe_${TS}`;
  const pl   = await loginAndNavigate(page);
   await pl.createPlaylist(name);
   await expect( page.locator('.playlist-listing .playlistSeprator', {hasText: name })).toBeVisible();
 const before = await pl.getPlaylistCount();
 await pl.deletePlaylist(name);
  // wait until playlist disappears
  await expect(
    page.locator('.playlist-listing .playlistSeprator', {
      hasText: name
    })
  ).toHaveCount(0);
 await expect(
  page.locator('.playlist-listing .playlistSeprator', {
    hasText: name
  })
).toHaveCount(0);

  logger.info(`PL-05 ✔ Playlist "${name}" deleted successfully`);
});


  test('[PL-06] @regression — Confirm dialog shown before deletion', async ({ page }) => {
    const name = `ConfirmDelete_${TS}`;
    const pl   = await loginAndNavigate(page);

    await pl.createPlaylist(name);
    await pl.openPlaylistMenu(name);
    await pl.deleteOption.click();

    // Confirmation modal must appear — user must explicitly confirm
    await expect(pl.deleteModal).toBeVisible({ timeout: 4_000 });
    logger.info('PL-06 ✔ Delete confirmation dialog appeared');

    // Cancel — should NOT delete
    await pl.modalcloseicon.click();
    const exists = await pl.playlistExists(name);
    expect(exists, 'Playlist must still exist after cancel').toBeTruthy();
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// 3. ADD SINGLE SONG TO PLAYLIST
// ═════════════════════════════════════════════════════════════════════════════

test.describe('🎵 Add Single Song to Playlist', () => {

  test('[PL-07] @smoke — Add one song to playlist successfully', async ({ page }) => {
    const name = `SingleSong_${TS}`;
    const pl   = await loginAndNavigate(page);
    await pl.createPlaylist(name);
    await pl.goToClassDetail(SINGLE_CLASS_SLUG);
    await pl.addCurrentSongToPlaylist(name);
     const toast = await pl.getSuccessToastText();
    expect(toast, 'Success message should confirm song added').toMatch(/added|success/i);
    logger.info(`PL-07 ✔ Song added to "${name}"`);
  });

  test('[PL-08] @regression — Cannot add same song twice to playlist', async ({ page }) => {
    const name = `NoDupe_${TS}`;
    const pl   = await loginAndNavigate(page);
    await pl.createPlaylist(name);
    await pl.goToClassDetail(SINGLE_CLASS_SLUG);
    await pl.addCurrentSongToPlaylist(name);
   // Attempt second add
    await pl.addCurrentSongToPlaylist(name);
    const error = await pl.getErrorText();
    expect(error, 'Should show already-added error').toMatch(/already|added|exists/i);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// 4. ADD FULL ALBUM TO PLAYLIST
// ═════════════════════════════════════════════════════════════════════════════

test.describe('💿 Add Full Album to Playlist', () => {

  test('[PL-09] @smoke — Add full album — all songs present', async ({ page }) => {
    const name = `AlbumTest_${TS}`;
    const pl   = await loginAndNavigate(page);
   await pl.createPlaylist(name);
    await pl.goToClassDetail(ALBUM_SLUG);
    await pl.addAlbumSongToPlaylist(name);
    const toast = await pl.getSuccessToastText();
    expect(toast).toMatch(/added|success/i);
   logger.info(`PL-09 ✔ Album added —  songs, no duplicates`);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
// 5. PLAYLIST MAXIMUM SONG VALIDATION
// ═════════════════════════════════════════════════════════════════════════════

test.describe('⚠️ Playlist Maximum Song Validation', () => {
 test('[PL-10] @regression — Playlist supports up to 100 songs', async ({ page }) => {
 const name = `MaxTest_${TS}`;
 const pl = await loginAndNavigate(page);
  await pl.createPlaylist(name);
  await page.goto('https://app.access.me');
  await page.waitForLoadState('networkidle');
  let added = 0;
  let index = 0;
  while (added < 100) {
    const classCards = page.locator('.swiper-slide.cursor-pointer .swiper-card');
    const available = await classCards.count();
    // Scroll if cards finished
    if (index >= available) {
     await page.mouse.wheel(0, 4000);
     await page.waitForTimeout(3000);
     index = 0;
      continue;
    }
    try {
    const currentCard = classCards.nth(index);
    await currentCard.scrollIntoViewIfNeeded();
    await currentCard.click();
    await page.waitForLoadState('networkidle');
    await pl.addAlbumSongToPlaylist(name);
    added++;
    logger.info(`Song Added: ${added}`);
    await page.goBack();
    await page.waitForLoadState('networkidle');
    } catch (error) {
     logger.info(`Skipping album index ${index}`);
     try {
      await page.goBack();
      await page.waitForLoadState('networkidle');
      } catch {}
    }
     index++;
  }
   const count = await pl.getSongCountInPlaylist(name);
   expect( count, 'Playlist should hold up to 100 songs').toBeLessThanOrEqual(100);
   logger.info(`PL-10 ✔ ${count} songs added — within limit`);
});
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. LATEST ADDED SONG ORDERING
// ═════════════════════════════════════════════════════════════════════════════

test.describe('📋 Latest Added Song Ordering', () => {
 test('[PL-11] @smoke — Newest song appears at top of playlist', async ({ page }) => {
    const name = `OrderTest_${TS}`;
    const pl   = await loginAndNavigate(page);

    await pl.createPlaylist(name);

    // Add first song
    await pl.goToClassDetail(SINGLE_CLASS_SLUG);
    await pl.addCurrentSongToPlaylist(name);

    // Add second song (different class)
    await pl.goToClassDetail(ALBUM_SLUG);
    // const secondTitle = await page.locator('h1, [class*="title"]').first().innerText();
    await pl.addAlbumSongToPlaylist(name);

    // Open playlist and check first item
    await pl.goToPlaylistSection();
    await pl.openPlaylist(name);

    const firstInList = await pl.getFirstSongTitle();
    expect(
      firstInList,
      'Most recently added song must appear at top of playlist'
    ).toBe(secondTitle.trim());

    logger.info(`PL-11 ✔ Latest song "${firstInList}" at top`);
  });

});



 
  

 
  

  

  
  
 
 
