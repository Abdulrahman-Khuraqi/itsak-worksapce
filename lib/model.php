<?php
declare(strict_types=1);

// The shape of each record, and the cleaning applied to anything that comes from the browser or an import.

const WS_TYPES = ['desks', 'tasks', 'notes'];
const DESK_COLORS = ['purple', 'lilac', 'orange', 'amber', 'red', 'zinc', 'white'];
const TASK_STATUSES = ['todo', 'doing', 'done'];
const TASK_PRIORITIES = ['low', 'normal', 'high'];

// Trims and cuts text to $max characters. Works without the mbstring extension.
function clip($value, int $max): string
{
    if (!is_string($value) && !is_int($value) && !is_float($value)) {
        return '';
    }
    $text = trim(str_replace("\r\n", "\n", (string) $value));
    return preg_match('/^.{0,' . $max . '}/su', $text, $m) === 1 ? $m[0] : '';
}

function clean_date($value): ?string
{
    if (!is_string($value) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m)) {
        return null;
    }
    return checkdate((int) $m[2], (int) $m[3], (int) $m[1]) ? $value : null;
}

function clean_id($value): ?string
{
    return is_string($value) && preg_match('/^[A-Za-z0-9_-]{1,40}$/', $value) ? $value : null;
}

function new_id(string $type): string
{
    return $type[0] . '_' . bin2hex(random_bytes(6));
}

function pick($value, array $allowed, string $default): string
{
    return in_array($value, $allowed, true) ? $value : $default;
}

function find_index(array $list, string $id): ?int
{
    foreach ($list as $i => $item) {
        if (($item['id'] ?? null) === $id) {
            return $i;
        }
    }
    return null;
}

/**
 * Builds a clean record of $type from $in.
 * $old is the stored record when editing. With $import, ids and timestamps from $in are kept.
 */
function clean_item(string $type, array $in, ?array $old, array $deskIds, bool $import = false): array
{
    $now = date('c');
    $stamp = fn ($key) => $import && is_string($in[$key] ?? null) && $in[$key] !== '' ? clip($in[$key], 40) : null;
    $deskId = clean_id($in['deskId'] ?? null);
    $deskId = $deskId !== null && in_array($deskId, $deskIds, true) ? $deskId : null;

    $item = [
        'id' => $old['id'] ?? ($import ? clean_id($in['id'] ?? null) : null) ?? new_id($type),
        'created' => $old['created'] ?? $stamp('created') ?? $now,
        'updated' => $stamp('updated') ?? $now,
    ];

    switch ($type) {
        case 'desks':
            $item += [
                'name' => clip($in['name'] ?? '', 80),
                'color' => pick($in['color'] ?? null, DESK_COLORS, 'purple'),
                'description' => clip($in['description'] ?? '', 500),
            ];
            if ($item['name'] === '') {
                throw new InvalidArgumentException('A desk needs a name.');
            }
            return $item;

        case 'tasks':
            $status = pick($in['status'] ?? null, TASK_STATUSES, 'todo');
            $doneAt = null;
            if ($status === 'done') {
                $doneAt = ($old['status'] ?? '') === 'done' && !empty($old['doneAt']) ? $old['doneAt'] : ($stamp('doneAt') ?? $now);
            }
            $item += [
                'title' => clip($in['title'] ?? '', 200),
                'deskId' => $deskId,
                'status' => $status,
                'priority' => pick($in['priority'] ?? null, TASK_PRIORITIES, 'normal'),
                'due' => clean_date($in['due'] ?? null),
                'notes' => clip($in['notes'] ?? '', 5000),
                'doneAt' => $doneAt,
            ];
            if ($item['title'] === '') {
                throw new InvalidArgumentException('A task needs a title.');
            }
            return $item;

        case 'notes':
            $item += [
                'title' => clip($in['title'] ?? '', 200),
                'body' => clip($in['body'] ?? '', 20000),
                'deskId' => $deskId,
                'pinned' => ($in['pinned'] ?? false) === true,
            ];
            if ($item['title'] === '' && $item['body'] === '') {
                throw new InvalidArgumentException('A note needs a title or some text.');
            }
            return $item;
    }
    throw new InvalidArgumentException('Unknown type.');
}

function save_item(array $data, string $type, array $in, ?string &$savedId): array
{
    $list = $data[$type];
    $id = clean_id($in['id'] ?? null);
    $index = $id !== null ? find_index($list, $id) : null;
    $item = clean_item($type, $in, $index !== null ? $list[$index] : null, array_column($data['desks'], 'id'));

    if ($index === null) {
        $list[] = $item;
    } else {
        $list[$index] = $item;
    }
    $data[$type] = $list;
    $savedId = $item['id'];
    return $data;
}

// Deleting a desk also deletes its tasks and notes. The daily backup keeps the previous state.
function delete_item(array $data, string $type, string $id): array
{
    $keep = fn ($item) => ($item['id'] ?? null) !== $id;
    $data[$type] = array_values(array_filter($data[$type], $keep));
    if ($type === 'desks') {
        $other = fn ($item) => ($item['deskId'] ?? null) !== $id;
        $data['tasks'] = array_values(array_filter($data['tasks'], $other));
        $data['notes'] = array_values(array_filter($data['notes'], $other));
    }
    return $data;
}

function import_data(array $in): array
{
    if (!array_filter(WS_TYPES, fn ($type) => is_array($in[$type] ?? null))) {
        throw new InvalidArgumentException('This file is not a workspace backup.');
    }
    $out = ['desks' => [], 'tasks' => [], 'notes' => []];
    $seen = [];
    foreach (WS_TYPES as $type) {
        $deskIds = array_column($out['desks'], 'id');
        foreach (is_array($in[$type] ?? null) ? $in[$type] : [] as $raw) {
            if (!is_array($raw)) {
                continue;
            }
            try {
                $item = clean_item($type, $raw, null, $deskIds, true);
            } catch (InvalidArgumentException $e) {
                continue;
            }
            if (isset($seen[$item['id']])) {
                $item['id'] = new_id($type);
            }
            $seen[$item['id']] = true;
            $out[$type][] = $item;
        }
    }
    return $out;
}
