import { useEffect, useRef, useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';

const API = 'https://academic-profile-likes.jingsongwang0616.workers.dev/likes';
const STORAGE_KEY = 'academic-profile-like-visitor';

export function LikeButton() {
  const [state, setState] = useState({ count: null, liked: false });
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const visitor = useRef(null);
  const busy = useRef(false);
  const alive = useRef(false);

  async function sync(liked) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const response = await fetch(API, {
        method: liked === undefined ? 'GET' : 'PUT',
        headers: { ...(visitor.current ? { 'X-Visitor-Id': visitor.current } : {}),
          ...(liked === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(liked === undefined ? {} : { body: JSON.stringify({ liked }) }),
        signal: AbortSignal.timeout(10000), credentials: 'omit', cache: 'no-store',
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'Please wait a minute, then retry.' : 'Likes unavailable. Click to retry.');
      const result = await response.json();
      if (!Number.isSafeInteger(result.count) || result.count < 0 || typeof result.liked !== 'boolean') throw new Error('Likes unavailable. Click to retry.');
      if (alive.current) setState(result);
    } catch (failure) {
      if (alive.current) setError(failure.name === 'TimeoutError' || failure.name === 'TypeError' ? 'Connection failed. Click to retry.' : failure.message);
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    try {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      visitor.current = id;
    } catch { setStorageAvailable(false); }
    void sync();
    const refresh = () => { if (document.visibilityState === 'visible') void sync(); };
    window.addEventListener('focus', refresh);
    return () => { alive.current = false; window.removeEventListener('focus', refresh); };
  }, []);

  const label = error || (!storageAvailable ? 'Browser storage is needed to remember your like.' : pending ? 'Updating likes...' : state.liked ? 'Unlike this profile' : 'Like this profile');
  return <span className="profile-like">
    <button type="button" className={`like-button${state.liked ? ' is-liked' : ''}`} aria-label={label}
      aria-pressed={state.liked} aria-busy={pending} disabled={pending || (!storageAvailable && !error)}
      onClick={() => void sync(error || state.count === null ? undefined : !state.liked)}>
      {error ? <RefreshCw size={20} strokeWidth={1.6} /> : <Heart size={21} strokeWidth={1.6} fill={state.liked ? 'currentColor' : 'none'} />}
      <span className="like-count" aria-hidden="true">{error || state.count === null ? '\u2014' : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(state.count)}</span>
    </button>
    <span className="like-tooltip" role="tooltip">{label}</span>
    <span className="like-announcement" role="status" aria-live="polite">{error || (state.count === null ? 'Loading likes' : `${state.count} likes${state.liked ? '. You liked this profile.' : ''}`)}</span>
  </span>;
}
