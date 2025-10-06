// Simple scroll lock with reference counting so multiple modals can coexist
export function lockScroll() {
  if (typeof window === 'undefined') return;
  const w = window;
  w.__modalLockCount = (w.__modalLockCount || 0) + 1;
  if (w.__modalLockCount === 1) {
    w.__originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Also lock documentElement to be safe on mobile
    w.__originalHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
}

export function unlockScroll() {
  if (typeof window === 'undefined') return;
  const w = window;
  if (!w.__modalLockCount) return;
  w.__modalLockCount -= 1;
  if (w.__modalLockCount <= 0) {
    document.body.style.overflow = w.__originalOverflow || '';
    document.documentElement.style.overflow = w.__originalHtmlOverflow || '';
    w.__modalLockCount = 0;
  }
}


