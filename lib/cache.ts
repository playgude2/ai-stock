import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({ max: 10, ttl: 44_000 });

export default cache;
