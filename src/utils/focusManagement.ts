interface FocusableElement extends HTMLElement {
  focus(options?: FocusOptions): void;
  blur(): void;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'area[href]',
  'iframe',
  'object',
  'embed',
  '[contenteditable]'
].join(',');

export const focusManagement = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): FocusableElement[] {
    return Array.from(
      container.querySelectorAll(FOCUSABLE_ELEMENTS)
    ) as FocusableElement[];
  },

  /**
   * Focus first focusable element in container
   */
  focusFirst(container: HTMLElement): void {
    const elements = this.getFocusableElements(container);
    if (elements.length > 0) {
      elements[0].focus();
    }
  },

  /**
   * Focus last focusable element in container
   */
  focusLast(container: HTMLElement): void {
    const elements = this.getFocusableElements(container);
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  },

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): () => void {
    const elements = this.getFocusableElements(container);
    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleFocusTrap);
    return () => container.removeEventListener('keydown', handleFocusTrap);
  },

  /**
   * Create a focus scope that returns focus to the previous element when destroyed
   */
  createFocusScope(container: HTMLElement): () => void {
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus the first focusable element in the scope
    this.focusFirst(container);

    return () => {
      // Return focus to the previous element when the scope is destroyed
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  },

  /**
   * Set up skip link functionality
   */
  setupSkipLink(skipLinkId: string, mainContentId: string): void {
    const skipLink = document.getElementById(skipLinkId);
    const mainContent = document.getElementById(mainContentId);

    if (!skipLink || !mainContent) return;

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
};
