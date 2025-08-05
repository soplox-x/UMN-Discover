# UMN Production Setup Script

## 1. Install required packages (if not already installed)
[UMN-Discover](https://github.com/CSCI-Social-Club-UMN/UMN-Discover) requires a few dependencies:
 * [Git](https://git-scm.com)
 * [NGINX](https://nginx.org)
 * [Node.js](https://nodejs.org)
 * [pnpm](https://pnpm.io)
 * [PostgreSQL](https://www.postgresql.org)

If you are logged in as root, start by making sure sudo is installed:
```sh
apt -y install sudo
```

Then install git and nginx with the following command.
```sh
sudo apt -y install git nginx
```

To install Node.js, install the appropriate package from your distro, or for Ubuntu:
```sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```
And finally, install pnpm:
```sh
npm i -g pnpm
```

## 2. Clone the project
```sh
git clone https://github.com/CSCI-Social-Club-UMN/UMN-Discover
cd UMN-Discover
```
install pnpm:
```sh
pnpm install
```

## 3. Build the project
```sh
pnpm build
```

## 4. Deploy built frontend to nginx directory
```sh
sudo mkdir -p /var/www/umn-client
sudo rm -rf /var/www/umn-client/*
sudo cp -r dist/* /var/www/umn-client/
```

## 5. Set up backend systemd service

Next, we will create systemd unit files for the server.
which will ensure our application starts at boot and won't terminate if we end our SSH session:

```sh
sudo nano /etc/systemd/system/umn.service
```
and paste this in: 
```ini
[Unit]
Description=UMN App Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/UMN-Discover/server
ExecStart=/root/.nvm/versions/node/v18.18.2/bin/pnpm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save the file using `Ctrl + X`, and press `Y` to confirm the file name.

Enable the unit:
```sh
sudo systemctl enable --now umn-service
```

## 6. Setup SSL with certbot (if not done)
buy a domain name first. the run this two commands:
```sh
sudo apt install -y certbot python3-certbot-nginx
```
```sh
sudo certbot --nginx -d your_domain_name
```

# 7. Configure nginx
```sh
nano /etc/nginx/sites-available/umn.conf
```
```nginx
server {
    listen 80;
    server_name your_domain_name;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your_domain_name;

    ssl_certificate /etc/letsencrypt/live/your_domain_name/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain_name/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        root /var/www/umn-client;
        index index.html;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save the file using `Ctrl + X`, and press `Y` to confirm the file name.

To enable the configuration:
```sh
sudo ln -s /etc/nginx/sites-available/umn.conf /etc/nginx/sites-enabled/umn.conf
sudo systemctl restart nginx
```

🎉congrats now you can visit ```https:your_domian``` to acsess your site🎉

## To update frontend in future
go to the umn folder
```sh
git pull
```
install pnpm if we have to
```sh
pnpm install
pnpm build
sudo rm -rf /var/www/umn-client/*
sudo cp -r dist/* /var/www/umn-client/
sudo systemctl reload nginx
```

## To update backend in future
go to the erver folder
```sh
cd server
git pull
pnpm install
sudo systemctl restart umn.service
```
## Logs for debugging
### Backend logs:
```sh
journalctl -u umn.service -f
```

### Nginx logs:
```sh
sudo tail -f /var/log/nginx/error.log
```