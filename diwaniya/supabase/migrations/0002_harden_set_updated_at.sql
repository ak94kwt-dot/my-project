-- إصلاح أمني (يرفع تحذيري المستشار الأمني):
-- منع استدعاء دالّة الـtrigger عبر REST RPC من anon/authenticated.
-- الـtrigger يستمر بالعمل (لا يحتاج EXECUTE للدور المُستدعي).
revoke execute on function public.set_updated_at() from public, anon, authenticated;
