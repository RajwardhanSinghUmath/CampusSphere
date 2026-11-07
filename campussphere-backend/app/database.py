import re
import httpx
from supabase import create_client, Client
from app.config import settings

# 1. Safely patch the auth HTTP client (gotrue or supabase_auth) to avoid HTTP/2 ALPN stalls
GoTrueSyncClient = None
try:
    from gotrue.http_clients import SyncClient as GoTrueSyncClient
except ImportError:
    try:
        from supabase_auth.http_clients import SyncClient as GoTrueSyncClient
    except ImportError:
        pass

if GoTrueSyncClient is not None:
    try:
        _orig_gotrue_client_init = GoTrueSyncClient.__init__

        def _patched_gotrue_client_init(self, *args, **kwargs):
            kwargs["timeout"] = httpx.Timeout(30.0, connect=20.0, read=30.0, write=30.0)
            kwargs["http2"] = False  # Avoid HTTP/2 ALPN handshake stalls on restricted networks
            return _orig_gotrue_client_init(self, *args, **kwargs)

        GoTrueSyncClient.__init__ = _patched_gotrue_client_init
    except Exception:
        pass


# 2. Support modern Supabase keys (sb_publishable_*, sb_secret_*) in supabase-py
try:
    from supabase._sync import client as sync_client_module
    _orig_sync_client_init = sync_client_module.SyncClient.__init__

    def _patched_sync_client_init(self, supabase_url: str, supabase_key: str, options=None):
        _orig_match = re.match
        def _flexible_match(pattern, string, flags=0):
            if string and (string.startswith("sb_publishable_") or string.startswith("sb_secret_")):
                return True
            return _orig_match(pattern, string, flags)

        re.match = _flexible_match
        try:
            return _orig_sync_client_init(self, supabase_url, supabase_key, options)
        finally:
            re.match = _orig_match

    sync_client_module.SyncClient.__init__ = _patched_sync_client_init
except Exception:
    pass


# 3. Import ClientOptions safely across supabase versions
try:
    from supabase.lib.client_options import ClientOptions
except ImportError:
    try:
        from supabase import ClientOptions
    except ImportError:
        ClientOptions = None


class LazySupabaseClient:
    def __init__(self, is_admin: bool = False):
        self._client: Client = None
        self._is_admin = is_admin

    def _get_client(self) -> Client:
        if self._client is None:
            url = settings.supabase_url
            key = settings.supabase_service_key if self._is_admin else settings.supabase_key
            if not url or not key:
                raise RuntimeError(
                    f"Supabase credentials not configured! Please set SUPABASE_URL and "
                    f"{'SUPABASE_SERVICE_KEY' if self._is_admin else 'SUPABASE_KEY'} in .env"
                )
            if ClientOptions is not None:
                try:
                    options = ClientOptions(
                        postgrest_client_timeout=30.0,
                        storage_client_timeout=30.0,
                    )
                    self._client = create_client(url, key, options=options)
                except Exception:
                    self._client = create_client(url, key)
            else:
                self._client = create_client(url, key)
        return self._client

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

supabase: Client = LazySupabaseClient(is_admin=False)  # type: ignore
supabase_admin: Client = LazySupabaseClient(is_admin=True)  # type: ignore
