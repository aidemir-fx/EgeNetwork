import { useCallback, useEffect, useRef, useState } from 'react';

export type ToggleFlash = 'play' | 'pause';

export function useToggleFlash(
	paused: boolean,
	canPlay: boolean,
): readonly [ToggleFlash | null, () => void] {
	const [flash, setFlash] = useState<ToggleFlash | null>(null);
	const previousPaused = useRef(paused);
	const mounted = useRef(false);

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			previousPaused.current = paused;
			return;
		}

		if (paused === previousPaused.current) {
			return;
		}

		previousPaused.current = paused;
		if (canPlay) {
			setFlash(paused ? 'pause' : 'play');
		}
	}, [paused, canPlay]);

	const clear = useCallback(() => setFlash(null), []);

	return [flash, clear];
}
