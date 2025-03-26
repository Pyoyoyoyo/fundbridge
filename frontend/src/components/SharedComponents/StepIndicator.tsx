'use client';

import { Check } from 'lucide-react'; // Icon сан
import { motion } from 'framer-motion'; // Анимэйшнд
import React from 'react';

/** className-уудыг нэгтгэх туслах функц (Tailwind-д түгээмэл). */
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Алхам бүрийн мэдээллийн төрөл */
interface Step {
  id: number; // Алхамын дугаар (1, 2, 3, ...)
  title: string; // Алхамын нэр (Үндсэн мэдээлэл, Шагнал гэх мэт)
  icon: React.ReactNode; // Тухайн алхмыг илэрхийлэх icon (Lucide эсвэл өөр icon)
}

/** Компонентын проп */
interface StepIndicatorProps {
  steps: Step[]; // Алхамуудын жагсаалт
  currentStep: number; // Одоогийн алхам
  onStepClick?: (stepId: number) => void; // Шинээр нэмсэн callback
}

/**
 * Алхмуудыг график байдлаар харуулах компонент
 */
export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className='flex items-center justify-between gap-2 mb-6'>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div
            key={step.id}
            className='flex-1 flex flex-col items-center cursor-pointer'
            onClick={() => {
              if (onStepClick) {
                onStepClick(step.id);
              }
            }}
          >
            <div className='relative flex items-center justify-center'>
              {/* Арын зураас (progress line) — хамгийн сүүлийн алхамд шугам хэрэггүй */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-1/2 left-full h-[2px] w-[100%] -translate-y-1/2 transition-colors',
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                />
              )}

              {/* Дугуй дүрс */}
              <motion.div
                layout
                className={cn(
                  'flex items-center justify-center rounded-full border-2 w-8 h-8 relative z-10 transition-colors',
                  isCompleted
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-300 text-gray-400'
                )}
              >
                {isCompleted ? <Check className='w-4 h-4' /> : step.icon}
              </motion.div>
            </div>

            {/* Алхамын нэр */}
            <span
              className={cn(
                'mt-2 text-xs text-center transition-colors',
                isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
