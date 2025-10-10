import { renderHook, act } from '@testing-library/react-hooks';
import { usePWA } from '../../hooks/usePWA';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  checkForServiceWorkerUpdate,
  skipServiceWorkerWaiting,
  requestNotificationPermission,
} from '../../utils/serviceWorker';

// Mock service worker utils
jest.mock('../../utils/serviceWorker', () => ({
  registerServiceWorker: jest.fn(),
  unregisterServiceWorker: jest.fn(),
  checkForServiceWorkerUpdate: jest.fn(),
  skipServiceWorkerWaiting: jest.fn(),
  requestNotificationPermission: jest.fn(),
  isServiceWorkerSupported: jest.fn(),
  isNotificationSupported: jest.fn(),
  isPushSupported: jest.fn(),
  isBackgroundSyncSupported: jest.fn(),
  isOfflineSupported: jest.fn(),
  isPWAInstallable: jest.fn(),
}));

describe('usePWA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize PWA features', async () => {
    const mockRegistration = { id: 'test-registration' };
    (registerServiceWorker as jest.Mock).mockResolvedValue(mockRegistration);

    const { result, waitForNextUpdate } = renderHook(() => usePWA());

    expect(result.current.initialized).toBe(false);
    expect(result.current.error).toBeNull();

    await waitForNextUpdate();

    expect(registerServiceWorker).toHaveBeenCalled();
    expect(result.current.initialized).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle initialization errors', async () => {
    const mockError = new Error('Failed to register service worker');
    (registerServiceWorker as jest.Mock).mockRejectedValue(mockError);

    const { result, waitForNextUpdate } = renderHook(() => usePWA());

    await waitForNextUpdate();

    expect(result.current.initialized).toBe(false);
    expect(result.current.error).toBe(mockError.message);
  });

  it('should prompt for installation', async () => {
    const mockPrompt = jest.fn();
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' });
    const mockEvent = {
      prompt: mockPrompt,
      userChoice: mockUserChoice,
    };

    const { result } = renderHook(() => usePWA());

    // Simulate beforeinstallprompt event
    await act(async () => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, mockEvent);
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    // Test installation prompt
    await act(async () => {
      await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle service worker updates', async () => {
    const mockRegistration = {
      waiting: {
        postMessage: jest.fn(),
      },
    };
    (registerServiceWorker as jest.Mock).mockResolvedValue(mockRegistration);

    const { result, waitForNextUpdate } = renderHook(() => usePWA());

    await waitForNextUpdate();

    // Simulate update available
    await act(async () => {
      const event = new Event('updatefound');
      mockRegistration.waiting.dispatchEvent(event);
    });

    expect(result.current.updateAvailable).toBe(true);

    // Test update application
    await act(async () => {
      await result.current.applyUpdate();
    });

    expect(skipServiceWorkerWaiting).toHaveBeenCalled();
  });

  it('should check PWA features support', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.features).toEqual({
      serviceWorker: expect.any(Boolean),
      notifications: expect.any(Boolean),
      push: expect.any(Boolean),
      backgroundSync: expect.any(Boolean),
      offline: expect.any(Boolean),
    });
  });

  it('should handle app installed event', async () => {
    const { result } = renderHook(() => usePWA());

    // Simulate app installed
    await act(async () => {
      const event = new Event('appinstalled');
      window.dispatchEvent(event);
    });

    expect(result.current.isInstalled).toBe(true);
  });

  it('should handle display mode changes', async () => {
    const { result } = renderHook(() => usePWA());

    // Simulate standalone mode
    await act(async () => {
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
        writable: true,
      });

      window.dispatchEvent(new Event('change'));
    });

    expect(result.current.isInstalled).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWA());

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });
});
