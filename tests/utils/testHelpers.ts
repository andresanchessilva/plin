import { Request, Response } from "express";
import { WebScrapingData } from "../../src/services/WebScrapingService";

export const mockRequest = (
  body: any = {},
  params: any = {},
  query: any = {}
): Partial<Request> => ({
  body,
  params,
  query,
  headers: {},
});

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockWebScrapingData: WebScrapingData = {
  titulo: "Test Article Title",
  conteudo:
    "This is the main content of the test article. It contains multiple sentences and paragraphs.",
  data_processamento: new Date("2024-01-01T12:00:00.000Z"),
  metadata: {
    url: "https://example.com/test-article",
    description: "Test article description",
    keywords: "test, article, example",
    author: "Test Author",
    language: "en",
    contentLength: 100,
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    links: ["https://example.com/link1", "https://example.com/link2"],
  },
};

export const mockHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Article Title</title>
    <meta name="description" content="Test article description">
    <meta name="keywords" content="test, article, example">
    <meta name="author" content="Test Author">
</head>
<body>
    <header>
        <nav>Navigation content</nav>
    </header>
    <main>
        <article>
            <h1>Test Article Title</h1>
            <p>This is the main content of the test article. It contains multiple sentences and paragraphs.</p>
            <p>This is another paragraph with more content.</p>
            <img src="/image1.jpg" alt="Test image 1">
            <img src="/image2.jpg" alt="Test image 2">
            <a href="/link1">Test Link 1</a>
            <a href="/link2">Test Link 2</a>
        </article>
    </main>
    <footer>
        <p>Footer content</p>
    </footer>
    <script>console.log('test');</script>
    <style>body { margin: 0; }</style>
</body>
</html>
`;

export const mockErrorHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Error 404 - Page Not Found</title>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The requested page could not be found.</p>
</body>
</html>
`;

export const createMockAxiosResponse = (data: any, status: number = 200) => ({
  data,
  status,
  statusText: "OK",
  headers: {},
  config: {},
});

export const createMockAxiosError = (message: string, status?: number) => {
  const error: any = new Error(message);
  error.isAxiosError = true;
  error.response = status
    ? {
        status,
        statusText: "Error",
        data: {},
        headers: {},
        config: {},
      }
    : undefined;
  error.code =
    status === 404
      ? "ENOTFOUND"
      : status === 403
      ? "ECONNREFUSED"
      : "ECONNABORTED";
  return error;
};
