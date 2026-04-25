export default function handler(req, res) {
  const scopes = 'user-top-read user-read-private';
  const redirectUri = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/callback`
    : 'https://musicruinedmylife.vercel.app/callback';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: true
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
