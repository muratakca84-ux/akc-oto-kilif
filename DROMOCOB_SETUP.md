# Dromocob bağlantısı

## Ortam değişkenleri

`.env.example` içindeki `DROMOCOB_CONTROL_*` değerlerini hosting ortamına ekleyin. `DROMOCOB_CONTROL_SECRET` en az 32 rastgele byte olmalı ve yalnızca Dromocob ile site backend'i tarafından bilinmelidir.

Merkezi Dromocob Firebase service account için `PROJECT_ID`, `CLIENT_EMAIL` ve satır sonları `\\n` biçiminde saklanan `PRIVATE_KEY` kullanılır. Bağlantı doğrulanana kadar `DROMOCOB_CONTROL_ENABLED=false` bırakılmalıdır.

## Keşif ve sağlık

- `GET /api/dromocob-control`: agent sürümü, site kimliği ve desteklenen durumlar.
- `GET /api/health`: servis ve mevcut kontrol durumu.

## İmzalı komut

`POST /api/dromocob-control` ham JSON gövdesi HMAC-SHA256 ile imzalanır. İmza `x-dromocob-signature` başlığında 64 karakter hex olarak gönderilir.

```json
{
  "siteId": "akc-oto-kilif",
  "status": "maintenance",
  "commandId": "cmd_20260719_001",
  "nonce": "nonce_20260719_001",
  "timestamp": 1784419200000
}
```

Komut en fazla 60 saniye eski olabilir. `nonce` tekrar kullanılamaz; izin verilen durumlar `active`, `maintenance` ve `disabled` değerleridir.

## İlk bağlantı

1. Dromocob projesinde service account oluşturup yalnızca gerekli koleksiyonlara erişim verin.
2. Ortam değişkenlerini ekleyin ve siteyi yayınlayın.
3. `GET /api/dromocob-control` yanıtında `configured: true` kontrol edin.
4. İmzalı `active` komutu gönderip `/api/health` yanıtını doğrulayın.
5. `DROMOCOB_CONTROL_ENABLED=true` yaparak yeniden yayınlayın.
