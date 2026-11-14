import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * VerifiedStamp: Signature Element 4
 * An ink-stamp style badge ("18/19 verified") with a subtle press animation when verification completes.
 */
export function VerifiedStamp({
  verified = 18,
  total = 19,
  ratioText,
  animate = true,
  onClick,
  className = '',
}) {
  const text = ratioText || `${verified}/${total} VERIFIED`;
  const isPerfect = total > 0 && verified === total;

  return (
    <motion.div
      initial={animate ? { scale: 1.25, rotate: -4, opacity: 0.4 } : false}
      animate={{ scale: 1, rotate: -2, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.05, rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border-2 select-none cursor-pointer transition-shadow shadow-sm ${
        isPerfect
          ? 'border-cpcb-good text-cpcb-good bg-cpcb-good/10 shadow-cpcb-good/20'
          : 'border-obs-teal text-obs-teal bg-obs-teal/10 shadow-obs-teal/20'
      } ${className}`}
      title="Verified in code by verify.js against source data rows"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>{text}</span>
    </motion.div>
  );
}
