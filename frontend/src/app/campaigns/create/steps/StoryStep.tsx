'use client';

import { Textarea } from '@/components/ui/textarea';

/** Тухайн компонентын проп */
interface StoryStepProps {
  formData: {
    story?: StoryData; // story нь байхгүй байж болзошгүй тул ? тэмдэглэгээ
  };
  updateFormData: (data: { story: StoryData }) => void;
}

/** Төслийн дэлгэрэнгүй (Story)-ийн дотоод бүтэц */
interface StoryData {
  introduceProject: string; // Төслөө танилцуулах хэсэг
  storyDetail: string; // Төслийн түүх
  risks: string; // Эрсдэл, сорилтууд
  faq: string; // Түгээмэл асуулт, хариулт (FAQ)
}

export default function StoryStep({
  formData,
  updateFormData,
}: StoryStepProps) {
  /**
   * formData.story байхгүй тохиолдолд,
   * бүх талбарыг хоосон мөр ('') болгож fallback өгнө
   */
  const storyData: StoryData = formData.story ?? {
    introduceProject: '',
    storyDetail: '',
    risks: '',
    faq: '',
  };

  /**
   * Textarea-уудын утга өөрчлөгдөхөд updateFormData-г дуудаж,
   * story объектын харгалзах талбарыг шинэчилнэ.
   */
  function handleChange(fields: Partial<StoryData>) {
    updateFormData({
      story: {
        ...storyData,
        ...fields,
      },
    });
  }

  return (
    <div className='space-y-8 bg-white p-6 rounded shadow'>
      {/* Нүүр гарчиг ба тайлбар */}
      <div>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Төслийн дэлгэрэнгүй (Story)
        </h2>
        <p className='text-sm text-gray-600'>
          Төслийн зорилго, агуулга, хэрэгжилтийн төлөвлөгөө, бусдад үзүүлэх ач
          холбогдлыг энд тодорхой бичиж, хөрөнгө оруулагчид болон дэмжигчдэд
          төслийг танилцуулна уу.
        </p>
      </div>

      {/* 1. Төслөө танилцуул */}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold text-gray-800'>
          1. Төслөө танилцуул
        </h3>
        <p className='text-sm text-gray-600'>
          Танай төсөл ямар асуудлыг шийдвэрлэх, ямар зорилготой, хэнд чиглэсэн
          болохыг товч бөгөөд ойлгомжтой байдлаар бичнэ үү.
        </p>
        <Textarea
          placeholder='Төслийн ерөнхий танилцуулга...'
          /**
           * value нь анхнаасаа '' байснаар uncontrolled → controlled
           * анхааруулга гарахгүй
           */
          value={storyData.introduceProject ?? ''}
          onChange={(e) => handleChange({ introduceProject: e.target.value })}
          className='h-32'
        />
      </div>

      {/* 2. Төслийн түүх */}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold text-gray-800'>2. Төслийн түүх</h3>
        <p className='text-sm text-gray-600'>
          Төслийг эхлүүлэх болсон шалтгаан, урьдчилсан судалгаа, үндэслэл болон
          төслийн хөгжүүлэлт, хэрэгжилтийн явцыг дэлгэрэнгүй тайлбарлана уу.
        </p>
        <Textarea
          placeholder='Төслийн дэлгэрэнгүй түүх, үзэл санаа...'
          value={storyData.storyDetail ?? ''}
          onChange={(e) => handleChange({ storyDetail: e.target.value })}
          className='h-32'
        />
      </div>

      {/* 3. Эрсдэл ба сорилтууд */}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold text-gray-800'>
          3. Эрсдэл ба сорилтууд
        </h3>
        <p className='text-sm text-gray-600'>
          Төслийг хэрэгжүүлэх явцад учирч болзошгүй эрсдэл, бэрхшээл,
          сорилтуудыг үнэнчээр бичиж, тэдгээрийг хэрхэн даван туулах
          төлөвлөгөөгөө дурдвал дэмжигчдийн итгэл нэмэгдэх болно.
        </p>
        <Textarea
          placeholder='Эрсдэл, сорилтууд, шийдвэрлэх арга зам...'
          value={storyData.risks ?? ''}
          onChange={(e) => handleChange({ risks: e.target.value })}
          className='h-32'
        />
      </div>

      {/* 4. Түгээмэл асуулт, хариулт (FAQ) */}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold text-gray-800'>
          4. Түгээмэл асуулт, хариулт (FAQ)
        </h3>
        <p className='text-sm text-gray-600'>
          Төслийн талаар олонтаа тавигддаг асуултууд болон тэдгээрийн
          хариултуудыг энд бичиж болно.
        </p>
        <Textarea
          placeholder='FAQ - асуулт, хариултууд...'
          value={storyData.faq ?? ''}
          onChange={(e) => handleChange({ faq: e.target.value })}
          className='h-32'
        />
      </div>
    </div>
  );
}
