export function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? getTelegramInitDataFromLocation() ?? '';
}

function getTelegramInitDataFromLocation(): string | undefined {
  // Telegram Mini Apps commonly pass init data as `tgWebAppData` in the URL hash.
  // In some cases it can also be present in the query string.
  const hash = (window.location.hash ?? '').replace(/^#/, '');
  const fromHash = hash ? new URLSearchParams(hash).get('tgWebAppData') : null;
  if (fromHash) return fromHash;

  const fromSearch = new URLSearchParams(window.location.search).get('tgWebAppData');
  if (fromSearch) return fromSearch;

  return undefined;
}

export function getTelegramStartParam(): string {
  const raw =
    window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
    new URLSearchParams(window.location.search).get('tgWebAppStartParam') ||
    new URLSearchParams(window.location.search).get('startapp');
  return (raw ?? '').toString();
}

export async function waitForTelegramInitData(options?: {
  signal?: AbortSignal;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const intervalMs = options?.intervalMs ?? 100;

  const start = Date.now();

  while (Date.now() - start <= timeoutMs) {
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const initData = getTelegramInitData();
    if (initData) return initData;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    'Telegram initData is not available. Open this page from inside Telegram (Mini App).',
  );
}
