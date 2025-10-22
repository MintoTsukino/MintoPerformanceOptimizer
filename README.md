\# 🌿 Minto Performance Optimizer v1.9  

\*\*by MintoSoft\*\*



> \*“Optimization complete. System running at 120% efficiency.”\*



---



\## 🇯🇵 概要（日本語）

\*\*Minto Performance Optimizer (MPO)\*\* は、RPGツクールMZ向けの最適化レイヤです。  

マップや戦闘終了時のキャッシュを自動整理し、FPS制御や安全なGCにより安定した動作を維持します。  

\*\*MEC（Minto Engine Core）を導入していなくても単体で動作します。\*\*



\### 主な特徴

\- 💫 \*\*AutoPurge\*\*：時間やメモリ使用量に応じて自動的にキャッシュを解放  

\- ⚙️ \*\*FPS制御\*\*：アイドル時にFPSを30へ落とし、省電力化  

\- 🗺️ \*\*LazyMap / LazyImages\*\*：マップ・画像を遅延読み込みして高速化  

\- 🧹 \*\*キャッシュ自動解放\*\*：戦闘終了・マップ移動時に自動で整理  

\- 🔒 \*\*SafeGC\*\*：NW.js環境で安全にGCを呼び出し  



\### 導入方法

1\. `MintoPerformanceOptimizer.js` を `js/plugins` フォルダに配置  

2\. ツクールMZのプラグイン管理でONにする  

3\. 必要に応じてパラメータを調整（デフォルトでも十分安定）



\### プラグインコマンド

| コマンド | 説明 |

|-----------|------|

| \*\*purgeCache\*\* | キャッシュを即時解放します。 |

| \*\*setMode\*\* | 実行モード（release/dev/safe）を切り替えます。 |



\### ライセンス

このプラグインは個人・商用問わず無料で使用できます。  

クレジット表記「MintoSoft」を必ず記載してください。  

再配布の際は必ず同じライセンス文を同梱してください。



---



\## 🇬🇧 Overview (English)

\*\*Minto Performance Optimizer (MPO)\*\* is a lightweight optimization layer for \*\*RPG Maker MZ\*\*.  

It automatically clears caches after maps and battles, manages FPS for smooth performance,  

and safely triggers garbage collection in NW.js environments.  

\*\*It works standalone—MEC (Minto Engine Core) is not required.\*\*



\### Features

\- 💫 \*\*AutoPurge\*\*: Automatically frees cache by time or memory usage  

\- ⚙️ \*\*FPS Control\*\*: Reduces FPS to 30 while idle for power saving  

\- 🗺️ \*\*LazyMap / LazyImages\*\*: Deferred map and image loading for faster transitions  

\- 🧹 \*\*Auto Cache Clean\*\*: Clears cache after map change and battle end  

\- 🔒 \*\*SafeGC\*\*: Executes garbage collection safely in NW.js  



\### Installation

1\. Copy `MintoPerformanceOptimizer.js` into your project’s `js/plugins` folder  

2\. Enable it in the Plugin Manager  

3\. Adjust parameters as needed (defaults are stable)



\### Plugin Commands

| Command | Description |

|----------|-------------|

| \*\*purgeCache\*\* | Immediately clears cache data |

| \*\*setMode\*\* | Switch runtime mode (`release` / `dev` / `safe`) |



\### License

Free for personal and commercial use.  

Credit \*\*“MintoSoft”\*\* is required in your project.  

Redistribution must include the same license text.



---



> MintSoft — \*Optimizing the Future of RPG Maker.\*



