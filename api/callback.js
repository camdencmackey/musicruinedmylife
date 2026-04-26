export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?error=access_denied');
  }

  const redirectUri = 'https://musicruinedmylife.vercel.app/callback';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Exchange code for access token
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
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

  // Fetch top artists, tracks, and user profile in parallel
  const [artistsRes, tracksRes, profileRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  const [artists, tracks, profile] = await Promise.all([
    artistsRes.json(),
    tracksRes.json(),
    profileRes.json()
  ]);

  // Encode data and redirect to result page
  const data = encodeURIComponent(JSON.stringify({
    artists: artists.items?.map(a => ({ name: a.name, genres: a.genres })) || [],
    tracks: tracks.items?.map(t => ({ name: t.name, artist: t.artists[0]?.name })) || [],
    name: profile.display_name || 'You'
  }));

  res.redirect(`/result?data=${data}`);
}
