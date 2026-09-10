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

## التشغيل على iPhone

### الطريقة الأسهل (Expo Go)

1. ثبّت [Expo Go](https://apps.apple.com/app/expo-go/id982107779) على الآيفون
2. من جهاز Mac أو الكمبيوتر:

```bash
cd InfraVault
npm install
npx expo start
```

3. امسح رمز QR بكاميرا الآيفون

### بناء تطبيق مستقل (TestFlight / App Store)

تحتاج Mac مع Xcode:

```bash
cd InfraVault
npm install
npx expo prebuild --platform ios
npx expo run:ios
```

أو عبر EAS Build:

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

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
