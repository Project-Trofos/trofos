# Backup script for postgres

This script uses rclone to backup the postgres database to a cloud location. Rclone is a utility that supports syncing from a local file structure to a remote one with numerous protocols including FTP, HTTP and S3 API.

1. Install rclone with `sudo -v ; curl https://rclone.org/install.sh | sudo bash`
2. Set up rclone with `rclone config` with a remote named `remote`, you may need to follow a guide on https://rclone.org/overview/ to set up your remote
3. Make backup.sh executable with `chmod +x backup.sh` in this folder
3. To backup regularly, use `cron` with `crontab -e`, follow https://man7.org/linux/man-pages/man8/cron.8.html to set up a schedule for running backup.sh