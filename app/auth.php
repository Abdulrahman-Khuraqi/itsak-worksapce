<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function auth_enabled(): bool
{
    return APP_PASSWORD !== '';
}

function auth_start(): void
{
    if (!auth_enabled() || session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('itsak_ws');
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

function auth_ok(): bool
{
    return !auth_enabled() || !empty($_SESSION['signed_in']);
}

function auth_login(string $password): bool
{
    if (!auth_enabled() || !hash_equals(APP_PASSWORD, $password)) {
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['signed_in'] = true;
    return true;
}

function auth_logout(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return;
    }
    $_SESSION = [];
    session_destroy();
}
