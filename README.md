# Stash

A quiet vault for the credentials you copy all day. Search, reveal, copy.
Each entry holds any number of `label: value` fields (user, pass, host, …);
fields that look like secrets (`pass`, `token`, `key`, …) are masked with a
reveal toggle.

Stored in `chrome.storage.sync`. Works in Chrome and Firefox (Manifest V3).

## Backup

**Export backup** / **Import backup** at the bottom of the list. Export writes
a `stash-backup-YYYY-MM-DD.json` file; import merges it in (it never
overwrites what you already have). Imports also accept v1 backups.

## Load it

**Chrome:** `chrome://extensions` → enable Developer mode → *Load unpacked* →
pick this folder.

**Firefox:** `about:debugging` → This Firefox → *Load Temporary Add-on* →
pick `manifest.json`.

## Develop

```
node popup.test.mjs   # checks secret-detection + old-data migration
```

Old data from v1 (`{serviceName, serviceToken}`) is migrated automatically on
first open.
