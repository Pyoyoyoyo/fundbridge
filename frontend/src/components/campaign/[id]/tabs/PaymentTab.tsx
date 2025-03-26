'use client';
import { PaymentCostItem, ReportItem, PaymentData } from '@/app/interfaces';

// Backend-аас ирэх
interface Metadata {
  paymentInfo?: PaymentData;
}

export default function PaymentTab({
  metadata,
}: {
  metadata: Metadata | null;
}) {
  const paymentInfo = metadata?.paymentInfo;

  return (
    <div className='leading-relaxed text-gray-700 space-y-8'>
      {paymentInfo ? (
        <>
          {/* Санхүүжилтийн задаргаа */}
          <section>
            <h4 className='font-semibold text-gray-800 text-base mb-2'>
              Санхүүжилтийн задаргаа
            </h4>
            {paymentInfo.fundingCosts && paymentInfo.fundingCosts.length > 0 ? (
              <ul className='mt-2 space-y-3'>
                {paymentInfo.fundingCosts.map((cost, idx) => (
                  <li
                    key={idx}
                    className='border border-gray-200 rounded-lg p-3 hover:bg-gray-50'
                  >
                    <h6 className='font-semibold text-gray-800 mb-1'>
                      {cost.title}
                      <span className='ml-1 text-blue-600'>
                        ({cost.amount} {cost.currency})
                      </span>
                    </h6>
                    <p className='text-sm text-gray-600'>{cost.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-gray-500'>
                Санхүүжилтийн задаргаа алга байна.
              </p>
            )}
          </section>

          {/* Хөрөнгө ашиглалтын тайлан */}
          <section>
            <h4 className='font-semibold text-gray-800 text-base mb-2'>
              Хөрөнгө ашиглалтын тайлан
            </h4>
            {paymentInfo.reports && paymentInfo.reports.length > 0 ? (
              <ul className='mt-2 space-y-4'>
                {paymentInfo.reports.map((report, idx) => {
                  // imageUrl нь ipfs://... хэлбэртэй гэж үзье
                  let imageSrc = '';
                  if (report.imageUrl) {
                    // ipfs://Qm123... -> https://gateway.pinata.cloud/ipfs/Qm123...
                    imageSrc = report.imageUrl.replace(
                      'ipfs://',
                      'https://gateway.pinata.cloud/ipfs/'
                    );
                  }

                  // Fallback onError-т үед ipfs.io gateway руу шилжих
                  const handleImageError = (
                    e: React.SyntheticEvent<HTMLImageElement>
                  ) => {
                    const currentSrc = e.currentTarget.src;
                    // Хэрэв pinata.cloud дээрээс алдаа гарвал ipfs.io руу шилжүүлнэ
                    if (currentSrc.includes('gateway.pinata.cloud')) {
                      e.currentTarget.src = currentSrc.replace(
                        'gateway.pinata.cloud',
                        'ipfs.io'
                      );
                    }
                  };

                  return (
                    <li
                      key={idx}
                      className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
                    >
                      {/* Толгой хэсэг: Гарчиг + дүн + огноо */}
                      <div className='flex items-center justify-between mb-2'>
                        <h5 className='font-semibold text-gray-800'>
                          {report.title}
                        </h5>
                        <span className='text-blue-600 font-medium'>
                          {report.amount}₮
                        </span>
                      </div>
                      <p className='text-sm text-gray-500 mb-2'>
                        Огноо: {report.date}
                      </p>

                      {/* Дэлгэрэнгүй тайлбар */}
                      <p className='text-sm text-gray-700 mb-3'>
                        {report.description}
                      </p>

                      {/* Хэрэв зураг байгаа бол харуулах */}
                      {report.imageUrl && (
                        <div className='mt-2'>
                          <img
                            src={imageSrc}
                            alt='Тайлангийн зураг'
                            className='w-full h-auto object-cover rounded border border-gray-200'
                            onError={handleImageError} // fallback
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className='text-sm text-gray-500'>
                Тайлангийн мэдээлэл одоогоор алга байна.
              </p>
            )}
          </section>
        </>
      ) : (
        <p className='text-sm text-gray-500'>Төлбөрийн мэдээлэл алга байна.</p>
      )}
    </div>
  );
}
