import { request as HttpRequest, HttpMethod } from 'urllib';
import { IncomingMessage } from 'http';

export interface AiSeg2RequestOptions {
  method: HttpMethod;
  password: string;
  headers?: Record<string, string>;
  data?: string;
}

export interface AiSeg2Response {
  data: string;
  res: IncomingMessage;
}

/**
 * HTTP client for AiSEG2 device communication.
 * Encapsulates common options: rejectUnauthorized, digestAuth, and default headers.
 */
export class AiSeg2HttpClient {
  constructor(
    private readonly host: string,
    private readonly password: string,
  ) { }

  get baseUrl(): string {
    return `http://${this.host}`;
  }

  private getDigestAuth(): string {
    return `aiseg:${this.password}`;
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  /**
   * Make an async HTTP request, returning the response body and response object.
   */
  async requestAsync(url: string, options: AiSeg2RequestOptions): Promise<AiSeg2Response> {
    const { data, res } = await HttpRequest(url, {
      method: options.method,
      rejectUnauthorized: false,
      digestAuth: this.getDigestAuth(),
      headers: options.headers ?? this.getDefaultHeaders(),
      data: options.data,
    });
    return { data: data as string, res: res as IncomingMessage };
  }

  /**
   * Convenience: GET request.
   */
  get(url: string): Promise<AiSeg2Response> {
    return this.requestAsync(url, { method: 'GET', password: this.password });
  }

  /**
   * Convenience: POST request with form-encoded data.
   */
  post(url: string, data: string): Promise<AiSeg2Response> {
    return this.requestAsync(url, {
      method: 'POST',
      password: this.password,
      data,
    });
  }
}
