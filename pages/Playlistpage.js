// pages/PlaylistPage.js
// ─────────────────────────────────────────────────────────────────────────────
// Enterprise Page Object — Playlist Module
// Covers: Create, Delete, Add Song, Add Album, Max Limit,
//         Song Ordering, Full Playback Controls
// ─────────────────────────────────────────────────────────────────────────────

import { BasePage } from './BasePage.js';
import logger       from '../Utils/logger.js';
import { expect }   from '@playwright/test';

export class Playlistpage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // ─── Navigation ──────────────────────────────────────────────────────────
    // ⚠️ Verify: inspect sidebar/navbar for playlist link
    this.sidebarPlaylistLink =  page.locator('.nav-link:has-text("Playlist")');

    // ─── Playlist List View ───────────────────────────────────────────────────
    // ⚠️ Verify: the container holding all playlist cards
    this.playlistContainer   = page.locator('#playlistListing').first();
    this.playlistCards       = page.locator('[class*="playlist-card"], [class*="playlist-item"], [data-testid="playlist-card"]');
    this.emptyStateMsg       = page.locator('[class*="empty-state"], [class*="no-playlist"], text=/no playlist/i').first();

    // ─── Create Playlist ──────────────────────────────────────────────────────
    this.createPlaylistBtn = page.getByRole('listitem').filter({ hasText: 'Playlist' }).locator('span').first();
    this.createPlaylistBtn2 = page.getByRole('button', { name: 'add Create Playlist' }).first();
    this.playlistNameInput   =  page.getByRole('textbox', { name: 'Enter Playlist Name' }).first();
    this.confirmCreateBtn    =  page.getByRole('button', { name: 'Create PlayList' }).first();
   


    // ─── Delete Playlist ──────────────────────────────────────────────────────
    // ⚠️ Verify: delete option inside playlist card menu
    this.playlistMenuBtn = page.getByRole('button', { name: 'more_verti', exact: true }).first();
    this.deleteOption = page.getByRole('button', { name: 'delete Delete Playlist' }).first();
    this.confirmDeleteBtn   = page.getByRole('button', { name: 'Delete Playlist' }).first();
    this.deleteModal =  page.locator('.playlist-modal-list').first();
    this.modalcloseicon = page.locator('.share-heading').first();


    // ─── Add Song / Album to Playlist ────────────────────────────────────────
    // ⚠️ Verify: "Add to Playlist" button on class/song detail page
    this.addToPlaylistBtn    = page.getByRole('button', { name: 'add Add to Playlist' }).first();
    this.addToPlaylistBtn2    = page.getByRole('button', { name: 'add Add to Playlist' }).first();
     this.playlistDropdown    = page.locator('.playlist-modal-list').first();

    // ─── Song List inside Playlist ────────────────────────────────────────────
    // ⚠️ Verify: list of songs inside an opened playlist
    this.songItems           = page.locator('[class*="song-item"], [class*="track-item"], [data-testid="song-item"]');
    this.firstSongItem       = page.locator('tr.album-main-content').first();
    this.lastSongItem        = this.songItems.last();

    // Song metadata — title and artist inside first song card
    this.firstSongTitle      = page.locator('[class*="song-title"], [class*="track-title"]').first();
    this.firstSongArtist     = page.locator('[class*="song-artist"], [class*="track-artist"]').first();

    // ─── Player Controls ──────────────────────────────────────────────────────
    // ⚠️ Verify: audio player bar at bottom of the app
    this.playerBar           = page.locator('[data-testid="player-controls"]').first();
    this.playPauseBtn        = page.getByTestId('control-button-playpause');
    this.forwardBtn          = page.locator('[data-name="Fast Forward"]').first();
    this.backwardBtn         = page.locator('[data-testid="control-button-skip-back"]').first();
    this.nextBtn             = page.locator('[data-name="Next"]').first();
    this.shuffleBtn          = page.locator('button[data-name="Shuffle"]').first();
    this.progressBar         = page.locator('[data-testid="progress-bar"]').first();
    this.currentTimeEl       = page.getByTestId('playback-position').first();
    this.totalTimeEl         = page.locator('[class*="total-time"], [class*="duration"]').first();
    this.nowPlayingTitle     = page.locator('[data-testid="context-item-link"]').first();

    
    // ─── Feedback / Toast Messages ────────────────────────────────────────────
    this.successToast      =page.locator('#snackbar').first();
    this.errorToast          = page.locator('#snackbar').first();
    this.validationMsg       = page.locator('#snackbar').first();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════

  async goToPlaylistSection() {
    logger.info('Navigating to Playlist section');
    await this.createPlaylistBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.createPlaylistBtn.click();
    await this.page.waitForLoadState('networkidle');
    logger.info('Playlist section loaded');
  }

  async goToClassDetail(slug) {
    const url = `https://app.access.me/detail/albums/${slug}`;
    logger.info(`Navigating to class detail → ${url}`);
    await this.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE PLAYLIST
  // ═══════════════════════════════════════════════════════════════════════════

  async createPlaylist(name) {
    logger.info(`Creating playlist → "${name}"`);
     
    await this.createPlaylistBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.createPlaylistBtn.click();
     await this.createPlaylistBtn2.waitFor({ state: 'visible', timeout: 10_000 });
    await this.createPlaylistBtn2.click();
    await this.playlistNameInput.waitFor({ state: 'visible', timeout: 8_000 });
    await this.playlistNameInput.clear();
    await this.playlistNameInput.fill(name);

    logger.info('Submitting create form');
    await this.confirmCreateBtn.click();
  }

 async playlistExists(name) {
  try {
    const playlist = this.page.locator(
      '.playlist-listing .playlistSeprator',
      { hasText: name}).first();
     await playlist.waitFor({
      state: 'visible',
      timeout: 10000
    });
    const visible = await playlist.isVisible();
    logger.info(`Playlist "${name}" exists: ${visible}`);
    return visible;
  } catch (error) {
   logger.info(`Playlist "${name}" not found`);
     return false;
  }
}
  /**
   * Returns total count of playlist cards visible
   */
  async getPlaylistCount() {
    return await this.playlistContainer.count();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE PLAYLIST
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Opens the context menu for a playlist by name and clicks Delete
   */
  async openPlaylistMenu(name) {
    logger.info(`Opening menu for playlist → "${name}"`);
    await this.page.locator('.playlist-listing .playlistSeprator', { hasText: name })
      .first()
      .click();
    await this.page.waitForLoadState('networkidle');
    await this.playlistMenuBtn.click();
    await this.deleteOption.waitFor({ state: 'visible', timeout: 5_000 });
  }
  
  
  async deletePlaylist(name) {
    logger.info(`Deleting playlist → "${name}"`);
    await this.openPlaylistMenu(name);
    await this.deleteOption.click();
     await this.deleteModal.waitFor({ state: 'visible', timeout: 5_000 });
    await this.confirmDeleteBtn.click();
     await this.deleteModal.waitFor({ state: 'hidden', timeout: 8_000 });
    logger.info(`Playlist "${name}" deleted`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD SONG / ALBUM TO PLAYLIST
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Adds the current class/song to a named playlist via the dropdown
   */
  async addCurrentSongToPlaylist(playlistName) {
    logger.info(`Adding current song to playlist → "${playlistName}"`);
    await this.page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await  this.page.waitForTimeout(1000);
    await this.page.locator('#stickytable').getByRole('button', { name: 'more_verti more_verti' }).click();


    await this.addToPlaylistBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.addToPlaylistBtn.click();
    await this.playlistDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page
      .locator('[class*="playlist-name"]', { hasText: playlistName })
      .first()
      .click();
  }
    
  async addAlbumSongToPlaylist(playlistName) {
    logger.info(`Adding current song to playlist → "${playlistName}"`);
    await this.page.locator('app-album-detail-page').getByRole('button', { name: 'more_verti more_verti' }).click();
     await this.addToPlaylistBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.addToPlaylistBtn.click();
    await this.playlistDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page .locator('[class*="playlist-name"]', { hasText: playlistName }).first().click();
  }


  /**
   * Returns the count of songs currently inside a named playlist
   */
  async getSongCountInPlaylist(name) {
    await this.openPlaylist(name);
    const count = await this.songItems.count();
    logger.info(`Song count in "${name}": ${count}`);
    return count;
  }

  /**
   * Opens a playlist by clicking its card
   */
  async openPlaylist(name) {
    logger.info(`Opening playlist → "${name}"`);
    const card = this.page
      .locator('[class*="playlist-card"], [class*="playlist-item"]', { hasText: name })
      .first();
    await card.waitFor({ state: 'visible', timeout: 8_000 });
    await card.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Returns title of the first (top) song in the open playlist
   */
  async getFirstSongTitle() {
    await this.firstSongTitle.waitFor({ state: 'visible', timeout: 8_000 });
    return (await this.firstSongTitle.innerText()).trim();
  }



  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBACK CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Starts playback of the first song in the open playlist
   */
  async startPlayback() {
    logger.info('Starting playback');
    await this.firstSongItem.waitFor({ state: 'visible', timeout: 8_000 });
    await this.firstSongItem.dblclick();
    await this.playerBar.waitFor({ state: 'visible', timeout: 10_000 });
    logger.info('Player bar visible — playback started');
  }

  /**
   * Clicks Play/Pause button
   */
  async  togglePlayPause() {
    logger.info('Toggling Play/Pause');
    await this.playPauseBtn.waitFor({ state: 'visible', timeout: 8_000 });
    await this.playPauseBtn.click();
  }

  /**
   * Clicks the 15-second forward button
   */
  async seekForward15() {
    logger.info('Seeking forward 15 seconds');
    await this.forwardBtn.waitFor({ state: 'visible', timeout: 8_000 });
    await this.forwardBtn.click();
  }

  /**
   * Clicks the 15-second backward button
   */
  async seekBackward15() {
    logger.info('Seeking backward 15 seconds');
    await this.backwardBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await expect(this.backwardBtn).toBeEnabled();
    await this.backwardBtn.click();
  }

  /**
   * Clicks the Next Song button
   */
  async nextSong() {
    logger.info('Navigating to next song');
    await this.nextBtn.waitFor({ state: 'visible', timeout: 8_000 });
    await this.nextBtn.click();
  }

  /**
   * Toggles shuffle on or off
   */
  async toggleShuffle() {
    logger.info('Toggling shuffle');
    await this.shuffleBtn.waitFor({ state: 'visible', timeout: 8_000 });
    await this.shuffleBtn.click();
  }

  /**
   * Returns true if shuffle is currently active
   * Checks for aria-pressed="true" or active class on the shuffle button
   */
  async isShuffleActive() {
    const pressed = await this.shuffleBtn.getAttribute('aria-pressed');
    if (pressed !== null) return pressed === 'true';
    const cls = await this.shuffleBtn.getAttribute('class') ?? '';
    return cls.includes('active') || cls.includes('enabled');
  }

  /**
   * Returns the current playback time as total seconds
   */
  // async getCurrentTimeSeconds() {
  //   await this.currentTimeEl.waitFor({ state: 'visible', timeout: 8_000 });
  //   const text = await this.currentTimeEl.innerText();
  //   const [m, s] = text.trim().split(':').map(Number);
  //   return m * 60 + s;
  // }

  async getCurrentTimeSeconds() {
  const text = (await this.currentTimeEl.textContent()).trim();

  const parts = text.split(':').map(v => parseInt(v.trim(), 10));

  return (parts[0] * 60) + parts[1];
}

  /**
   * Returns the now-playing song title from the player bar
   */
  async getNowPlayingTitle() {
  await this.nowPlayingTitle.waitFor({ state: 'visible', timeout: 8000 });

  const text = await this.nowPlayingTitle.textContent();
  return (text || '').trim();
}

  /**
   * Returns true if the player bar is visible (player is active)
   */
  async isPlayerActive() {
    try {
      await this.playerBar.waitFor({ state: 'visible', timeout: 6_000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns true if audio is currently playing
   * Checks aria-label of play/pause button
   */
  // async  isPlaying() {
  //   const label = (await this.playPauseBtn.getAttribute('aria-label') ?? '').toLowerCase();
  //   return label.includes('pause');
  // }
    async isPlaying() { return (await this.playPauseBtn.getAttribute('data-name')) === 'Pause'; }
  

  // ═══════════════════════════════════════════════════════════════════════════
  // FEEDBACK HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  async getSuccessToastText() {
    await this.successToast.waitFor({ state: 'visible', timeout: 8_000 });
    return (await this.successToast.innerText()).toLowerCase().trim();
  }

  async getErrorText() {
    // Try toast first, then inline validation
    try {
      await this.errorToast.waitFor({ state: 'visible', timeout: 5_000 });
      return (await this.errorToast.innerText()).toLowerCase().trim();
    } catch {
      await this.validationMsg.waitFor({ state: 'visible', timeout: 5_000 });
      return (await this.validationMsg.innerText()).toLowerCase().trim();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENSHOT OVERRIDE — ensure reports/screenshots dir exists
  // ═══════════════════════════════════════════════════════════════════════════

  async screenshot(name) {
    const file = `reports/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: file, fullPage: true });
    logger.warn(`Screenshot → ${file}`);
  }
}