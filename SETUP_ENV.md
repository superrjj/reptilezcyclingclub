# Setup .env File

## Create .env File

1. Sa root folder ng project (same level as `package.json`)
2. Create new file na name: `.env` (walang extension, walang space)
3. Copy at paste ang content na ito:

```env
REACT_APP_SUPABASE_URL=https://qrlqnmyrxsizdlnvyili.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybHFubXlyeHNpemRsbnZ5aWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTk2NzQsImV4cCI6MjA3OTg5NTY3NH0.ETrv8lkRGEe4WBaO1mF8koZQvIUEzs19oXQ4RaIgB2w
```

## Important:
- Walang spaces sa filename - dapat `.env` lang
- Walang quotes sa values
- Walang trailing spaces
- Dapat nasa root folder (same level as package.json)

## After creating .env:
1. Restart ang dev server (Ctrl+C then `npm start`)
2. Check browser console para sa errors

