# Daily Note Icon

Daily Note Icon replaces the document icon in today's Daily Note tab with a
solid yellow star. The star stays yellow when the tab is active and becomes
slightly darker on hover.

The plugin follows the folder and date format configured in the Daily Notes
core plugin and updates automatically after file changes and at midnight.

## Requirements

- Desktop Obsidian 1.4.0 or newer.
- The Daily Notes core plugin must be enabled.
- Today's Daily Note must already exist.

## Installation

Once Daily Note Icon is available in the Community Plugins directory:

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for **Daily Note Icon**.
3. Select **Install**, then **Enable**.

### Manual installation

Copy `main.js`, `manifest.json`, and `styles.css` from the latest release into
your vault's `.obsidian/plugins/daily-note-icon/` directory, then enable the
plugin under **Settings → Community plugins**.

## Privacy and permissions

Daily Note Icon:

- Makes no network requests.
- Collects no analytics or telemetry.
- Does not read or modify note contents.
- Reads the Daily Notes core plugin's folder and date-format settings.
- Checks whether today's configured Daily Note path exists in the vault.

## Compatibility

The plugin uses a guarded reference to Obsidian's tab-header element because
there is no public API for changing the icon of a built-in Markdown tab. If a
future Obsidian update changes the tab DOM, the plugin is designed to fail
without affecting notes or other tabs.

## Development

```bash
npm install
npm run check
```

For a development build that watches for changes, run `npm run dev`.

## Support

Report bugs and request features through
[GitHub Issues](https://github.com/benhancock/daily-note-icon/issues).

## License

[MIT](LICENSE)
