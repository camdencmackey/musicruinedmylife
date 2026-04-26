export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?error=access_denied');
  }

  const redirectUri = 'https://musicruinedmylife.vercel.app/api/callback';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Exchange code for access token
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization':
        'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return res.redirect('/?error=token_failed');
  }

  const token = tokenData.access_token;

  // Fetch Spotify data
  const [artistsRes, tracksRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?limit=1&time_range=short_term', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=1&time_range=short_term', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  const [artists, tracks] = await Promise.all([
    artistsRes.json(),
    tracksRes.json()
  ]);

  const topArtist = artists.items?.[0];
  const topTrack = tracks.items?.[0];

  // Clean payload for frontend
  const data = encodeURIComponent(JSON.stringify({
    artist: topArtist?.name || "Unknown Artist",
    song: topTrack?.name || "Unknown Song",
    album: topTrack?.album?.name || "Unknown Album"
  }));

  res.redirect(`/result.html?data=${data}`);
}
