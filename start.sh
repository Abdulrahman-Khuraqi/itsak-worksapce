#!/bin/sh
cd "$(dirname "$0")"
echo "Itsak Workspace: http://localhost:8080"
php -S localhost:8080 router.php
