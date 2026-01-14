
import React from 'react';

interface FooterProps {
  onBecomeSeller?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onBecomeSeller }) => {
  const columns = [
    {
      title: 'Buy',
      links: [
        { label: 'Browse products', action: '#' },
        { label: 'Buyer protection', action: '#' },
        { label: 'How buying works', action: '#' },
        { label: 'Verified sellers', action: '#' },
        { label: 'Returns & refunds', action: '#' },
      ],
    },
    {
      title: 'Sell',
      links: [
        { label: 'Start selling', onClick: onBecomeSeller },
        { label: 'Seller verification', action: '#' },
        { label: 'Seller guidelines', action: '#' },
        { label: 'Fees', action: '#' },
        { label: 'Seller dashboard', action: '#' },
      ],
    },
    {
      title: 'Ortenticsea',
      links: [
        { label: 'About Ortenticsea', action: '#' },
        { label: 'Trust & verification', action: '#' },
        { label: 'Policies', action: '#' },
        { label: 'Careers', action: '#' },
        { label: 'Press', action: '#' },
      ],
    },
    {
      title: 'Help & Support',
      links: [
        { label: 'Help center', action: '#' },
        { label: 'Contact support', action: '#' },
        { label: 'Report an issue', action: '#' },
        { label: 'Dispute resolution', action: '#' },
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
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.action}
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all"
                      >
                        {link.label}
                      </a>
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
                &copy; Ortenticsea. All rights reserved.
              </p>
              <nav className="flex items-center gap-6">
                <a href="#" className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Terms of Use
                </a>
                <a href="#" className="text-[12px] font-medium opacity-80 hover:opacity-100 hover:underline">
                  Accessibility
                </a>
              </nav>
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-60">
              Abuja • Nigeria
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
