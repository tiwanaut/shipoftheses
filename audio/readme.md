# audio

One recording per memo, named after the memo's slug — the same name as the
file in `posts/`:

    posts/oura.html          ->  audio/oura.mp3
    posts/acme-robotics.html ->  audio/acme-robotics.mp3

Drop the file in here, commit it, and the player on that memo comes alive on
the next deploy. Until then the player shows "Recording coming soon" with its
controls dimmed, so a memo can publish before its recording is ready.

`.mp3` is the safe default — every browser plays it. `.wav` and `.m4a` also
work, but you must change the extension in the `<audio src="...">` line of the
post to match. Keep files under ~50MB; GitHub warns above 50MB and refuses
above 100MB. A 45-minute mono recording at 64kbps lands around 20MB.

Seeking (dragging the progress bar, and the ±15s buttons) needs the host to
serve HTTP Range requests. Vercel does, so this works on the live site.
