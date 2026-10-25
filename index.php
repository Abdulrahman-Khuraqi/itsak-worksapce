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
<link rel="stylesheet" href="<?= $v('assets/css/app.css') ?>">
</head>
<?php if (!auth_ok()): ?>
<body class="login-page">
  <form class="login" method="post">
    <img src="assets/img/logo-full-white.svg" alt="Itsak.tech" class="login-logo">
    <h1>Workspace</h1>
    <label class="field">
      <span>Password · كلمة المرور</span>
      <input type="password" name="password" required autofocus autocomplete="current-password">
    </label>
    <?php if ($error): ?><p class="login-error" role="alert">Wrong password · كلمة المرور غير صحيحة</p><?php endif; ?>
    <button class="btn primary">Sign in · دخول</button>
  </form>
</body>
<?php else: ?>
<body data-auth="<?= auth_enabled() ? '1' : '0' ?>">
  <div class="app">
    <aside class="side" id="side"></aside>
    <main class="main" id="view" tabindex="-1"><p class="loading">…</p></main>
  </div>
  <nav class="tabbar" id="tabbar"></nav>
  <dialog id="modal" class="modal"></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <form id="logout-form" method="post" hidden><input type="hidden" name="logout" value="1"></form>
  <input type="file" id="import-file" accept="application/json,.json" hidden>
  <script src="<?= $v('assets/js/app.js') ?>"></script>
</body>
<?php endif; ?>
</html>
