import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Demo feed: a public sample video stands in for the venue camera until a real stream link is supplied.
const DEMO_FEEDS = [
  { name: 'Main Hall — Camera 1', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { name: 'Ground — Camera 2', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { name: 'Auditorium — Camera 3', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
];

export default function LiveEvent() {
  const [feed, setFeed] = useState(0);
  const [custom, setCustom] = useState('');
  const [now, setNow] = useState(new Date());
  const [failed, setFailed] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const src = custom || DEMO_FEEDS[feed].url;
  return <div className="live-event">
    <div className="live-frame">
      <video key={src} src={src} autoPlay muted loop playsInline controls onError={() => setFailed(true)} onPlaying={() => setFailed(false)} />
      <span className="live-badge"><i /> LIVE</span>
      <span className="live-meta">{custom ? 'Connected camera' : DEMO_FEEDS[feed].name} · {now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
      {failed && <p className="live-error">This camera stream could not be played. Check the stream link.</p>}
    </div>
    <div className="live-cams">{DEMO_FEEDS.map((f, i) => <Button key={f.name} variant={!custom && feed === i ? 'default' : 'outline'} data-active={!custom && feed === i} onClick={() => { setCustom(''); setFeed(i); }}>{f.name}</Button>)}</div>
    <form className="live-connect" onSubmit={(e) => { e.preventDefault(); setCustom(new FormData(e.currentTarget).get('url')?.toString().trim() || ''); }}>
      <label>Camera stream link (MP4 / WebM from your camera provider)<input name="url" type="url" placeholder="https://camera-provider.example/stream.mp4" /></label>
      <Button type="submit">Connect camera</Button>
    </form>
    <p className="live-note">Demo mode: these feeds are sample videos, not a real venue camera.</p>
  </div>;
}
