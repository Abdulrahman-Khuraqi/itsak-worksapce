<?php
// Router for PHP's built-in server (start workspace.bat, start.sh).
// That server ignores .htaccess, so this blocks the data and app folders the same way.

$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$file = realpath(__DIR__ . $path);
if ($file !== false) {
    $file = strtolower($file);
    foreach (['data', 'app', 'config.php', 'config.local.php', 'router.php'] as $private) {
        $base = realpath(__DIR__ . '/' . $private);
        if ($base !== false && ($file === strtolower($base) || str_starts_with($file, strtolower($base) . DIRECTORY_SEPARATOR))) {
            http_response_code(403);
            exit('Forbidden');
        }
    }
}
return false;
