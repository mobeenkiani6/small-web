/**
 * Default: local Docker Mongo from docker-compose.yml
 * Override with MONGODB_URI for Atlas or another host.
 */
export function resolveMongoUri(): string {
  return process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/smallweb';
}
