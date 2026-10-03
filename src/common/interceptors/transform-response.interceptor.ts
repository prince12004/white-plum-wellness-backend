import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Types } from 'mongoose';

/**
 * Recursively converts Mongoose documents/lean objects into plain JSON, renaming
 * `_id` -> `id` and dropping `__v`, so every response — hydrated documents, `.lean()`
 * results, and populated sub-documents alike — matches the `id`-based shapes in
 * @white/types without each service having to hand-map its output.
 */
function transform(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(transform);

  if (typeof value === 'object') {
    const record = value as Record<string, unknown> & { toJSON?: () => Record<string, unknown> };
    const plain = typeof record.toJSON === 'function' ? record.toJSON() : record;

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(plain)) {
      if (key === '__v') continue;
      if (key === '_id') {
        result.id = transform(val);
        continue;
      }
      result[key] = transform(val);
    }
    return result;
  }

  return value;
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => transform(data)));
  }
}
