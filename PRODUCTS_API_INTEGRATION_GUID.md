# Adelbaba – Front-End Integration Guide for Product Management (Next.js)

**Scope:** كيف يستهلك الفرونت-إند (Next.js) واجهات Laravel للمنتجات “Company Products” من دون فرض مكتبات بعينها. الدليل يركّز على **تسلسل الاستخدام، نمذجة الحالة، التعامل مع السعر/الـSKU/الوسائط، الأداء**، وأفضل الممارسات.

---

## 0) الأساسيات

- **Base URL:** `https://api.adil-baba.com`
- **Namespace:** `/api/v1/company/products`
- **Auth:** استخدام توكن المصادقة في الهيدر `Authorization: Bearer <token>` + أي هيدرات سياقية (مثل `X-Organization-ID` إن وُجدت).
- **أنواع التسعير (price_type):**
  - `range` ⇒ يعرض نطاق سعر (`min_price`/`max_price`)
  - `tiered` ⇒ أسعار حسب الكمية (`tiered_prices`)
  - `sku` ⇒ السعر على مستوى كل SKU منفصلًا
- **الوسائط (Media):** مطلوبة عند الإنشاء (422 عند غيابها). في التحديث: `media.add[]` للملفات الجديدة، و`media.remove[]` لمعرفات الوسائط المراد حذفها.
- **SKU & Attributes:** كل SKU قد يحتوي **خصائص** (type: `select|color|image`) مع `variation_value_id`، وبيانات مخزون منظمة لكل مستودع.

---

## 1) ملخّص النهايات (Endpoints)

| العملية | الميثود + المسار | ملاحظات |
|---|---|---|
| **List** المنتجات | `GET /api/v1/company/products` | ترجع صفحة من المنتجات مع حقول مختصرة + `category` |
| **Show** منتج | `GET /api/v1/company/products/{id}` | تفاصيل كاملة + `skus`, `media`, `tieredPrices`, `rangePrices` |
| **Create** منتج | `POST /api/v1/company/products` | يتطلب `product{...}` + `media[]` + (حسب `price_type`) |
| **Update** منتج | `PUT /api/v1/company/products/{id}` | يدعم `media.add[]`, `media.remove[]`, `skus.add/remove/modify` |
| **Delete** منتج | `DELETE /api/v1/company/products/{id}` | أعِد المحاولة أو أعرض سبب الفشل عند 500 |

> **ملاحظات من لقطات API:**  
> - **Create** يُرجع 422 عند غياب `media`.  
> - **Delete** قد يُرجع 500 برسالة `Failed to delete product`؛ عالجها برسالة ودّية وإعادة محاولة.

---

## 2) نماذج البيانات (Frontend Shapes)

### 2.1 Product (مختصر في List)
```ts
type ProductListItem = {
  id: number;
  name: string;
  image: string;            // صورة رئيسية
  description: string;
  moq: number;
  rating: number | null;
  price_type: 'range'|'tiered'|'sku';
  is_active: boolean;
  unit: string;             // مثل: "set"
  inventory: number;
  is_rts: boolean;          // ready-to-ship
  shown_price: string;      // "9201.00 - 11065.00" جاهزة للعرض
  reviews_count: number;
  skus_count: number;
  category: { id:number; name:string; icon?:string; image?:string };
  created_at: string; updated_at: string;
};
2.2 Product (كامل في Show)
ts
Copy code
type ProductDetail = ProductListItem & {
  rangePrices?: { minPrice: string; maxPrice: string };
  skus: Array<{
    id: number;
    code: string;
    price: string;
    inventory: number; // مُجمّع أو من الحقول الداخلية
    attributes: Array<{
      type: 'select'|'color'|'image';
      name?: string;
      value?: string;
      hexColor?: string;
    }>;
  }>;
  tieredPrices: Array<{ min_quantity:number; price:number }>;
  media: Array<{ id:number; name:string; url:string; type:string }>;
};
3) تدفّقات الاستخدام في الواجهة
3.1 عرض قائمة المنتجات (List)
الغرض UI: جدول/شبكة بخصائص أساسية + فلترة/بحث/ترقيم.

الاستدعاء: GET /api/v1/company/products

التخزين المؤقت:

أوصِي بمُدارة حالة بيانات على مستوى الصفحة/المسارات (Query Cache) مع مفاتيح مثل: ["companyProducts", {page, q, sort}].

إعادة الجلب عند تغيّر عوامل التصفية أو بعد عمليات الإنشاء/التحديث/الحذف بنمط “invalidate & refetch”.

نصائح:

استخدم pagination من الباك (إن متاح) بدلاً من جلب كل شيء.

اعرض shown_price مباشرة إن وجدت، أو حوّل rangePrices لسلسلة قابلة للعرض.

3.2 عرض تفاصيل منتج (Show)
الغرض UI: صفحة تفاصيل/نموذج تحرير: صور, مواصفات, SKUs, أسعار, مخزون.

الاستدعاء: GET /api/v1/company/products/{id}

التخزين المؤقت: مفتاح مستقل: ["companyProduct", id] مع prefetch عند فتح صفحة التفاصيل من القائمة لتحسين الزمن.

نصائح:

عرّف مكوّنات فرعية:

Gallery للوسائط

Pricing (يختار العرض حسب price_type)

SKU Matrix للخصائص/المخزون

تجنّب إعادة بناء النموذج بالكامل عند تحديث جزء (استعمل state slices).

3.3 إنشاء منتج (Create)
الاستدعاء: POST /api/v1/company/products

الحمولة (مُلخّص):

product{ name, description, moq, product_unit_id, price_type, is_active, category_id }

media[] (ملفات) مطلوبة

skus[] (لكل SKU: code, price, inventory{warehouses[...]}, attributes[...])

إن كان price_type = range ⇒ أرسل range_price{min_price, max_price}

إن كان price_type = tiered ⇒ أرسل tiered_prices[{min_quantity, price}, ...]

تعامل مع الأخطاء:

حالة 422 “The media field is required.” ⇒ أظهر رسالة واضحة واسم الحقل الناقص، وامنع الإرسال قبل إضافة صور.

بعد نجاح الإنشاء:

Invalidate مفتاح القائمة وإعادة الجلب.

وجّه المستخدم لصفحة التفاصيل أو أبقِه بالنموذج مع إشعار نجاح.

أداء وتجربة:

ارفع الوسائط عبر multipart (إن كانت النهاية تقبل ذلك) مع شريط تقدم.

وفّر حفظ مسودة (اختياري) لتجنّب فقدان البيانات.

3.4 تحديث منتج (Update)
الاستدعاء: PUT /api/v1/company/products/{id}

الحمولة (مختصر):

product{...} (حقول المنتج)

media{ add:[files...], remove:[ids...] }

skus{ add:[], remove:[ids...], modify:[{id, ...}] }

range_price/tiered_prices حسب price_type

أفضل الممارسات:

Optimistic Update لواجهة المستخدم (اختياري): حدّث الحالة محليًا ثم ثبّت من الخادم، ومع الفشل أعد الحالة.

إن غيّرت الوسائط: أعِد تحميل المعرض بعد نجاح التحديث.

بعد نجاح العملية:

Invalidate ["companyProduct", id] و/أو ["companyProducts"].

3.5 حذف منتج (Delete)
الاستدعاء: DELETE /api/v1/company/products/{id}

ملاحظات الخطأ: قد يعود 500 مع { "error": "Failed to delete product" }.

التصرّف الأمثل:

اعرض حوار تأكيد قبل الحذف.

عند فشل 500: أظهر رسالة “تعذّر حذف المنتج الآن، حاول لاحقًا” + خيار Retry.

في النجاح: أزِل العنصر محليًا ثم Invalidate القائمة.

4) توصية هيكل الحالة والأداء (Context أم Query Cache؟)
بما أنّ الفريق يعرف مكتباته، نوصي بالتصميم المنطقي دون تقييد مكتبة:

خيار A) Query Cache/Data Layer (مستحسن للقراءة الكثيفة)
متى؟ القوائم والتفاصيل تُقرأ كثيرًا وتتغيّر على فترات.

لماذا؟ جلب كسول، caching لكل مفتاح، إعادة محاولة تلقائية، revalidation تلقائي عند التركيز.

مفاتيح مقترحة:

قائمة: ["companyProducts", {page, q, sort}]

عنصر: ["companyProduct", id]

فوائد: تقليل الجلب، بقاء البيانات طازجة، سهولة invalidate بعد عمليات Create/Update/Delete.

خيار B) Dedicated Context (مستحسن لحالة تحرير معقّدة)
متى؟ في شاشة تحرير منتج مع Tabs/أقسام كثيرة (وسائط/أسعار/خصائص/SKUs) وتفاعل فوري بين الأقسام.

لماذا؟ مشاركة حالة النموذج بين عدّة مكوّنات بدون “prop drilling”، والتحكّم الدقيق في rerenders.

اقتراح:

ProductEditProvider يضمّ: productDraft, setField, addSku, removeSku, addMedia, removeMedia, setPriceType…

عند الحفظ: يحوّل الحالة إلى حمولة الـ API المناسبة.

الخلاصة:

قراءة (List/Show) ⇒ اعتمد Query Cache.

تحرير معقّد ⇒ استخدم Context محلي للشاشة + نداء الحفظ عبر طبقة الـ API.

يمكنك المزج بينهما (Context لشاشة التحرير، وQuery Cache للتخزين المؤقت خارجها).

5) تعامل الواجهة مع price_type
عند العرض:

range ⇒ اعرض shown_price أو rangePrices.min/max.

tiered ⇒ جدول درجات (Quantity vs Price).

sku ⇒ بطاقة/جدول لكل SKU بسعره ومخزونه.

عند الإنشاء/التحديث:

فعّل حقول الإدخال المناسبة فقط لنوع السعر المختار.

تحقّق من وجود الحقول الإلزامية:

range ⇒ range_price.min_price/max_price

tiered ⇒ صفوف tiered_prices[]

sku ⇒ قائمة skus[] بأسعارها

6) رفع الوسائط (Media)
Create: أرفق media[] (ملفات) – إلزامي.

Update:

media.add[] لصور/فيديوهات جديدة

media.remove[] لمعرفات وسائط قديمة

UI:

أظهر Preview قبل الرفع.

تقدّم الرفع (progress).

التحقق من النوع/الحجم قبل إرسال الطلب.

7) إدارة المخزون وخصائص SKU
عرض سريع: في قائمة المنتجات استخدم skus_count وinventory الإجمالي.

داخل التفاصيل: اعرض Matrix/جدول بالـSKUs وخصائصها مع قابلية الإضافة/التعديل/الحذف.

التحويل للحَمولة:

skus.add[] للـSKUs الجديدة

skus.modify[] لتعديلات جزئية (يجب تضمين id)

skus.remove[] لمعرفات SKUs المطلوب حذفها

8) معالجة الأخطاء وتجربة المستخدم
422 Validation: اربط رسائل الأخطاء بحقول النموذج (مثل media أو القيم الناقصة).

500 Server: أعرض رسالة ودّية + خيار إعادة المحاولة. سجّل الخطأ (Sentry/Logs).

Empty States:

لا توجد منتجات ⇒ زر “إضافة منتج” واضح.

لا توجد وسائط ⇒ دعوة لإضافة صور أولًا (مع متطلبات الحجم والنوع).

Loading states: Skeletons/Spinners.

i18n/RTL: احترم الترجمة والاتجاه العربي في الجداول والنماذج.