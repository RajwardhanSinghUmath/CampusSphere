import re
import httpx
from supabase import create_client, Client
from supabase._sync import client as sync_client_module
from supabase.lib.client_options import ClientOptions
from gotrue.http_clients import SyncClient as GoTrueSyncClient
from app.config import settings

# 1. Patch gotrue HTTP client to avoid HTTP/2 ALPN handshake stalls and increase timeouts
# This fixes "_ssl.c:1015: The handshake operation timed out" on high-latency / campus networks
_orig_gotrue_client_init = GoTrueSyncClient.__init__

def _patched_gotrue_client_init(self, *args, **kwargs):
    kwargs["timeout"] = httpx.Timeout(30.0, connect=20.0, read=30.0, write=30.0)
    kwargs["http2"] = False  # Use HTTP/1.1 to avoid ALPN SSL negotiation stalls
    return _orig_gotrue_client_init(self, *args, **kwargs)

GoTrueSyncClient.__init__ = _patched_gotrue_client_init


# 2. Support both modern Supabase keys (sb_publishable_*, sb_secret_*)
# and legacy JWT format keys (eyJ*) in supabase-py
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
            options = ClientOptions(
                postgrest_client_timeout=30.0,
                storage_client_timeout=30.0,
            )
            self._client = create_client(url, key, options=options)
        return self._client

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

supabase: Client = LazySupabaseClient(is_admin=False)  # type: ignore
supabase_admin: Client = LazySupabaseClient(is_admin=True)  # type: ignore
