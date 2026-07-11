# Netlify deployment steps

This project builds with Vinext and publishes static assets from `dist/client`.
It is not a standard Next.js build, so Netlify's Next.js Runtime plugin must
not run for this project.

1. Upload this ZIP to Netlify.
2. Go to **Project configuration → Build & deploy → Build plugins**.
3. Find **@netlify/plugin-nextjs** and select **Disable**.
4. In **Build settings**, use:
   - Build command: `pnpm run build`
   - Publish directory: `dist/client`
5. Deploy again.

If the Next.js Runtime is shown in the Build settings rather than Build
plugins, remove it there. Alternatively, add the Netlify environment variable
`NETLIFY_NEXT_PLUGIN_SKIP` with the value `true` in the Netlify UI, then
redeploy.

For shared cross-device task saving, use the Cloudflare-hosted version of the
application. A static Netlify deployment does not include the Cloudflare D1
database and API runtime required by the shared task updates.
