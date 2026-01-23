
import React from 'react';

interface FooterProps {
  onBecomeSeller?: () => void;
  setView?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onBecomeSeller, setView }) => {
  const columns = [
    {
      title: 'Buy',
      links: [
        { label: 'Browse products', view: 'categories' },
        { label: 'Buyer protection', view: 'page-buyer-protection' },
        { label: 'How buying works', view: 'page-how-buying-works' },
        { label: 'Verified sellers', view: 'page-verified-sellers' },
        { label: 'Returns & refunds', view: 'page-returns-refunds' },
      ],
    },
    {
      title: 'Sell',
      links: [
        { label: 'Start selling', onClick: onBecomeSeller },
        { label: 'Seller verification', view: 'page-seller-verification' },
        { label: 'Seller guidelines', view: 'page-seller-guidelines' },
        { label: 'Fees', view: 'page-fees' },
        { label: 'Seller dashboard', view: 'seller-dashboard' },
      ],
    },
    {
      title: 'Ortenticsea',
      links: [
        { label: 'About Ortenticsea', view: 'page-about' },
        { label: 'Trust & verification', view: 'page-trust' },
        { label: 'Policies', view: 'page-policies' },
        { label: 'Careers', view: 'page-careers' },
        { label: 'Press', view: 'page-press' },
      ],
    },
    {
      title: 'Help & Support',
      links: [
        { label: 'Help center', view: 'page-help-center' },
        { label: 'Contact support', view: 'page-contact' },
        { label: 'Report an issue', view: 'page-report-issue' },
        { label: 'Dispute resolution', view: 'page-disputes' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Announcements', action: '#' },
        { label: 'Seller resources', action: '#' },
        { label: 'Marketplace updates', action: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#F26A21] text-white pt-16 pb-24 md:pb-12 border-t border-orange-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-5 opacity-90">
                {col.title}
              </h2>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all text-left w-full"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <button
                        onClick={() => setView && link.view && setView(link.view)}
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Region Selector */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-5 opacity-90">
              Region
            </h2>
            <div className="relative inline-block text-left w-full">
              <select 
                className="w-full bg-orange-600/30 border border-orange-400/30 rounded px-3 py-2 text-[13px] font-medium focus:outline-none appearance-none cursor-pointer hover:bg-orange-600/50 transition-colors"
                defaultValue="NG"
              >
                <option value="NG">Nigeria (Abuja)</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-orange-400/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
              <p className="text-[12px] font-medium opacity-80">
                &copy; 2026 OrtenticSea. All rights reserved.
              </p>
              <nav className="flex items-center gap-6">
                <button onClick={() => setView?.('page-privacy')} className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Privacy Policy
                </button>
                <button onClick={() => setView?.('page-terms')} className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Terms of Use
                </button>
                <button onClick={() => setView?.('page-accessibility')} className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Accessibility
                </button>
              </nav>
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-60">
              Abuja • Nigeria
            </div>
          </div>
        </div>

        <div className="mt-12 py-6 bg-[#121212] rounded-3xl flex flex-col md:flex-row items-center justify-center gap-3 shadow-xl border border-white/10 px-6 text-center">
          <span className="text-2xl flex items-center justify-center">🍃</span>
          <p className="text-gray-300 font-sans text-sm font-medium">
            <span className="font-bold text-white">ortenticsea</span>: powering the circular economy through Grade-A excellence and eco-friendly impact.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
