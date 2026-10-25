<?php
// Workspace settings.
//
// To set a password without committing it, create config.local.php next to this file:
//
//   <?php
//   define('APP_PASSWORD', 'your-password');
//
// config.local.php is ignored by git. Anything defined there wins over the defaults below.

if (is_file(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

// Empty means no sign-in. Fine on your own computer; set one before putting the workspace on a server.
defined('APP_PASSWORD') || define('APP_PASSWORD', '');

// Used for the timestamps saved in the JSON file and for naming the daily backups.
defined('APP_TIMEZONE') || define('APP_TIMEZONE', 'Asia/Riyadh');
