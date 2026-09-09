import { siteContent } from '../../data/siteContent';

export default function AnnouncementBar() {
  return (
    <div className="bg-cherry text-cream text-xs md:text-sm font-body font-medium tracking-wide overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 text-center motion-drift">
        {siteContent.announcement}
      </div>
    </div>
  );
}