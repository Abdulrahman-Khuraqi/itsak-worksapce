<?php
declare(strict_types=1);

// Reads and writes data/workspace.json. Every change runs under one file lock,
// is written to a temp file first and then swapped in, so a crash never leaves half a file.

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/model.php';
require_once __DIR__ . '/seed.php';

const WS_DIR = __DIR__ . '/../data';
const WS_FILE = WS_DIR . '/workspace.json';
const WS_BACKUPS = WS_DIR . '/backups';
const WS_KEEP_BACKUPS = 30;

date_default_timezone_set(APP_TIMEZONE);

function ws_locked(callable $fn)
{
    if (!is_dir(WS_DIR) && !@mkdir(WS_DIR, 0775, true) && !is_dir(WS_DIR)) {
        throw new RuntimeException('Cannot create the data folder. Check its permissions.');
    }
    $lock = @fopen(WS_DIR . '/.lock', 'c');
    if ($lock === false) {
        throw new RuntimeException('Cannot write to the data folder. Check its permissions.');
    }
    flock($lock, LOCK_EX);
    try {
        return $fn();
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function ws_read(): array
{
    if (!is_file(WS_FILE)) {
        $data = ws_seed();
        ws_write($data);
        return $data;
    }
    $data = json_decode((string) file_get_contents(WS_FILE), true);
    if (!is_array($data)) {
        throw new RuntimeException('data/workspace.json is not valid JSON. Restore a copy from data/backups.');
    }
    foreach (WS_TYPES as $type) {
        $data[$type] = is_array($data[$type] ?? null) ? array_values($data[$type]) : [];
    }
    return $data;
}

function ws_write(array $data): void
{
    $data['version'] = 1;
    $data['savedAt'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

    ws_backup();
    $tmp = WS_FILE . '.tmp';
    if (@file_put_contents($tmp, $json) === false || !@rename($tmp, WS_FILE)) {
        throw new RuntimeException('Could not save data/workspace.json. Check the data folder permissions.');
    }
}

// One copy per day, taken before the day's first change. $named adds a timestamped copy (used before an import).
function ws_backup(bool $named = false): void
{
    if (!is_file(WS_FILE)) {
        return;
    }
    if (!is_dir(WS_BACKUPS)) {
        @mkdir(WS_BACKUPS, 0775, true);
    }
    $target = WS_BACKUPS . '/workspace-' . date($named ? 'Y-m-d-His' : 'Y-m-d') . '.json';
    if (!$named && is_file($target)) {
        return;
    }
    @copy(WS_FILE, $target);

    $files = glob(WS_BACKUPS . '/workspace-*.json') ?: [];
    sort($files);
    foreach (array_slice($files, 0, max(0, count($files) - WS_KEEP_BACKUPS)) as $old) {
        @unlink($old);
    }
}

function ws_load(): array
{
    return ws_locked(fn () => ws_read());
}

// $change receives the current data and returns the new data.
function ws_update(callable $change): array
{
    return ws_locked(function () use ($change) {
        $data = $change(ws_read());
        ws_write($data);
        return $data;
    });
}
