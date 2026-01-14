
import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';

const VerifiedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-semibold">
    <CheckBadgeIcon className="w-4 h-4" />
    Verified
  </span>
);

export default VerifiedBadge;
