export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="text-muted-foreground">
        This page isn&apos;t available without an internet connection. Reconnect and try again.
      </p>
      <p className="text-muted-foreground" dir="rtl">
        أنت غير متصل بالإنترنت. أعد الاتصال وحاول مرة أخرى.
      </p>
    </div>
  );
}
