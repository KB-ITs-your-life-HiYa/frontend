// Spring Boot 백엔드 연동용 클라이언트.
// 로컬 기본 포트는 8080. 다른 주소를 쓰려면 .env 의 EXPO_PUBLIC_API_BASE_URL 로 덮어쓴다.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// 백엔드 컨트롤러 경로 앞에 붙는 공통 prefix. 호출부에서는 쓰지 않는다.
const API_PREFIX = '/api/v1';

/** 백엔드 공통 응답 형식 */
type Envelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

/**
 * 백엔드가 내려준 실패.
 * code 로 분기하고, message 는 사용자에게 그대로 보여줄 수 있다.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 서버가 죽었거나 프록시가 HTML 을 돌려주면 JSON 파싱이 실패한다
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = null;
  }

  if (!res.ok || !body?.success) {
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? `요청에 실패했습니다 (HTTP ${res.status})`,
      res.status
    );
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
