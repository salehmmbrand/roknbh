# موقع رُكن — دليل الرفع والتعديل

هذا المجلد هو الموقع كاملًا. لا يحتاج أي بناء أو برمجة، ويعمل على استضافة Netlify المجانية، ولوحة التحكم على `/admin`.

## 1) رفع الملفات على GitHub (مرة واحدة)
1. أنشئ حسابًا على github.com (إن لم يكن عندك).
2. اضغط **New repository** → الاسم `rokn-website` → اختر **Private** → **Create**.
3. داخل المستودع اضغط **Add file → Upload files**، واسحب **كل محتويات هذا المجلد** (الملفات والمجلدات كما هي) → **Commit changes**.
   - تأكد أن الفرع اسمه `main`.

## 2) ربط Netlify (مرة واحدة)
1. سجّل في netlify.com بحساب GitHub.
2. **Add new site → Import an existing project → GitHub** → اختر `rokn-website`.
3. اترك **Build command** فارغًا، و**Publish directory** = `/` (أو اتركه كما هو) → **Deploy**.
4. بعد دقيقة يظهر رابط مثل `rokn.netlify.app`. الموقع صار حيًّا.

## 3) تفعيل لوحة التحكم (مرة واحدة)
1. في Netlify: **Site configuration → Identity → Enable Identity**.
2. **Registration** → اختر **Invite only**.
3. **Services → Git Gateway → Enable**.
4. **Identity → Invite users** → أدخل بريدك → افتح رسالة الدعوة → **Accept the invite** → عيّن كلمة مرور.
5. افتح `https://rokn.netlify.app/admin` وسجّل دخولك. هذه لوحة التحكم.

## 3-ب) تنبيهات الطلبات على الإيميل (مرة واحدة)
كل طلب يُرسل تلقائيًا إلى Netlify حتى لو ما ضغط العميل «إرسال» في واتساب.
1. في Netlify: **Site configuration → Forms → Enable form detection** (ثم أعد النشر مرة واحدة إن طُلب).
2. **Forms → Form notifications → Add notification → Email notification** → اختر النموذج `order` وأدخل بريدك. كرّر الشيء نفسه للنموذج `custom` (الطلبات المخصصة).
3. كل الطلبات تظهر أيضًا في تبويب **Forms** داخل Netlify مع الاسم والجوال والعنوان ورابط الموقع والمجموع.

## 3-ج) إحصائيات الزوار (Google Analytics — مجاني)
1. افتح analytics.google.com → **Create account** → أنشئ Property باسم `Rokn` → المنطقة الزمنية Bahrain والعملة BHD.
2. اختر **Web** → أدخل رابط الموقع → يعطيك **Measurement ID** بصيغة `G-XXXXXXXXXX`.
3. الصقه في لوحة التحكم: **محتوى الموقع → معرّف Google Analytics** → Publish. (أو في `content/site.json` حقل `ga_id`.)
4. بعد دقائق تشوف في **Reports → Realtime** عدد الزوار الحاليين، وفي **Reports → Acquisition** مصدر كل زائر (إنستقرام، واتساب، بحث…).

الموقع يرسل تلقائيًا الأحداث: عرض منتج، إضافة للسلة، بدء إتمام الطلب، إرسال الطلب (بقيمته)، الطلب المخصص، والضغط على واتساب — فتعرف نسبة التحويل وليس عدد الزوار فقط.

**لقياس حملة معينة** استخدم روابط بعلامات UTM، مثل:
- رابط البايو: `https://rokn.bh/?utm_source=instagram&utm_medium=bio`
- ستوري أو إعلان: `https://rokn.bh/?utm_source=instagram&utm_medium=story&utm_campaign=launch`
- واتساب برودكاست: `https://rokn.bh/?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=launch`
كل رابط يظهر في GA كمصدر مستقل.

**اختياري — Microsoft Clarity** (clarity.microsoft.com، مجاني): يعطيك خرائط حرارية وتسجيل لجلسات الزوار لتشوف وين يتوقفون. انسخ Project ID وضعه في حقل Clarity في لوحة التحكم.

## 4) ربط الدومين rokn.bh
1. احجز `rokn.bh` من godomains.bh (المعتمد من هيئة تنظيم الاتصالات).
2. في Netlify: **Domain management → Add a domain → rokn.bh**.
3. في GoDomains أضف سجلات DNS التي يعرضها Netlify (عادة: `A` للجذر على `75.2.60.5`، و`CNAME` لـ `www` على `rokn.netlify.app`).
4. شهادة HTTPS تُفعَّل تلقائيًا خلال ساعات.

## 5) التعديل اليومي (من الجوال)
- افتح `rokn.bh/admin` → **المنتجات**: أضف/عدّل/احذف لوحة، غيّر السعر أو الصور أو "متوفر للبيع".
- **محتوى الموقع**: شريط الإعلان، نص وصورة الواجهة، المجموعة، عن رُكن، الواتساب، الآيبان، رسوم التوصيل.
- اضغط **Publish** → الموقع يتحدّث خلال دقيقة تقريبًا.

نصائح للصور: مربعة أو طولية، أقل من 1 ميغابايت، بإضاءة طبيعية. الموقع يعرضها مربعة في الشبكة.

## بنية الملفات
- `index.html` — الموقع كله (تصميم + سلة + إتمام الطلب).
- `content/site.json` — نصوص وإعدادات الموقع.
- `content/products.json` — المنتجات.
- `assets/` — الصور والشعار (`assets/uploads/` للصور المرفوعة من لوحة التحكم).
- `admin/` — لوحة التحكم (Decap CMS).


## 6) المخزون والطلبات (تلقائي)
- افتح `https://roknbh.netlify.app/stock.html` وأدخل رمز الإدارة (متغيّر البيئة `STOCK_ADMIN_TOKEN` في Netlify).
- اكتب العدد الحقيقي الجاهز لكل لوحة واضغط **حفظ المخزون**. اترك الخانة فارغة لمنتج بدون حد.
- كل طلب يُرسل من الموقع يخصم كميته فورًا ويظهر في قائمة الطلبات بحالة **بانتظار الدفع**.
- بعد وصول الإيصال اضغط **تأكيد الدفع**. إذا ما دفع العميل اضغط **إلغاء وإرجاع المخزون** فترجع القطع للمخزون.
- في الموقع: لما يبقى 3 قطع أو أقل يظهر "متبقي X فقط"، ولما يصل صفر تظهر "نفدت الكمية" ويتعطّل زر الشراء تلقائيًا.
- التخزين في Netlify Blobs (مجاني)، والكود في `netlify/functions/stock.mts`.
