import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from './usePolling';
import * as config from '../services/config';

describe('usePolling Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does NOT poll when mock mode is enabled (isMockEnabled() === true)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(true);

    const onPoll = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(35000);
    });

    expect(onPoll).not.toHaveBeenCalled();
  });

  it('polls periodically in real mode (isMockEnabled() === false)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

    const onPoll = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    expect(onPoll).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('pauses polling when document.hidden is true, and executes immediately on tab restore', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

    let hiddenState = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hiddenState,
    });

    const onPoll = vi.fn().mockResolvedValue(undefined);

    renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    // Advance 10s: tab is visible, 1 poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Tab is hidden
    hiddenState = true;
    document.dispatchEvent(new Event('visibilitychange'));

    // Advance 30s while hidden: no additional polls
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Tab becomes visible again
    hiddenState = false;
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Immediate poll triggered on restore
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('skips ticks if previous poll request is still in-flight (no overlap)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

    let resolvePendingPoll!: () => void;
    const slowPollPromise = new Promise<void>((resolve) => {
      resolvePendingPoll = resolve;
    });

    const onPoll = vi.fn().mockImplementation(() => slowPollPromise);

    renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    // Tick 1: triggers poll which remains pending
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Tick 2: previous poll still pending -> must skip
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Resolve the in-flight poll
    await act(async () => {
      resolvePendingPoll();
    });

    // Tick 3: now ready, fires again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('permanently stops polling when a 401 response is received', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

    const onPoll = vi.fn().mockRejectedValue({
      response: { status: 401, data: { detail: 'Session expired' } },
    });

    renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    // First tick: 401 error encountered
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Subsequent ticks: polling is stopped
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval and visibilitychange listener on unmount', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

    const onPoll = vi.fn().mockResolvedValue(undefined);

    const { unmount } = renderHook(() => usePolling({ intervalMs: 10000, onPoll }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });
});
