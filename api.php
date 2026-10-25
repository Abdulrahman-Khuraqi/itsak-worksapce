<?php
declare(strict_types=1);

// JSON API used by assets/js/app.js.
//   GET  api.php                                        -> the whole workspace
//   POST {"action":"save",   "type":"tasks", "item":{}} -> create or update one record
//   POST {"action":"delete", "type":"tasks", "id":"…"}  -> delete one record
//   POST {"action":"import", "data":{…}}                -> replace everything with a backup file
// Every successful call answers {"ok":true,"data":{…}} so the page always shows what is on disk.

require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/store.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

auth_start();
if (!auth_ok()) {
    respond(401, ['ok' => false, 'error' => 'Please sign in again.']);
}
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}
// Only the app sends this header. It keeps other sites from posting to the API from a visitor's browser.
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'itsak') {
    respond(400, ['ok' => false, 'error' => 'Bad request.']);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        respond(200, ['ok' => true, 'data' => ws_load()]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
    }
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        respond(415, ['ok' => false, 'error' => 'Send JSON.']);
    }
    $raw = file_get_contents('php://input', false, null, 0, 10 * 1024 * 1024 + 1);
    if (strlen((string) $raw) > 10 * 1024 * 1024) {
        respond(413, ['ok' => false, 'error' => 'That is too much data for one request.']);
    }
    $body = json_decode((string) $raw, true);
    if (!is_array($body)) {
        respond(400, ['ok' => false, 'error' => 'Send JSON.']);
    }

    $action = $body['action'] ?? '';
    $type = $body['type'] ?? '';
    if (in_array($action, ['save', 'delete'], true) && !in_array($type, WS_TYPES, true)) {
        respond(400, ['ok' => false, 'error' => 'Unknown type.']);
    }

    switch ($action) {
        case 'save':
            if (!is_array($body['item'] ?? null)) {
                respond(400, ['ok' => false, 'error' => 'Nothing to save.']);
            }
            $savedId = null;
            $data = ws_update(function (array $data) use ($type, $body, &$savedId) {
                return save_item($data, $type, $body['item'], $savedId);
            });
            respond(200, ['ok' => true, 'data' => $data, 'id' => $savedId]);

        case 'delete':
            $id = clean_id($body['id'] ?? null);
            if ($id === null) {
                respond(400, ['ok' => false, 'error' => 'Missing id.']);
            }
            respond(200, ['ok' => true, 'data' => ws_update(fn (array $data) => delete_item($data, $type, $id))]);

        case 'import':
            if (!is_array($body['data'] ?? null)) {
                respond(400, ['ok' => false, 'error' => 'This file is not a workspace backup.']);
            }
            $clean = import_data($body['data']);
            $data = ws_locked(function () use ($clean) {
                ws_backup(true);
                ws_write($clean);
                return ws_read();
            });
            respond(200, ['ok' => true, 'data' => $data]);
    }
    respond(400, ['ok' => false, 'error' => 'Unknown action.']);
} catch (InvalidArgumentException $e) {
    respond(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('Workspace API: ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => $e instanceof RuntimeException ? $e->getMessage() : 'Something went wrong on the server.']);
}
