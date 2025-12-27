# ReikiaIT AI Chat Widget

Embeddable AI chat widget for reikiait.lt powered by Google Gemini.

## Deployment to Vercel

### Step 1: Deploy to Vercel
1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import this repository
5. Click "Deploy"

### Step 2: Add API Key
1. In Vercel, go to your project → Settings → Environment Variables
2. Add: `GEMINI_API_KEY` = your API key
3. Redeploy the project

### Step 3: Embed on Your Website
Add this code to your Sitejet website (in Custom Code section):

```html
<script>
  window.REIKIAIT_API_URL = 'https://YOUR-PROJECT.vercel.app';
</script>
<script src="https://YOUR-PROJECT.vercel.app/widget.js"></script>
```

Replace `YOUR-PROJECT` with your actual Vercel project URL.

## Files

- `api/chat.js` - Serverless API endpoint for Gemini
- `public/widget.js` - Embeddable chat widget
- `vercel.json` - Vercel configuration with CORS
