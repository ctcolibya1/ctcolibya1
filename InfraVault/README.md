# خزنة البنية (InfraVault)

تطبيق iPhone لإدارة كلمات سر وبيانات الدخول الخاصة بالبنية التحتية، مع مشاركة آمنة عبر واتساب عند الحاجة.

## التصنيفات

- **Servers** — خوادم
- **O/S** — أنظمة التشغيل
- **Hypervisor** — المنصات الافتراضية
- **VM** — آلات افتراضية
- **Switches** — محولات
- **Routers** — موجهات
- **Firewalls** — جدران نارية

## المميزات

- حماية بـ PIN وتشفير AES محلي للبيانات
- فتح اختياري ببصمة الوجه / الإصبع (Face ID / Touch ID)
- حفظ: الاسم، IP، المنفذ، المستخدم، كلمة السر، البروتوكول، نظام التشغيل، الموقع، الملاحظات
- بحث سريع عبر كل السجلات
- مشاركة سجل كامل أو حقول محددة عبر واتساب
- واجهة عربية (RTL)

## التثبيت على iPhone 16 Pro Max (iOS 26+)

لا يمكن تثبيت التطبيق على جهازك من السحابة مباشرة. اختر أحد المسارات التالية على جهازك/ماك.

### أ) تجربة سريعة عبر Expo Go (دقائق)

المشروع على **Expo SDK 57**.

1. على الآيفون ثبّت نسخة Expo Go المتوافقة مع SDK 57 من:  
   https://expo.dev/go  
   (نسخة App Store قد تكون SDK أقدم ولا تفتح المشروع)
2. من كمبيوتر على نفس الشبكة أو مع Tunnel:

```bash
cd InfraVault
npm install
npx expo start --tunnel
```

3. امسح QR من كاميرا الآيفون أو من داخل Expo Go.

### ب) تثبيت كتطبيق حقيقي على الجهاز (موصى به)

تحتاج عضوية **Apple Developer Program** ($99/سنة):

```bash
cd InfraVault
npm install
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview
```

بعد انتهاء البناء:
- ثبّت عبر الرابط الذي يعطيه EAS (Internal distribution)، أو
- ارفع لـ TestFlight: `eas submit --platform ios`

### ج) من Mac بكابل USB

```bash
cd InfraVault
npm install
npx expo prebuild --platform ios
npx expo run:ios --device
```

اختر iPhone 16 Pro Max من قائمة الأجهزة، ووقّع بـ Apple ID في Xcode → Signing & Capabilities.

## الأمان

- البيانات تُشفَّر على الجهاز بمفتاح مشتق من PIN (PBKDF2 + AES)
- لا يوجد خادم سحابي — كل شيء محلي
- المشاركة عبر واتساب اختيارية وبيد المستخدم (اختر الحقول قبل الإرسال)
- لا تشارك كلمات السر إلا عبر قنوات تثق بها ومع أشخاص مخوّلين

## هيكل المشروع

```
InfraVault/
  App.tsx
  src/
    components/
    context/
    i18n/
    screens/
    services/
    types.ts
    theme.ts
```
