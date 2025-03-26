import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

export default function WarningBoxes() {
  return (
    <div className='mt-6'>
      {/* Grid layout: 1 col on small screens, 2 cols on md+ */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <AnimatePresence>
          <motion.div
            key='box-1'
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4 }}
            className='flex items-start gap-3 bg-yellow-50 border border-yellow-300 p-4 rounded-lg shadow'
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Info className='w-6 h-6 text-yellow-600' />
            </motion.div>
            <p className='text-yellow-700 font-medium'>
              Төслийн хугацаа дуусаагүй тохиолдолд санхүүжилтээ буцаан авах
              боломжгүй.
            </p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key='box-2'
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className='flex items-start gap-3 bg-red-50 border border-red-300 p-4 rounded-lg shadow'
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Info className='w-6 h-6 text-red-600' />
            </motion.div>
            <p className='text-red-700 font-medium'>
              Төсөлд гарч болзошгүй эрсдэлийг судлах нь санхүүжилт олгогчийн
              өөрийн хариуцлага болно.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
