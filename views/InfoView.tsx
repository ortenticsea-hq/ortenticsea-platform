import React from 'react';
import { 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface InfoViewProps {
  pageId: string;
  setView: (view: string) => void;
}

type PageContent = {
  title: string;
  category: string;
  content: React.ReactNode;
};

const InfoView: React.FC<InfoViewProps> = ({ pageId, setView }) => {
  
  const pages: Record<string, PageContent> = {
    'buyer-protection': {
      title: 'OrtenticSEA Money Back Guarantee',
      category: 'Buying',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-start gap-4">
            <ShieldCheckIcon className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 text-lg"> We got you covered</h3>
              <p className="text-green-800 text-sm mt-1">
                Get the item you ordered or your money back. It's that simple. Our Abuja-based verification team ensures every Grade-A item matches its description.
              </p>
            </div>
          </div>
          <section>
            <h3 className="font-bold text-xl mb-3 text-[#0B1E3F]">How it works</h3>
            <p className="text-gray-600 mb-4">
              If your item hasn't arrived or isn't as described, contact the seller. If they don't resolve your issue within 3 business days, let us know. We'll ensure you get your money back fast.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Covered:</strong> Item not received, item doesn't match description, damaged item.</li>
              <li><strong>Not Covered:</strong> Buyer's remorse (unless seller accepts returns), items collected in person without inspection.</li>
            </ul>
          </section>
        </div>
      )
    },
    'how-buying-works': {
      title: 'How Buying Works',
      category: 'Buying',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-600">OrtenticSEA connects you with verified sellers of foreign-used items in Abuja.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '1', title: 'Find it', desc: 'Browse thousands of verified Grade-A items.' },
              { step: '2', title: 'Buy it', desc: 'Pay securely through our escrow system.' },
              { step: '3', title: 'Get it', desc: 'Pick up in Wuse/Garki or get it delivered.' }
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <span className="w-8 h-8 bg-[#F26A21] text-white rounded-full flex items-center justify-center font-bold mb-4">{s.step}</span>
                <h4 className="font-bold text-[#0B1E3F] mb-2">{s.title}</h4>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    'verified-sellers': {
      title: 'Verified Sellers Program',
      category: 'Buying',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Trust is the currency of our marketplace. Every seller on OrtenticSEA undergoes a rigorous 3-step verification process.</p>
          <ul className="space-y-4 mt-4">
            <li className="flex gap-3">
              <CheckBadgeIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <strong className="block text-[#0B1E3F]">Identity Verification</strong>
                <span className="text-sm text-gray-500">We verify government-issued IDs (NIN, Passport) for every merchant.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckBadgeIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <strong className="block text-[#0B1E3F]">Sourcing Proof</strong>
                <span className="text-sm text-gray-500">Sellers must prove their items are legitimately sourced foreign-used goods.</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    'returns-refunds': {
      title: 'Returns & Refunds',
      category: 'Buying',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">Most sellers on OrtenticSEA offer a minimum 7-day return window for defective items.</p>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-[#F26A21]">
            <h4 className="font-bold text-[#F26A21]">Standard Policy</h4>
            <p className="text-sm text-gray-700 mt-1">Items can be returned if they are defective, damaged, or significantly different from the listing description.</p>
          </div>
        </div>
      )
    },
    'seller-verification': {
      title: 'Seller Verification Process',
      category: 'Selling',
      content: (
        <div>
          <p className="mb-4">To maintain our "Grade-A" standard, we don't let just anyone sell. Here is how to get verified:</p>
          <ol className="list-decimal pl-5 space-y-3 text-gray-600">
            <li>Create an account and navigate to "Become a Seller".</li>
            <li>Upload a valid Government ID.</li>
            <li>Provide proof of address in Abuja (Utility Bill).</li>
            <li>Submit invoices or receipts showing the origin of your foreign-used inventory.</li>
          </ol>
        </div>
      )
    },
    'fees': {
      title: 'Selling Fees',
      category: 'Selling',
      content: (
        <div className="overflow-hidden border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              <tr>
                <td className="px-6 py-4 font-medium text-[#0B1E3F]">Listing Fee</td>
                <td className="px-6 py-4 text-green-600 font-bold">Free</td>
                <td className="px-6 py-4 text-gray-500">List up to 50 items per month for free.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-[#0B1E3F]">Final Value Fee</td>
                <td className="px-6 py-4">5%</td>
                <td className="px-6 py-4 text-gray-500">Charged on the total sale price when item sells.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    'about': {
      title: 'About OrtenticSEA',
      category: 'Company',
      content: (
        <div className="space-y-6">
          <p className="text-lg font-medium text-[#0B1E3F]">
            OrtenticSEA is Abuja's premier marketplace for Grade A verified, high-quality foreign-used electronics and fashion.
          </p>
          <p className="text-gray-600">
            Founded to solve the problem of "fake" used items and unreliable vendors, we created a platform where every item is Grade-A and every seller is verified. We bridge the gap between international quality and local accessibility.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <span className="block text-2xl font-bold text-[#F26A21]">500+</span>
              <span className="text-xs text-gray-500 uppercase">Verified Sellers</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <span className="block text-2xl font-bold text-[#F26A21]">10k+</span>
              <span className="text-xs text-gray-500 uppercase">Happy Buyers</span>
            </div>
          </div>
        </div>
      )
    },
    'privacy': {
      title: 'Privacy Policy',
      category: 'Policies',
      content: (
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>At OrtenticSEA, we take your privacy seriously. This policy describes how we collect and use your data.</p>
          <h4 className="font-bold text-[#0B1E3F] mt-4 mb-2">1. Information We Collect</h4>
          <p>We collect information you provide directly to us, such as when you create an account, update your profile, or make a purchase.</p>
          <h4 className="font-bold text-[#0B1E3F] mt-4 mb-2">2. How We Use Information</h4>
          <p>We use your information to facilitate transactions, verify identities, and improve our platform security.</p>
        </div>
      )
    },
    'terms': {
      title: 'Terms of Use',
      category: 'Policies',
      content: (
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>Welcome to OrtenticSEA. By using our marketplace, you agree to these terms.</p>
          <h4 className="font-bold text-[#0B1E3F] mt-4 mb-2">1. User Accounts</h4>
          <p>You are responsible for maintaining the security of your account credentials.</p>
          <h4 className="font-bold text-[#0B1E3F] mt-4 mb-2">2. Prohibited Items</h4>
          <p>The sale of stolen property, counterfeit goods, or illegal items is strictly prohibited and will result in an immediate ban.</p>
        </div>
      )
    },
    'help-center': {
      title: 'Help Center',
      category: 'Support',
      content: (
        <div className="space-y-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for help..." 
              className="w-full border border-gray-300 rounded-full py-3 px-12 focus:ring-2 focus:ring-[#F26A21] focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {['How to return an item', 'Payment methods', 'Account security', 'Delivery options'].map(topic => (
              <button key={topic} className="text-left p-4 border border-gray-200 rounded-xl hover:border-[#F26A21] hover:text-[#F26A21] transition-colors flex justify-between items-center group">
                <span className="font-medium">{topic}</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#F26A21]" />
              </button>
            ))}
          </div>
        </div>
      )
    }
  };

  // Default fallback content
  const activePage = pages[pageId] || {
    title: pageId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'Information',
    content: (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpenIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">Content for this section is currently being updated by the OrtenticSEA team.</p>
      </div>
    )
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-sm breadcrumbs text-gray-500 mb-2 flex items-center gap-2">
            <span className="cursor-pointer hover:text-[#F26A21]" onClick={() => setView('home')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#F26A21]">{activePage.category}</span>
            <span>/</span>
            <span className="font-bold text-[#0B1E3F]">{activePage.title}</span>
          </div>
          <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">{activePage.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-4 bg-[#0B1E3F] text-white font-bold text-sm uppercase tracking-wider">
                Explore
              </div>
              <nav className="p-2">
                {Object.entries(pages).map(([key, page]) => (
                  <button
                    key={key}
                    onClick={() => setView(`page-${key}`)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                      pageId === key 
                        ? 'bg-orange-50 text-[#F26A21]' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page.title}
                    {pageId === key && <ChevronRightIcon className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 min-h-[500px]">
              {activePage.content}
            </div>

            {/* Feedback Section */}
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-[#0B1E3F]">Was this article helpful?</h4>
                <p className="text-xs text-gray-500">Your feedback helps us improve the marketplace.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:border-[#F26A21] hover:text-[#F26A21] transition-colors">Yes</button>
                <button className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:border-gray-400 transition-colors">No</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default InfoView;