# 📦 EasyPanel Persistent Volume Setup for Uploads

## ⚠️ Critical: Files Not Persisting

If you're seeing 404 errors for uploaded logos, favicons, or other files, it's because **Docker containers are ephemeral** - files uploaded to `/app/uploads` disappear when the container restarts.

---

## Solution: Add Persistent Volume in EasyPanel

### Step 1: Open EasyPanel App Settings

1. Go to your EasyPanel dashboard
2. Click on your **thepoolshopsms** application
3. Click on **"Advanced"** or **"Volumes"** tab

### Step 2: Add Persistent Volume

Add a new volume with these settings:

```
Mount Path: /app/uploads
Volume Name: uploads-data
```

**Or in EasyPanel interface:**
- **Path in Container:** `/app/uploads`
- **Volume Name:** `uploads-data` (or any name you want)
- **Type:** Volume (persistent storage)

### Step 3: Restart the Application

After adding the volume:
1. Click **"Save"** or **"Apply"**
2. **Restart** your application
3. Wait for it to come back online

---

## Verify It's Working

### Test 1: Upload a Logo

1. Go to **Settings → System → Branding**
2. Upload a company logo
3. Refresh the page
4. Logo should still be visible

### Test 2: Check File Persistence

1. Upload a file
2. Restart your EasyPanel app
3. Check if the file is still accessible

---

## Alternative: Use External Storage (S3/CloudFlare R2)

If you prefer cloud storage instead of local volumes:

### 1. Install AWS SDK or CloudFlare R2 SDK
```bash
npm install @aws-sdk/client-s3
```

### 2. Add Environment Variables
```bash
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
# Or for CloudFlare R2:
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY=your-r2-key
R2_SECRET_KEY=your-r2-secret
```

### 3. Update Upload Logic

Modify `/src/app/api/upload/branding/route.ts` to upload to S3/R2 instead of local filesystem.

---

## Current Upload Paths

Files are currently saved to:
- **Production:** `/app/uploads/branding/` (needs persistent volume!)
- **Development:** `public/uploads/branding/`

Files are served via:
- **URL:** `https://sms.thepoolshop.africa/uploads/branding/filename.png`
- **Route:** `/api/uploads/[...path]/route.ts` (handles serving)
- **Rewrite:** `next.config.js` rewrites `/uploads/*` to `/api/uploads/*`

---

## Troubleshooting

### ❌ Still getting 404 errors after adding volume

**Possible causes:**
1. Volume not mounted correctly - check EasyPanel logs
2. Files uploaded before volume was added - re-upload them
3. Permissions issue - container can't write to volume

**Fix:**
```bash
# In EasyPanel terminal, check if directory exists and is writable:
ls -la /app/uploads
# Should show directory owned by your app user

# If not writable, may need to adjust volume permissions in EasyPanel
```

### ❌ "Permission denied" errors when uploading

The container user might not have write access to the volume.

**Fix in EasyPanel:**
1. Go to app settings
2. Under "Advanced" → "User"
3. Ensure user has ID `1000` or matches volume permissions
4. Or set volume permissions to `777` (less secure, but works)

### ❌ Files upload but don't show immediately

**Cause:** Browser caching or CDN cache

**Fix:**
- Add cache-busting query param: `?t=${Date.now()}`
- Or clear browser cache
- Or use incognito mode to test

---

## Quick Fix (Temporary)

If you can't set up volumes right now, you can temporarily use the database to store small images as base64:

1. Store logo as base64 string in `SystemSettings` table
2. Render directly in `<img src="data:image/png;base64,...">`

**Not recommended for production** (increases database size, slower), but works as a stopgap.

---

## Need Help?

If volume setup isn't working:
1. Check EasyPanel documentation for volume mounting
2. Contact EasyPanel support
3. Consider using S3/R2 for simpler cloud storage
4. Or use a CDN with upload support (Cloudinary, Uploadcare, etc.)

