<?php
declare(strict_types=1);

// Starter content written the first time the workspace opens (when data/workspace.json does not exist yet).
// Edit or delete any of it from the app.

function ws_seed(): array
{
    $today = date('Y-m-d');
    $in = fn (int $days) => date('Y-m-d', strtotime("$today +$days days"));

    $desks = [
        ['name' => 'Itsak.tech', 'color' => 'purple', 'description' => 'Our own brand, website and internal work.'],
        ['name' => 'AZ TV Store', 'color' => 'orange', 'description' => 'Homepage redesign for aztvstore.com on Salla. Arabic first, RTL, 17 sections in the agreed order.'],
    ];
    $tasks = [
        [0, 'Add your desks, tasks and deadlines', 'doing', 'high', $today, 'Delete the starter content you do not need.'],
        [0, 'Drop the Nexa and Graphik Arabic font files into assets/fonts', 'todo', 'normal', $in(2), 'File names are listed in assets/fonts/README.md.'],
        [0, 'Set a password in config.local.php before putting the workspace online', 'todo', 'normal', null, ''],
        [1, 'Section 01 Hero, first draft', 'done', 'normal', null, ''],
        [1, 'Section 02 Platform and channel logos', 'done', 'normal', null, 'Eight official logos, all shown white.'],
        [1, 'Section 03 Main categories, first draft', 'done', 'normal', null, ''],
        [1, 'Section 04 beIN world: redesign', 'todo', 'high', null, 'Use the beIN section on KoorPlanet as the reference. Devices, subscriptions, renewals.'],
        [1, 'Section 05 AZ TV Box', 'todo', 'normal', null, ''],
        [1, 'Replace the generic AZ TV Box image with the real product photo', 'todo', 'normal', null, 'Before going live.'],
        [1, 'Client decision: merge the two apps sections (16) or keep 17', 'todo', 'high', null, ''],
        [1, 'Confirm the Salla theme and developer access (Route A or B)', 'todo', 'high', null, ''],
        // Current work list. null = no desk.
        [null, 'صور LUVE', 'todo', 'high', '2026-10-30', ''],
        [null, 'متجر الزبون علي', 'todo', 'high', null, 'مهم'],
        [null, 'تصميم صفحة الزبون علي', 'todo', 'normal', null, ''],
        [null, 'تعديل متجر الزبون أبو محمد', 'todo', 'normal', null, ''],
        [null, 'نظام فواتير لانس', 'todo', 'normal', null, ''],
        [1, 'متجر عز', 'todo', 'normal', null, ''],
        [null, 'LMS', 'todo', 'normal', null, ''],
        [null, 'متجر رواد', 'todo', 'normal', null, ''],
        [null, 'Liyana', 'todo', 'normal', null, ''],
    ];
    $notes = [
        [1, 'Links', "Live store: https://aztvstore.com/\nPlatform: Salla (Twilight theme engine)", true],
        [1, 'Missing assets', "- Vector logo (AI or SVG)\n- Hero video footage, black and white, licensed for web\n- AZ TV Box product photos\n- App and device icons\n- AZ TV vs AZ TV Plus comparison data\n- FAQ questions and answers\n- KoorPlanet beIN section screenshots", false],
        [0, 'Brand colours', "Main: black\nPrimary purple #662d8b\nSecondary orange #ff9a1c\nAccent red #ff0000\nNeutrals: Tailwind zinc (#71717a)\nFonts: Nexa (English headings), Graphik Arabic (Arabic)", false],
    ];

    $data = ['desks' => [], 'tasks' => [], 'notes' => []];
    foreach ($desks as $d) {
        $data['desks'][] = clean_item('desks', $d, null, []);
    }
    $deskIds = array_column($data['desks'], 'id');
    foreach ($tasks as [$desk, $title, $status, $priority, $due, $details]) {
        $data['tasks'][] = clean_item('tasks', [
            'deskId' => $desk === null ? null : $deskIds[$desk], 'title' => $title, 'status' => $status,
            'priority' => $priority, 'due' => $due, 'notes' => $details,
        ], null, $deskIds);
    }
    foreach ($notes as [$desk, $title, $body, $pinned]) {
        $data['notes'][] = clean_item('notes', [
            'deskId' => $deskIds[$desk], 'title' => $title, 'body' => $body, 'pinned' => $pinned,
        ], null, $deskIds);
    }
    return $data;
}
