# DD Design website

## Run locally

Install Node.js 24 or later, open a terminal in this folder, and run:

```powershell
node server.js
```

Open the website at `http://127.0.0.1:4174/` and the owner dashboard at `http://127.0.0.1:4174/admin.html`.

On the first dashboard visit, create an owner password of at least 12 characters. On later visits, sign in with that password. The server listens on all network interfaces at port 4174 so local preview bridges can reach it; keep it on a trusted network and do not expose it directly to the public internet.

## Persistent data and uploads

SQLite records and uploaded files are stored in `private-data/`. Back up that folder while the server is stopped. It is excluded from the static website routes. Book PDFs and customer reference images are stored privately. Public book covers and service images are served for the storefront. Orders remain pending until the owner confirms payment; only then can the owner create a private, token-based PDF download link.

Keep the folder on a private, access-controlled computer. This local server is intended for development and local use. Before making it public, deploy behind HTTPS, restrict access, and configure monitored backups and an encrypted storage volume. The SQLite database is not encrypted by the application; use operating-system file permissions and encrypted storage to protect it at rest.

For a production deployment behind an HTTPS reverse proxy, set `NODE_ENV=production`. This enables the `Secure` flag on owner session cookies and makes state-changing requests require an HTTPS same-origin. Keep the Node server private behind the proxy, preserve the original `Host` header, and do not expose port 4174 directly to the internet. The owner password is configured through the dashboard and is never placed in frontend code.

Customer names, email addresses, WhatsApp numbers, messages, orders, and private reference images are used to respond to and fulfil customer requests. They are stored in `private-data/` and shown only in the authenticated owner dashboard. They are not published on the website. Set and follow an appropriate retention period, and remove records and files when they are no longer needed or a customer requests deletion.

## Book orders

Buy Now creates a pending order request. This project does not include a payment gateway; contact the customer with payment instructions, verify payment, and mark the order Paid in the owner dashboard before creating a download link. The link is a private bearer link. Creating a replacement invalidates the previous link.

