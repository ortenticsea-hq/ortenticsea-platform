
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
        { label: 'Email: ortenticseateam@gmail.com', action: '#' },
        { label: 'Contact: +234 707 270 4415', action: '#' },
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
                    ) : link.view ? (
                      <button
                        onClick={() => setView && setView(link.view)}
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all text-left w-full"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.action || '#'}
                        className="text-[13px] font-medium text-orange-50 hover:text-white hover:underline transition-all block"
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
            
            <div className="flex items-center space-x-6">
              <a href="https://instagram.com/ortenticsea" target="https://www.instagram.com/ortenticsea/" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.93c.635-.247 1.362-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://x.com/ortenticsea" target="https://x.com/ortenticsea" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors duration-300">
                <span className="sr-only">X</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/ortenticsea" target="_blank" rel="noopener noreferrer" className="text-orange-100 hover:text-white transition-colors duration-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
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
      {/*  #FFFFFF1F*/}
    </footer>
  );
};

export default Footer;
