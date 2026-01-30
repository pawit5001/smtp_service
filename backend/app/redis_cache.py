"""
Redis cache is disabled for this deployment.
All functions are now no-ops.
"""

async def get_cached_emails(*args, **kwargs):
    return None

async def cache_emails(*args, **kwargs):
    pass
