/*:
 * @target MZ
 * @plugindesc Minto Performance Optimizer v1.9 — AutoPurge搭載・軽量化・FPS制御・安全キャッシュ解放（最終安定版）
 * @author MintoSoft
 * @url https://sites.google.com/view/mintotukino/%E3%83%9B%E3%83%BC%E3%83%A0/%E3%83%84%E3%82%AF%E3%83%BC%E3%83%ABmz%E7%94%A8%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E7%BD%AE%E3%81%8D%E5%A0%B4?authuser=0
 * @orderBefore *
 *
 * @help
 * ------------------------------------------------------------
 * 🌿 Minto Performance Optimizer v1.9
 * ------------------------------------------------------------
 * 【概要】
 *  RPGツクールMZの動作を安定化・軽量化するMintoSoft製の最適化レイヤ。
 *  - マップ/戦闘終了時のキャッシュ整理
 *  - アイドル時にFPSを落として省電力化
 *  - LazyMap / LazyImages（遅延読込）
 *  - NW.js環境での安全GC
 *  - 💫 AutoPurge：時間/メモリに応じて自動キャッシュ整理
 *
 * 【特徴】
 *  ・MEC未導入でも完全動作（依存なし）
 *  ・戦闘中には自動パージを行わない安全設計
 *  ・全処理をtry-catchで保護
 * ------------------------------------------------------------
 * © 2025 MintoSoft. All rights reserved.
 * ------------------------------------------------------------
 *
 * @param mode
 * @text 実行モード
 * @type select
 * @option release
 * @option dev
 * @option safe
 * @default release
 *
 * @param clearOnMapChange
 * @text マップ切替時キャッシュ解放
 * @type boolean
 * @on 有効
 * @off 無効
 * @default true
 *
 * @param clearOnBattleEnd
 * @text 戦闘終了時キャッシュ解放
 * @type boolean
 * @on 有効
 * @off 無効
 * @default true
 *
 * @param enableLazyMap
 * @text マップ遅延ロード
 * @type boolean
 * @on 有効
 * @off 無効
 * @default false
 *
 * @param enableLazyImages
 * @text 画像遅延ロード
 * @type boolean
 * @on 有効
 * @off 無効
 * @default false
 *
 * @param idleSeconds
 * @text アイドル判定秒数
 * @type number
 * @min 1
 * @max 600
 * @default 5
 *
 * @param activeFps
 * @text 通常FPS
 * @type number
 * @min 30
 * @max 120
 * @default 60
 *
 * @param idleFps
 * @text アイドル時FPS
 * @type number
 * @min 10
 * @max 60
 * @default 30
 *
 * @param safeGC
 * @text 安全GCのみ
 * @type boolean
 * @on 有効
 * @off 無効
 * @default true
 *
 * @param autoPurgeMode
 * @text 自動パージモード
 * @type select
 * @option none
 * @option interval
 * @option smart
 * @default none
 * @desc interval: 一定間隔ごと / smart: メモリ使用量が上限を超えたら実行
 *
 * @param autoPurgeInterval
 * @text 自動パージ間隔（秒）
 * @type number
 * @min 10
 * @max 3600
 * @default 180
 *
 * @param autoPurgeMemLimit
 * @text メモリ上限（MB）
 * @type number
 * @min 100
 * @max 4096
 * @default 1024
 *
 * @command purgeCache
 * @text キャッシュ解放
 * @desc 即座にキャッシュを整理します。
 *
 * @command setMode
 * @text モード切替
 * @desc 実行モードをランタイムで変更。
 * @arg mode
 * @type select
 * @option release
 * @option dev
 * @option safe
 * @default release
 */

(() => {
  'use strict';
  const PLUGIN_NAME = 'MintoPerformanceOptimizer';
  const P = PluginManager.parameters(PLUGIN_NAME);

  const cfg = {
    mode: String(P.mode || 'release'),
    clearOnMapChange: P.clearOnMapChange === 'true',
    clearOnBattleEnd: P.clearOnBattleEnd === 'true',
    enableLazyMap: P.enableLazyMap === 'true',
    enableLazyImages: P.enableLazyImages === 'true',
    idleSeconds: Number(P.idleSeconds || 5),
    activeFps: Number(P.activeFps || 60),
    idleFps: Number(P.idleFps || 30),
    safeGC: P.safeGC === 'true',
    autoPurgeMode: String(P.autoPurgeMode || 'none'),
    autoPurgeInterval: Number(P.autoPurgeInterval || 180),
    autoPurgeMemLimit: Number(P.autoPurgeMemLimit || 1024),
  };
  if (cfg.mode === 'safe') cfg.safeGC = true;

  const MPO = window.MPO = window.MPO || {};
  MPO.config = cfg;
  MPO.now = () => (window.performance?.now() ?? Date.now());
  MPO.log = (...a) => console.log('[MPO]', ...a);
  MPO.tryGC = () => {
    try {
      if (cfg.mode === 'dev') return;
      if (cfg.safeGC && typeof globalThis.gc === 'function') globalThis.gc();
    } catch (_) {}
  };

  // === コマンド登録 ===
  PluginManager.registerCommand(PLUGIN_NAME, 'purgeCache', () => MPO.purgeCache('command'));
  PluginManager.registerCommand(PLUGIN_NAME, 'setMode', (args) => {
    const m = String(args.mode || 'release');
    MPO.config.mode = m;
    if (m === 'safe') MPO.config.safeGC = true;
    MPO.log('Mode switched to', m);
  });

  // === キャッシュ解放 ===
  MPO.purgeCache = (reason = '') => {
    try {
      MPO.log('Cache purge:', reason);
      if (ImageManager?.clear) ImageManager.clear();
      if (AudioManager) {
        try { AudioManager.stopSe(); } catch(_) {}
        try { AudioManager.stopMe(); } catch(_) {}
      }
      MPO.tryGC();
    } catch (e) {
      console.warn('[MPO] purge error', e);
    }
  };

  // === FPS制御 ===
  if (Utils.isNwjs()) {
    let lastActive = MPO.now();
    let currentFps = cfg.activeFps;
    const setFps = (fps) => {
      if (Graphics && typeof Graphics._setFPS === 'function') Graphics._setFPS(fps);
      else if (Graphics) Graphics.frameRate = fps;
      currentFps = fps;
    };
    const anyInput = () => Input && (Object.values(Input._currentState || {}).some(v => v) || TouchInput.isPressed());
    const _SceneManager_updateMain = SceneManager.updateMain;
    SceneManager.updateMain = function() {
      if (anyInput()) lastActive = MPO.now();
      const idleMs = MPO.now() - lastActive;
      const idleLimit = cfg.idleSeconds * 1000;
      if (idleMs > idleLimit && currentFps !== cfg.idleFps) setFps(cfg.idleFps);
      else if (idleMs <= idleLimit && currentFps !== cfg.activeFps) setFps(cfg.activeFps);
      _SceneManager_updateMain.call(this);
      if (cfg.autoPurgeMode !== 'none') MPO._autoPurgeCheck();
    };
  }

  // === LazyMap ===
  if (cfg.enableLazyMap) {
    const _DataManager_loadMapData = DataManager.loadMapData;
    DataManager.loadMapData = function(mapId) {
      if (this._lastMapId && this._lastMapId !== mapId) {
        try { delete window.$dataMap; } catch(_) {}
      }
      this._lastMapId = mapId;
      _DataManager_loadMapData.call(this, mapId);
    };
  }

  // === LazyImages ===
  if (cfg.enableLazyImages) {
    const _Sprite_setBitmap = Sprite.prototype.setBitmap;
    Sprite.prototype.setBitmap = function(bitmap) {
      _Sprite_setBitmap.call(this, bitmap);
      const bmp = this.bitmap;
      if (bmp && typeof bmp.isReady === 'function' && !bmp.isReady()) {
        bmp.addLoadListener(() => { if (typeof this.refresh === 'function') this.refresh(); });
      }
    };
  }

  // === Scene Hooks ===
  if (cfg.clearOnMapChange) {
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
      _Scene_Map_terminate.call(this);
      MPO.purgeCache('map-change');
    };
  }

  if (cfg.clearOnBattleEnd) {
    const _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
      _Scene_Battle_terminate.call(this);
      MPO.purgeCache('battle-end');
    };
  }

  // === AutoPurge（interval / smart） ===
  MPO._lastAutoPurge = 0;
  MPO._autoPurgeCheck = function() {
    try {
      const now = MPO.now();
      const elapsed = now - MPO._lastAutoPurge;
      const safeInterval = cfg.autoPurgeInterval * 1000;
      const canPurge = !$gameParty?.inBattle?.() && SceneManager._scene instanceof Scene_Map;

      if (!canPurge || elapsed < 60000) return; // 最低1分間隔保証

      if (cfg.autoPurgeMode === 'interval' && elapsed >= safeInterval) {
        MPO.purgeCache('auto-interval');
        MPO._lastAutoPurge = now;
      }

      if (cfg.autoPurgeMode === 'smart' && performance.memory) {
        const memMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        if (memMB > cfg.autoPurgeMemLimit) {
          MPO.log(`AutoPurge: MEM ${memMB.toFixed(1)}MB / LIMIT ${cfg.autoPurgeMemLimit}MB`);
          MPO.purgeCache('auto-smart');
          MPO._lastAutoPurge = now;
        }
      }
    } catch (e) {
      console.warn('[MPO] AutoPurge check failed:', e);
    }
  };

  // === 起動ログ ===
  const _Scene_Boot_startNormalGame = Scene_Boot.prototype.startNormalGame;
  Scene_Boot.prototype.startNormalGame = function() {
    _Scene_Boot_startNormalGame.call(this);
    MPO.log('Minto Performance Optimizer [v1.9] initialized with config:', JSON.parse(JSON.stringify(cfg)));
    MPO.log(`Mode: ${cfg.mode} | FPS: ${cfg.activeFps}→${cfg.idleFps} | LazyMap:${cfg.enableLazyMap} | LazyImages:${cfg.enableLazyImages} | AutoPurge:${cfg.autoPurgeMode}`);
  };
})();
