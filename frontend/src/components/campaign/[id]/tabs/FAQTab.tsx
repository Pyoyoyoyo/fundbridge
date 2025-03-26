'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

interface Metadata {
  story?: {
    faq?: FaqItem[] | string;
  };
}

export default function FAQTab({ metadata }: { metadata: Metadata | null }) {
  const faqData = metadata?.story?.faq;

  if (!faqData) {
    return <p>Энэ төслийн FAQ (түгээмэл асуулт) одоогоор алга байна.</p>;
  }

  if (typeof faqData === 'string') {
    return (
      <div className='leading-relaxed text-gray-700'>
        <h4 className='font-semibold text-gray-800 text-lg mb-2'>FAQ</h4>
        <p>{faqData}</p>
      </div>
    );
  }

  if (Array.isArray(faqData)) {
    return (
      <div className='leading-relaxed text-gray-700 space-y-4'>
        <h4 className='font-semibold text-gray-800 text-lg mb-2'>FAQ</h4>
        {faqData.map((item, idx) => (
          <AccordionItem key={idx} item={item} />
        ))}
      </div>
    );
  }

  return <p>FAQ‐ийн бүтэц ойлгомжгүй байна.</p>;
}

/**
 * AccordionItem – асуулт дээр дарж, хариултыг нээж/хаах (dropdown)
 * + дээд талын gradient шугам
 */
function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className='mb-2 border border-gray-200 rounded overflow-hidden relative'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 
        Асуултын header – gradient line‐ийг ::before‐д үзүүлнэ
        (доорх custom class .gradient-line)
      */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-full text-left px-4 py-3 flex justify-between items-center 
          focus:outline-none transition-colors relative
          gradient-line
        `}
      >
        <span className='font-medium text-gray-800'>Q: {item.question}</span>
        <span className='text-sm ml-2 text-gray-500'>{open ? '▲' : '▼'}</span>
      </button>

      {/* Хариулт хэсэг */}
      <AnimatePresence>
        {open && (
          <motion.div
            className='px-4 pb-3 bg-gray-50 text-gray-700'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            A: {item.answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
