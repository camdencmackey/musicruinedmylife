export default function handler(req, res) {
  const scopes = 'user-top-read user-read-private';
  const redirectUri = 'https://musicruinedmylife.vercel.app/api/callback';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: true
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
