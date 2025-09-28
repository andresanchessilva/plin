import axios from "axios";
import * as cheerio from "cheerio";

export interface WebScrapingData {
  titulo: string;
  conteudo: string;
  data_processamento: Date;
  metadata?: {
    url: string;
    description?: string;
    keywords?: string;
    author?: string;
    language?: string;
    contentLength: number;
    images?: string[];
    links?: string[];
  };
}

export class WebScrapingService {
  static async extractFromUrl(url: string): Promise<WebScrapingData> {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error("URL inválida fornecida");
      }

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      let titulo =
        $("title").text().trim() ||
        $("h1").first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "Página sem título";

      let conteudo = "";

      const contentSelectors = [
        "article",
        "main",
        ".content",
        ".post-content",
        ".entry-content",
        ".article-content",
        "#content",
        ".main-content",
        "section",
        'div[role="main"]',
      ];

      let mainContent = null;
      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0 && element.text().trim().length > 100) {
          mainContent = element;
          break;
        }
      }

      if (mainContent) {
        mainContent
          .find(
            "script, style, nav, header, footer, aside, .advertisement, .ads"
          )
          .remove();
        conteudo = mainContent.text().trim();
      } else {
        $("script, style, nav, header, footer, aside").remove();
        conteudo = $("body").text().trim();
      }

      conteudo = this.cleanText(conteudo);

      const metadata = this.extractMetadata($, url, conteudo);

      const data_processamento = new Date();

      return {
        titulo,
        conteudo,
        data_processamento,
        metadata,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error("Timeout ao acessar a URL");
        } else if (error.response?.status === 404) {
          throw new Error("Página não encontrada (404)");
        } else if (error.response?.status === 403) {
          throw new Error("Acesso negado (403)");
        } else {
          throw new Error(
            `Erro HTTP ${error.response?.status}: ${error.message}`
          );
        }
      }
      throw new Error(
        `Erro ao extrair dados da página: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();
  }

  private static extractMetadata(
    $: cheerio.CheerioAPI,
    url: string,
    conteudo: string
  ) {
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content");

    const keywords = $('meta[name="keywords"]').attr("content");

    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $('[rel="author"]').text().trim();

    const language =
      $("html").attr("lang") ||
      $('meta[http-equiv="content-language"]').attr("content");

    // Extrair imagens
    const images: string[] = [];
    $("img").each((_, element) => {
      const src = $(element).attr("src");
      if (src) {
        const absoluteUrl = this.makeAbsoluteUrl(url, src);
        if (absoluteUrl) {
          images.push(absoluteUrl);
        }
      }
    });

    // Extrair links
    const links: string[] = [];
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        const absoluteUrl = this.makeAbsoluteUrl(url, href);
        if (absoluteUrl) {
          links.push(absoluteUrl);
        }
      }
    });

    return {
      url,
      description,
      keywords,
      author,
      language,
      contentLength: conteudo.length,
      images: images.slice(0, 10),
      links: links.slice(0, 20),
    };
  }

  private static makeAbsoluteUrl(
    baseUrl: string,
    relativeUrl: string
  ): string | null {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return null;
    }
  }
}
