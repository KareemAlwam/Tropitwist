import { useState } from 'react';
import { siteContent } from '../../data/siteContent';

const ANNOUNCEMENT_DISMISSED_KEY = 'tropitwist-announcement-dismissed';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(() => localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) !== 'true');

  if (!isVisible) return null;

  function dismissAnnouncement() {
    localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, 'true');
    setIsVisible(false);
  }

  return (
    <div className="relative bg-cherry text-cream text-xs md:text-sm font-body font-medium tracking-wide overflow-hidden">
      <div className="max-w-7xl mx-auto px-10 py-2 text-center motion-drift">
        {siteContent.announcement}
      </div>
      <button
        type="button"
        aria-label="Close announcement"
        onClick={dismissAnnouncement}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-lg leading-none text-cream/80 transition-colors hover:text-cream"
      >
        ×
      </button>
    </div>
  );
}