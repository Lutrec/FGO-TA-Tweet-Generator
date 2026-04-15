# FGO TA Tweet Generator

A fast, zero-dependency, purely client-side web utility designed for the *Fate/Grand Order* (FGO) Time Attack (TA) community. 

This tool allows players to quickly generate standardized, bilingual (English & Japanese) tweet templates for their runs, complete with event parsing, terminology translation, and direct Twitter/X integration.

## Features

* **Bilingual Output:** Generates formatted strings in English, Japanese, or both simultaneously.
* **Smart Terminology Translation:** Automatically converts FGO terminology and community slang.
* **Dynamic Data Binding:** Event stages update dynamically based on the selected FGO Event.
* **Zero Dependencies:** Built entirely with Vanilla HTML, CSS, and JavaScript. No build steps, no package managers.
* **Graceful Degradation:** Fetches data safely; if a single localization file fails, the app continues to operate with the remaining data.
* **Native Theming:** Automatically detects system Light/Dark mode preferences, alongside a manual toggle.
* **Direct-to-Twitter Intent:** Post your run directly to X/Twitter with one click.