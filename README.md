# Daily Report Reply Hub — Netlify Edition

This package contains a bilingual supplier daily-report and E&M written-reply dashboard.

## Deploy correctly

Use one of these methods so Netlify Functions and shared Netlify Blobs storage are deployed:

1. Unzip the package, push the folder to GitHub/GitLab, and import the repository in Netlify.
2. Or unzip it and run `netlify deploy --build --prod` from this folder.

Do not use Netlify Drop for production if you need shared saving. A static drag-and-drop upload can show the interface but does not reliably deploy the Functions/Blobs backend.

The root `index.html`, `netlify.toml`, `package.json`, and `netlify/functions/reports.mjs` are already included.

## Attachment upload

The upload field supports PDF, DOC/DOCX, XLS/XLSX, JPG/PNG, and phone photos in HEIC/HEIF format. The selected filename and size are shown before submission. Maximum attachment size is 4 MB.

This build also fixes report and E&M reply saving by reading form values before the temporary submit lock is applied.

## Password-protected undo completion

Set a Netlify site environment variable named `EM_ADMIN_PASSWORD` under Project configuration → Environment variables. Give it a strong private value and include the Functions scope when that option is available. Redeploy after adding or changing it. The password is checked only in the Netlify Function and is never committed to this package. Cancelled replies are retained in `replyHistory` for traceability.

The Records table shows **Undo completion / 取消完成** beside every completed report number. The same administrator password is required before the report can return to the E&M reply queue. The cancelled reply remains in `replyHistory` for traceability.

Every report row also shows **Delete / 删除**. Deleting requires the same administrator password and permanently removes the report, reply history, attachment, and any previous archive copy. This action cannot be undone.

The report detail window also includes a red **Permanently delete report / 永久删除报告** button. After password confirmation, the detail closes, the Records view refreshes, and the deleted report no longer appears. The user can then upload a corrected replacement report.

This release uses versioned asset URLs and no-cache response headers so browsers do not keep an older interface after a Netlify deployment.
