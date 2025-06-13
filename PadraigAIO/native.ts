/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// NATIVE.TS - Enhanced with working IPFS upload integration from test plugin
// Fixed: Vencord frame wrapping + working pump.fun IPFS uploads

import bs58 from "bs58";
import fs from "fs";
import https from "https";
import { tmpdir } from "os";
import path from "path";
import zlib from "zlib";

export function generateSolanaKeypair(): string {
    const { Keypair } = require("@solana/web3.js");
    const keypair = Keypair.generate();
    return bs58.encode(keypair.secretKey);
}

// File-based storage helper for native context (from working test plugin)
class NativeFileStorage {
    private getUploadFilePath(): string {
        return path.join(tmpdir(), "pump_portal_upload_request.json");
    }

    async storeUploadData(imageData: string, metadata: any): Promise<boolean> {
        try {
            const uploadData = {
                imageData,
                metadata,
                timestamp: Date.now()
            };

            const filePath = this.getUploadFilePath();
            fs.writeFileSync(filePath, JSON.stringify(uploadData), "utf8");

            return true;
        } catch (error) {
            return false;
        }
    }

    async getCurrentUploadRequest(): Promise<{
        imageData: string;
        metadata: {
            name: string;
            symbol: string;
            filename: string;
            description: string;
            website: string;
            mint: string;
        };
    } | null> {
        try {
            const filePath = this.getUploadFilePath();

            if (!fs.existsSync(filePath)) {
                return null;
            }

            const fileContent = fs.readFileSync(filePath, "utf8");
            const uploadData = JSON.parse(fileContent);

            if (uploadData && uploadData.imageData && uploadData.metadata) {
                return {
                    imageData: uploadData.imageData,
                    metadata: uploadData.metadata
                };
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    clearUploadRequest(): void {
        try {
            const filePath = this.getUploadFilePath();
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}

const nativeFileStorage = new NativeFileStorage();

// Enhanced URL validation helper function
function validateAndCleanUrl(inputUrl: any): string {
    const urlString = String(inputUrl || "");

    if (!urlString || urlString === "null" || urlString === "undefined") {
        return "https://pumpportal.fun";
    }

    if (urlString.startsWith("@") && urlString.length > 30) {
        return "https://pumpportal.fun";
    }

    if (urlString && typeof urlString === "string") {
        const descriptionPatterns = [
            /speaks with/i,
            /tells the true story/i,
            /middle-aged couple/i,
            /630-mile trek/i,
            /^[A-Z][a-z]+['']s @/,
            /@\w+\s+@\w+/,
            /^@\w+\s+@\w+\s+\w+/,
            /Bro there is no token/i,
            /none in my believe/i,
        ];

        const looksLikeDescription = descriptionPatterns.some(pattern => pattern.test(urlString)) ||
                                   (urlString.length > 100 && !urlString.includes("http") && !urlString.includes(".com")) ||
                                   (urlString.startsWith("@") && urlString.length > 30 && !urlString.includes("http"));

        if (looksLikeDescription) {
            return "https://pumpportal.fun";
        }
    }

    const cleanInput = urlString.trim();

    if (cleanInput.length < 10) {
        return "https://pumpportal.fun";
    }

    if (cleanInput.length > 200 || cleanInput.includes(" ") || cleanInput.includes("\n")) {
        const urlPatterns = [
            /https?:\/\/(?:twitter\.com|x\.com|t\.co|trib\.al|pumpportal\.fun)\/[^\s\n\]]+/g,
            /https?:\/\/[^\s\n\]]+/g
        ];

        for (const pattern of urlPatterns) {
            const matches = cleanInput.match(pattern);
            if (matches && matches.length > 0) {
                const extractedUrl = matches[0].replace(/[.,!?;:]+$/, "");

                if (isValidUrl(extractedUrl)) {
                    return extractedUrl;
                }
            }
        }

        return "https://pumpportal.fun";
    }

    if (isValidUrl(cleanInput)) {
        return cleanInput;
    }

    if (!cleanInput.startsWith("http://") && !cleanInput.startsWith("https://")) {
        const urlWithProtocol = "https://" + cleanInput;
        if (isValidUrl(urlWithProtocol)) {
            return urlWithProtocol;
        }
    }

    return "https://pumpportal.fun";
}

function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

// Enhanced image download with Discord proxy support (from working test plugin)
async function downloadImageFromUrl(imageUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let finalUrl = imageUrl;

        if (imageUrl.includes("images-ext-") && imageUrl.includes("discordapp.net/external/")) {
            const match = imageUrl.match(/\/external\/[^\/]+\/(https?)\/(.+)$/);
            if (match) {
                const protocol = match[1];
                const actualUrl = match[2];
                finalUrl = `${protocol}://${actualUrl}`;
            } else {
                const altMatch = imageUrl.match(/\/external\/[^\/]+\/(.+)$/);
                if (altMatch) {
                    const extractedPart = altMatch[1];
                    if (extractedPart.startsWith("https") || extractedPart.startsWith("http")) {
                        finalUrl = extractedPart.replace("/", "://");
                    }
                }
            }
        }

        let url: URL;
        try {
            url = new URL(finalUrl);
        } catch (urlError) {
            if (finalUrl !== imageUrl) {
                try {
                    url = new URL(imageUrl);
                } catch (fallbackError) {
                    reject(new Error(`Invalid URL: ${finalUrl} (original: ${imageUrl})`));
                    return;
                }
            } else {
                reject(new Error(`Invalid URL: ${finalUrl}`));
                return;
            }
        }

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "Accept": "image/*,*/*;q=0.8",
                "Referer": "https://discord.com/"
            },
            timeout: 30000
        };

        const protocol = url.protocol === "https:" ? https : require("http");

        const req = protocol.request(options, (res: any) => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                reject(new Error(`HTTP ${res.statusCode}: Failed to download image from ${finalUrl}`));
                return;
            }

            const chunks: Buffer[] = [];

            res.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
            });

            res.on("end", () => {
                const imageBuffer = Buffer.concat(chunks);
                resolve(imageBuffer);
            });
        });

        req.on("error", (err: Error) => {
            reject(new Error(`Download failed: ${err.message}`));
        });

        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Download timeout"));
        });

        req.end();
    });
}

// Enhanced image optimization
function optimizeImageBuffer(imageBuffer: Buffer, maxSize: number = 1024 * 1024): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        if (imageBuffer.length <= maxSize) {
            resolve(imageBuffer);
            return;
        }

        if (imageBuffer.length > maxSize * 2) {
            const truncated = imageBuffer.subarray(0, Math.floor(maxSize * 0.8));
            resolve(truncated);
            return;
        }

        resolve(imageBuffer);
    });
}

// Detect image type from buffer
function detectImageType(imageBuffer: Buffer): { type: string; extension: string } {
    if (imageBuffer.length < 8) {
        return { type: "image/png", extension: "png" };
    }

    const header = imageBuffer.subarray(0, 8);

    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
        return { type: "image/jpeg", extension: "jpg" };
    }

    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        return { type: "image/png", extension: "png" };
    }

    return { type: "image/png", extension: "png" };
}

// Main IPFS upload function (from working test plugin)
function uploadToPumpFun(body: Buffer, contentType: string): Promise<{ uri: string; metadata: any }> {
    return new Promise((resolve, reject) => {
        const headers = {
            "Content-Type": contentType,
            "Content-Length": body.length.toString(),
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Origin": "https://pump.fun",
            "Referer": "https://pump.fun/create",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Cache-Control": "no-cache"
        };

        const options = {
            hostname: "pump.fun",
            path: "/api/ipfs",
            method: "POST",
            headers: headers,
            timeout: 60000
        };

        const req = https.request(options, res => {
            let data = Buffer.alloc(0);

            res.on("data", chunk => {
                data = Buffer.concat([data, chunk]);
            });

            res.on("end", () => {
                try {
                    let responseText: string;

                    const encoding = res.headers["content-encoding"];
                    if (encoding === "gzip") {
                        responseText = zlib.gunzipSync(data).toString("utf8");
                    } else if (encoding === "deflate") {
                        responseText = zlib.inflateSync(data).toString("utf8");
                    } else if (encoding === "br") {
                        responseText = zlib.brotliDecompressSync(data).toString("utf8");
                    } else {
                        responseText = data.toString("utf8");
                    }

                    if (res.statusCode !== 200) {
                        if (responseText.includes("<!DOCTYPE html>")) {
                            if (responseText.includes("Cloudflare") || responseText.includes("cf-ray")) {
                                reject(new Error("Cloudflare protection detected"));
                                return;
                            }
                            reject(new Error(`Server returned HTML error page (${res.statusCode})`));
                            return;
                        }
                        reject(new Error(`HTTP ${res.statusCode}: ${responseText.substring(0, 200)}`));
                        return;
                    }

                    let parsed;
                    try {
                        parsed = JSON.parse(responseText);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse JSON response: ${parseError.message}. Response: ${responseText.substring(0, 100)}`));
                        return;
                    }

                    if (parsed.metadataUri && parsed.metadata) {
                        resolve({ uri: parsed.metadataUri, metadata: parsed.metadata });
                    } else {
                        reject(new Error(`Invalid response structure: ${JSON.stringify(parsed)}`));
                    }

                } catch (parseError) {
                    reject(new Error(`Parse error: ${parseError.message}`));
                }
            });
        });

        req.on("error", err => {
            reject(new Error(`Request error: ${err.message}`));
        });

        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });

        const chunkSize = 64 * 1024;
        let offset = 0;

        const writeChunk = () => {
            if (offset >= body.length) {
                req.end();
                return;
            }

            const chunk = body.subarray(offset, Math.min(offset + chunkSize, body.length));
            req.write(chunk);
            offset += chunk.length;

            setImmediate(writeChunk);
        };

        writeChunk();
    });
}

// Upload function for bonk.fun
async function uploadToBonkFun(imageBuffer: Buffer, contentType: string, metadata: { name: string; symbol: string; description: string; website: string }): Promise<{ uri: string; metadata: any }> {
    const { name, symbol, description, website } = metadata;
    
    // Step 1: Upload image to bonk.fun
    const imageFormData = new FormData();
    const imageBlob = new Blob([imageBuffer], { type: contentType.split(';')[0] });
    imageFormData.append("image", imageBlob);

    const imgResponse = await fetch("https://nft-storage.letsbonk22.workers.dev/upload/img", {
        method: "POST",
        body: imageFormData,
    });
    
    if (!imgResponse.ok) {
        throw new Error(`Failed to upload image to bonk.fun: ${imgResponse.statusText}`);
    }
    
    const imgUri = await imgResponse.text();
    console.log("[BonkFun] Image uploaded:", imgUri);

    // Step 2: Upload metadata to bonk.fun
    const metadataResponse = await fetch("https://nft-storage.letsbonk22.workers.dev/upload/meta", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            createdOn: "https://bonk.fun",
            description: description,
            image: imgUri,
            name: name,
            symbol: symbol,
            website: "https://pumpportal.fun"
        }),
    });
    
    if (!metadataResponse.ok) {
        throw new Error(`Failed to upload metadata to bonk.fun: ${metadataResponse.statusText}`);
    }
    
    const metadataUri = await metadataResponse.text();
    console.log("[BonkFun] Metadata uploaded:", metadataUri);

    return {
        uri: metadataUri,
        metadata: {
            name,
            symbol,
            description,
            image: imgUri,
            website: "https://pumpportal.fun",
            createdOn: "https://bonk.fun"
        }
    };
}

// NEW: Step 1 - Store upload data with Vencord frame wrapping fix
export async function storeUploadData(...args: any[]): Promise<boolean> {
    try {
        let actualParams: any;

        if (args.length >= 2) {
            actualParams = args[1];
        } else if (args.length === 1) {
            const firstArg = args[0];
            if (firstArg && typeof firstArg === "object" && firstArg.type === "frame") {
                throw new Error("Received frame object but no actual parameters");
            } else {
                actualParams = firstArg;
            }
        } else {
            throw new Error("No parameters received");
        }

        let imageData: string;
        let metadata: any;

        if (typeof actualParams === "object" && actualParams !== null) {
            if (actualParams.imageData && actualParams.metadata) {
                imageData = actualParams.imageData;
                metadata = actualParams.metadata;
            } else {
                throw new Error(`Invalid parameter structure. Expected {imageData, metadata}, got: ${JSON.stringify(actualParams).substring(0, 100)}...`);
            }
        } else {
            throw new Error(`Expected object with imageData and metadata, got ${typeof actualParams}`);
        }

        if (!imageData || typeof imageData !== "string") {
            throw new Error(`Invalid imageData: expected string, got ${typeof imageData} (${String(imageData).substring(0, 50)}...)`);
        }

        if (!metadata || typeof metadata !== "object") {
            throw new Error(`Invalid metadata: expected object, got ${typeof metadata} (${String(metadata)})`);
        }

        return await nativeFileStorage.storeUploadData(imageData, metadata);
    } catch (error) {
        throw new Error(`StoreUploadData failed: ${error.message}`);
    }
}

// NEW: Step 2 - Process upload from temp file
export async function processUpload(): Promise<{ metadataUri: string; debugMetadata: string }> {
    try {
        const uploadStartTime = Date.now();

        const stored = await nativeFileStorage.getCurrentUploadRequest();

        if (!stored) {
            throw new Error("No current upload request found in temp file");
        }

        const { imageData, metadata } = stored;
        const { name, symbol, filename, description, website, mint, pool = "pump" } = metadata;

        if (!imageData || typeof imageData !== "string") {
            throw new Error(`Invalid imageData: expected string, got ${typeof imageData} (${imageData})`);
        }

        if (!metadata || typeof metadata !== "object") {
            throw new Error(`Invalid metadata: expected object, got ${typeof metadata}`);
        }

        if (!name || !symbol || !filename) {
            throw new Error(`Missing required metadata fields: name=${name}, symbol=${symbol}, filename=${filename}`);
        }

        let imageBuffer: Buffer;

        const imageDataStr = String(imageData);

        if (imageDataStr.startsWith("data:")) {
            const match = imageDataStr.match(/^data:([^;]+);base64,(.+)$/);
            if (!match) {
                throw new Error("Invalid data URL format from storage");
            }

            const base64Data = match[2];
            if (!base64Data || base64Data.length === 0) {
                throw new Error("Empty base64 data in data URL");
            }

            try {
                imageBuffer = Buffer.from(base64Data, "base64");
            } catch (base64Error) {
                throw new Error(`Failed to decode base64 data: ${base64Error.message}`);
            }

        } else if (imageDataStr.startsWith("http")) {
            imageBuffer = await downloadImageFromUrl(imageDataStr);
        } else {
            throw new Error(`Invalid image data format: must start with 'data:' or 'http', got: ${imageDataStr.substring(0, 50)}...`);
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error("Failed to create image buffer or buffer is empty");
        }

        const maxImageSize = 2 * 1024 * 1024;
        if (imageBuffer.length > maxImageSize) {
            imageBuffer = await optimizeImageBuffer(imageBuffer, maxImageSize);
        }

        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2, 15);
        const formParts: Buffer[] = [];

        const appendField = (fieldName: string, value: string) => {
            formParts.push(Buffer.from(`--${boundary}\r\n`));
            formParts.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"\r\n\r\n`));
            formParts.push(Buffer.from(`${String(value)}\r\n`));
        };

        const { type: contentType } = detectImageType(imageBuffer);

        formParts.push(Buffer.from(`--${boundary}\r\n`));
        formParts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${String(filename)}"\r\n`));
        formParts.push(Buffer.from(`Content-Type: ${contentType}\r\n\r\n`));
        formParts.push(imageBuffer);
        formParts.push(Buffer.from("\r\n"));

        appendField("name", String(name));
        appendField("symbol", String(symbol));
        appendField("description", String(description));
        appendField("twitter", website || "");
        appendField("telegram", website || "");
        appendField("website", "https://pumpportal.fun");
        appendField("showName", "true");

        formParts.push(Buffer.from(`--${boundary}--\r\n`));

        const body = Buffer.concat(formParts);
        const formContentType = `multipart/form-data; boundary=${boundary}`;

        const result = pool === "bonk" 
            ? await uploadToBonkFun(body, formContentType, { name, symbol, description, website })
            : await uploadToPumpFun(body, formContentType);

        const processingTime = Date.now() - uploadStartTime;

        nativeFileStorage.clearUploadRequest();

        return {
            metadataUri: result.uri,
            debugMetadata: JSON.stringify({
                ...result.metadata,
                testInfo: {
                    approach: "enhanced-two-step-integrated",
                    step1: "storeUploadData (handles Vencord frame + object wrapping)",
                    step2: "processUpload",
                    imageSource: imageDataStr.startsWith("data:") ? "data-url" : "remote-url",
                    originalImageDataLength: imageDataStr.length,
                    processedImageSize: imageBuffer.length,
                    processingTime: processingTime,
                    optimized: imageBuffer.length < body.length,
                    contentType: contentType,
                    metadata: metadata,
                    validationPassed: true,
                    vencordFrameWrappingHandled: true,
                    integratedWithMainPlugin: true,
                    timestamp: new Date().toISOString()
                }
            }, null, 2)
        };

    } catch (error: any) {
        nativeFileStorage.clearUploadRequest();

        const errorDetails = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };

        throw new Error(`ProcessUpload failed: ${error.message}`);
    }
}

// LEGACY: Enhanced upload complete workflow (kept for backward compatibility)
export async function uploadMetadataComplete(
    name: string,
    symbol: string,
    description: string,
    imageUrl: string,
    originalFilename: string,
    tweetUrl: string,
    mint: string
): Promise<{ metadataUri: string; debugMetadata: string }> {

    const cleanTweetUrl = validateAndCleanUrl(tweetUrl);

    try {
        // Use the new two-step approach internally
        const success = await nativeFileStorage.storeUploadData(imageUrl, {
            name,
            symbol,
            filename: originalFilename,
            description,
            website: cleanTweetUrl,
            mint
        });

        if (!success) {
            throw new Error("Failed to store upload data");
        }

        const result = await processUpload();
        return result;

    } catch (error) {
        throw error;
    }
}

// Test helpers
export async function testImageDownload(imageUrl: string): Promise<{
    success: boolean;
    size: number;
    contentType: string;
    error?: string;
}> {
    try {
        const buffer = await downloadImageFromUrl(imageUrl);
        const { type } = detectImageType(buffer);

        return {
            success: true,
            size: buffer.length,
            contentType: type
        };
    } catch (error: any) {
        return {
            success: false,
            size: 0,
            contentType: "",
            error: error.message
        };
    }
}

export function testImageDetection(imageBuffer: Buffer): {
    type: string;
    extension: string;
    size: number;
    isValid: boolean;
} {
    const { type, extension } = detectImageType(imageBuffer);

    return {
        type,
        extension,
        size: imageBuffer.length,
        isValid: imageBuffer.length > 100 && type !== "image/png"
    };
}

// Legacy functions for backward compatibility
export async function uploadMetadata(
    name: string,
    symbol: string,
    description: string,
    imageBase64: string,
    filename: string,
    tweetUrl: string,
    mint: string
): Promise<{ metadataUri: string; debugMetadata: string }> {
    const dataUrl = `data:image/png;base64,${imageBase64}`;
    return await uploadMetadataComplete(name, symbol, description, dataUrl, filename, tweetUrl, mint);
}

export async function uploadMetadataFromFile(
    name: string,
    symbol: string,
    description: string,
    filePath: string,
    originalFilename: string,
    tweetUrl: string,
    mint: string
): Promise<{ metadataUri: string; debugMetadata: string }> {

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found: " + filePath);
        }

        const imageBuffer = fs.readFileSync(filePath);
        const base64 = imageBuffer.toString("base64");
        const mimeType = originalFilename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        const result = await uploadMetadataComplete(
            name,
            symbol,
            description,
            dataUrl,
            originalFilename,
            tweetUrl,
            mint
        );

        try {
            fs.unlinkSync(filePath);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }

        return result;

    } catch (error) {
        throw error;
    }
}
