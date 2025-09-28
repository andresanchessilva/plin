import pdf from "pdf-parse";
import fs from "fs";

export interface ExtractedData {
  titulo: string;
  conteudo: string;
  data_processamento: Date;
  metadata?: {
    pages: number;
    info?: any;
    version?: string;
  };
}

export class PDFExtractionService {
  static async extractFromFile(filePath: string): Promise<ExtractedData> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      const data_processamento = new Date();

      return {
        titulo: pdfData.info.Title,
        conteudo: pdfData.text,
        data_processamento,
        metadata: {
          pages: pdfData.numpages,
          info: pdfData.info,
          version: pdfData.version,
        },
      };
    } catch (error) {
      throw new Error(
        `Erro ao extrair dados do PDF: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }
}
