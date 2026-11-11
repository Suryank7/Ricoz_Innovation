import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env';
import { AppError } from './error.middleware';

// Ensure upload directory exists
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, sanitizedExt).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${sanitizedExt}`);
  },
});

const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];

export const upload = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new AppError(`Disallowed file type. Permitted formats: ${allowedExtensions.join(', ')}`, 400));
    }
    cb(null, true);
  },
});
