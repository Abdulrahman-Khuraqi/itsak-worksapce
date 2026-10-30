<?php
declare(strict_types=1);

require __DIR__ . '/app/auth.php';

auth_start();
$error = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['logout'])) {
        auth_logout();
        header('Location: ./');
        exit;
    }
    if (auth_login((string) ($_POST['password'] ?? ''))) {
        header('Location: ./');
        exit;
    }
    usleep(800000);
    $error = true;
}

header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$v = static fn (string $file) => $file . '?v=' . @filemtime(__DIR__ . '/' . $file);
?>
<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#000000">
<title>Itsak Workspace</title>
<link rel="icon" href="assets/img/logo-icon-primary.svg" type="image/svg+xml">
<!-- Add to Home Screen: opens full screen like an app -->
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="assets/img/app/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Workspace">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="stylesheet" href="<?= $v('assets/app/app.css') ?>">
</head>
<?php if (!auth_ok()): ?>
<!-- Same look as the shadcn/ui Card, Input and Button used in the app (classes come from assets/app/app.css). -->
<body class="grid min-h-screen place-items-center p-4">
  <form method="post" data-slot="card" class="flex w-full max-w-[360px] flex-col gap-[18px] rounded-[18px] border bg-card p-8 text-card-foreground">
    <img src="assets/img/logo-full-white.svg" alt="Itsak.tech" class="w-[170px]">
    <h1 class="text-[28px] font-black">Workspace</h1>
    <label class="flex flex-col gap-1.5">
      <span class="text-[13px] font-medium text-muted-foreground">Password · كلمة المرور</span>
      <input type="password" name="password" required autofocus autocomplete="current-password" data-slot="input"
        class="h-10 w-full min-w-0 rounded-md border border-input bg-zinc-900 px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
    </label>
    <?php if ($error): ?><p class="m-0 text-sm text-destructive" role="alert">Wrong password · كلمة المرور غير صحيحة</p><?php endif; ?>
    <button data-slot="button" class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50">Sign in · دخول</button>
  </form>
</body>
<?php else: ?>
<body data-auth="<?= auth_enabled() ? '1' : '0' ?>">
  <div id="root"><p class="p-10 text-muted-foreground">…</p></div>
  <script type="module" src="<?= $v('assets/app/app.js') ?>"></script>
</body>
<?php endif; ?>
</html>
