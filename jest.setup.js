import '@testing-library/jest-dom';

// Mock Response object
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// Mock Headers object
global.Headers = class Headers {
  constructor(init) {
    this.headers = new Map(init);
  }

  get(name) {
    return this.headers.get(name);
  }
}; 