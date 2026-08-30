# audio

Recordings go here, one mp3 per memo, named after the memo's slug:

    audio/oura.mp3

Then point the player's `<audio src="...">` at it in `posts/<slug>.html`.
If a memo has no recording, delete the whole `<div class="player">` block
from that post and the page renders text-only.
