import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export const HttpRequestLogSchema = new mongoose.Schema({
  requestId: String,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  method: String,
  url: String,
  // userIdentifier: String, // Optional: e.g., user ID or login name (COMMENTED OUT FOR NOW)
  statusCode: Number,
});

interface HttpRequestLog extends mongoose.Document {
  requestId: string;
  timestamp: Date;
  ipAddress: string;
  method: string;
  url: string;
  // userIdentifier?: string; // (COMMENTED OUT FOR NOW)
  statusCode?: number;
}

@Injectable()
export class HttpRequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpRequestLoggerMiddleware.name);

  constructor(
    @InjectModel('HttpRequestLog')
    private readonly httpRequestLogModel: Model<HttpRequestLog>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const timestamp = new Date();
    const ipAddress = req.ip || 'UNKNOWN';
    const method = req.method;
    const url = req.originalUrl;

    this.logger.log(`[${requestId}] ${method} ${url} - IP: ${ipAddress}`);

    res.on('finish', async () => {
      const statusCode = res.statusCode;
      this.logger.log(`[${requestId}] ${method} ${url} - Status: ${statusCode}`);

      try {
        await this.httpRequestLogModel.create({
          requestId,
          timestamp,
          ipAddress,
          method,
          url,
          statusCode,
        });
      } catch (error) {
        this.logger.error('Error saving HTTP request log:', error);
      }
    });

    next();
  }

  //   private extractUserIdentifier(req: Request): string | undefined {

  //     return undefined;
  //   }
}
