/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Enhanced storage helper using navigator.storage APIs
// Enhanced with default wallet management and wallet renaming

export interface Wallet {
    id: string;
    name: string;
    publicKey?: string;
    privateKey?: string;
    apiKey?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CachedImage {
    url: string;
    blob: Blob;
    metadata: {
        originalUrl: string;
        filename: string;
        size: number;
        type: string;
        discordProxy: boolean;
    };
    cachedAt: string;
}

// NEW: Created coins interface for tracking user's coins
export interface CreatedCoin {
    id: string;
    name: string;
    symbol: string;
    contractAddress: string;
    metadataUri: string;
    transactionSignature: string;
    walletId: string;
    status: "pending" | "confirmed" | "failed";
    createdAt: string;
    confirmedAt?: string;
}

// NEW: Token balance interface
export interface TokenBalance {
    mint: string;
    uiAmount: number;
    decimals: number;
    walletAddress: string;
    walletId?: string;
    tokenInfo?: {
        name?: string;
        symbol?: string;
        logoURI?: string;
    };
    lastUpdated: string;
}

class PumpStorageManager {
    private static instance: PumpStorageManager;
    private dbName = "PumpPortalPlugin";
    private dbVersion = 5; // Increased to fix version conflict

    static getInstance(): PumpStorageManager {
        if (!PumpStorageManager.instance) {
            PumpStorageManager.instance = new PumpStorageManager();
        }
        return PumpStorageManager.instance;
    }

    // Initialize IndexedDB with enhanced schema
    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error("[Storage] IndexedDB open error:", request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                console.log("[Storage] IndexedDB opened successfully, version:", request.result.version);
                resolve(request.result);
            };

            request.onupgradeneeded = event => {
                const db = (event.target as IDBOpenDBRequest).result;
                const { oldVersion } = event;
                const { newVersion } = event;

                console.log("[Storage] Database upgrade needed:", { oldVersion, newVersion });

                // Wallets store
                if (!db.objectStoreNames.contains("wallets")) {
                    console.log("[Storage] Creating wallets store");
                    const walletStore = db.createObjectStore("wallets", { keyPath: "id" });
                    walletStore.createIndex("name", "name", { unique: false });
                    walletStore.createIndex("createdAt", "createdAt", { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains("settings")) {
                    console.log("[Storage] Creating settings store");
                    db.createObjectStore("settings", { keyPath: "key" });
                }

                // Images store for caching Discord proxy images
                if (!db.objectStoreNames.contains("images")) {
                    console.log("[Storage] Creating images store");
                    const imageStore = db.createObjectStore("images", { keyPath: "url" });
                    imageStore.createIndex("cachedAt", "cachedAt", { unique: false });
                    imageStore.createIndex("originalUrl", "metadata.originalUrl", { unique: false });
                }

                // Upload history for debugging
                if (!db.objectStoreNames.contains("uploadHistory")) {
                    console.log("[Storage] Creating uploadHistory store");
                    const uploadStore = db.createObjectStore("uploadHistory", { keyPath: "id" });
                    uploadStore.createIndex("timestamp", "timestamp", { unique: false });
                    uploadStore.createIndex("success", "success", { unique: false });
                }

                // Created coins store
                if (!db.objectStoreNames.contains("createdCoins")) {
                    console.log("[Storage] Creating createdCoins store");
                    const coinStore = db.createObjectStore("createdCoins", { keyPath: "id" });
                    coinStore.createIndex("walletId", "walletId", { unique: false });
                    coinStore.createIndex("status", "status", { unique: false });
                    coinStore.createIndex("createdAt", "createdAt", { unique: false });
                    coinStore.createIndex("contractAddress", "contractAddress", { unique: false });
                }

                // Token balances store
                if (!db.objectStoreNames.contains("tokenBalances")) {
                    console.log("[Storage] Creating tokenBalances store");
                    const balanceStore = db.createObjectStore("tokenBalances", { keyPath: ["walletAddress", "mint"] });
                    balanceStore.createIndex("walletAddress", "walletAddress", { unique: false });
                    balanceStore.createIndex("mint", "mint", { unique: false });
                    balanceStore.createIndex("lastUpdated", "lastUpdated", { unique: false });
                }

                console.log("[Storage] Database upgrade completed");
            };

            request.onblocked = () => {
                console.warn("[Storage] Database upgrade blocked - close other tabs");
                reject(new Error("Database upgrade blocked. Please close other tabs and try again."));
            };
        });
    }

    // 💼 ENHANCED WALLET MANAGEMENT
    async storeWallet(wallet: Wallet): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["wallets"], "readwrite");
        const store = transaction.objectStore("wallets");

        const walletWithTimestamp = {
            ...wallet,
            createdAt: wallet.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(walletWithTimestamp);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Wallet stored successfully:", wallet.name);
    }

    async getWallets(): Promise<Wallet[]> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["wallets"], "readonly");
            const store = transaction.objectStore("wallets");

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("[Storage] Failed to get wallets:", error);
            return [];
        }
    }

    async deleteWallet(walletId: string): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["wallets"], "readwrite");
        const store = transaction.objectStore("wallets");

        await new Promise<void>((resolve, reject) => {
            const request = store.delete(walletId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Wallet deleted:", walletId);
    }

    // NEW: Rename wallet
    async renameWallet(walletId: string, newName: string): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["wallets"], "readwrite");
        const store = transaction.objectStore("wallets");

        // Get the wallet first
        const wallet = await new Promise<Wallet>((resolve, reject) => {
            const request = store.get(walletId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        // Update the name and updatedAt timestamp
        const updatedWallet = {
            ...wallet,
            name: newName.trim(),
            updatedAt: new Date().toISOString()
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(updatedWallet);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Wallet renamed:", walletId, "to", newName);
    }

    // NEW: Default wallet management
    async setDefaultWallet(walletId: string | null): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["settings"], "readwrite");
        const store = transaction.objectStore("settings");

        const setting = {
            key: "defaultWallet",
            value: walletId,
            updatedAt: new Date().toISOString()
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(setting);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Default wallet set:", walletId);
    }

    async getDefaultWallet(): Promise<string | null> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["settings"], "readonly");
            const store = transaction.objectStore("settings");

            const setting = await new Promise<any>(resolve => {
                const request = store.get("defaultWallet");
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });

            return setting?.value || null;
        } catch (error) {
            console.error("[Storage] Failed to get default wallet:", error);
            return null;
        }
    }

    // NEW: Created coins management
    async storeCreatedCoin(coin: CreatedCoin): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["createdCoins"], "readwrite");
        const store = transaction.objectStore("createdCoins");

        await new Promise<void>((resolve, reject) => {
            const request = store.put(coin);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Created coin stored:", coin.name);
    }

    async updateCreatedCoinStatus(coinId: string, status: "pending" | "confirmed" | "failed", contractAddress?: string): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["createdCoins"], "readwrite");
        const store = transaction.objectStore("createdCoins");

        // Get the existing coin
        const coin = await new Promise<CreatedCoin>((resolve, reject) => {
            const request = store.get(coinId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (!coin) {
            throw new Error("Created coin not found");
        }

        // Update the coin status
        const updatedCoin = {
            ...coin,
            status,
            contractAddress: contractAddress || coin.contractAddress,
            confirmedAt: status === "confirmed" ? new Date().toISOString() : coin.confirmedAt
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(updatedCoin);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log("[Storage] Updated coin status:", coinId, "to", status);
    }

    async getCreatedCoins(walletId?: string): Promise<CreatedCoin[]> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["createdCoins"], "readonly");
            const store = transaction.objectStore("createdCoins");

            if (walletId) {
                const index = store.index("walletId");
                return new Promise((resolve, reject) => {
                    const request = index.getAll(walletId);
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => reject(request.error);
                });
            } else {
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => reject(request.error);
                });
            }
        } catch (error) {
            console.error("[Storage] Failed to get created coins:", error);
            return [];
        }
    }

    // NEW: Token balance management
    async storeTokenBalance(balance: TokenBalance): Promise<void> {
        const db = await this.openDB();
        const transaction = db.transaction(["tokenBalances"], "readwrite");
        const store = transaction.objectStore("tokenBalances");

        await new Promise<void>((resolve, reject) => {
            const request = store.put(balance);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["tokenBalances"], "readonly");
            const store = transaction.objectStore("tokenBalances");
            const index = store.index("walletAddress");

            return new Promise((resolve, reject) => {
                const request = index.getAll(walletAddress);
                request.onsuccess = () => {
                    const balances = request.result || [];
                    // Filter out zero balances and sort by amount descending
                    const filtered = balances
                        .filter(b => b.uiAmount > 0)
                        .sort((a, b) => b.uiAmount - a.uiAmount);
                    resolve(filtered);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("[Storage] Failed to get token balances:", error);
            return [];
        }
    }

    // 🖼️ ENHANCED IMAGE CACHING FOR IPFS UPLOADS
    async cacheImage(imageUrl: string, imageBlob: Blob, metadata: any = {}): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["images"], "readwrite");
            const store = transaction.objectStore("images");

            const cachedImage: CachedImage = {
                url: imageUrl,
                blob: imageBlob,
                metadata: {
                    originalUrl: metadata.originalUrl || imageUrl,
                    filename: metadata.filename || "image.png",
                    size: imageBlob.size,
                    type: imageBlob.type,
                    discordProxy: imageUrl.includes("discordapp.net/external/")
                },
                cachedAt: new Date().toISOString()
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(cachedImage);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            console.log("[Storage] Image cached for IPFS uploads:", {
                url: imageUrl,
                size: this.formatBytes(imageBlob.size),
                type: imageBlob.type
            });

            // Also cache in Cache API for faster access (with fixed headers)
            await this.cacheImageInCacheAPI(imageUrl, imageBlob);

        } catch (error) {
            console.error("[Storage] Failed to cache image:", error);
        }
    }

    private async cacheImageInCacheAPI(imageUrl: string, imageBlob: Blob): Promise<void> {
        try {
            const cache = await caches.open("pump-portal-images-v2");

            // Fix: Ensure all header values are ASCII-safe
            const safeUrl = this.ensureASCII(imageUrl);
            const currentTime = new Date().toISOString();

            const response = new Response(imageBlob, {
                headers: {
                    "Content-Type": imageBlob.type || "image/png",
                    "X-Cached-At": currentTime,
                    "X-Original-URL": safeUrl, // Use ASCII-safe URL
                    "X-Pump-Portal-Cache": "v2"
                }
            });

            await cache.put(imageUrl, response);
            console.log("[Storage] Image cached in Cache API successfully");

        } catch (error) {
            console.error("[Storage] Failed to cache in Cache API:", error);
            // Don't throw - this is just a performance optimization
        }
    }

    // Helper to ensure string is ASCII-safe for headers
    private ensureASCII(str: string): string {
        try {
            // Remove or replace non-ASCII characters
            return str.replace(/[^\x00-\x7F]/g, "?");
        } catch (error) {
            return "fallback-url";
        }
    }

    async getCachedImage(imageUrl: string): Promise<CachedImage | null> {
        try {
            // Try IndexedDB first for full metadata
            const db = await this.openDB();
            const transaction = db.transaction(["images"], "readonly");
            const store = transaction.objectStore("images");

            const cachedImage = await new Promise<CachedImage | null>(resolve => {
                const request = store.get(imageUrl);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => resolve(null);
            });

            if (cachedImage) {
                // Check if cache is still valid (24 hours)
                const age = Date.now() - new Date(cachedImage.cachedAt).getTime();
                if (age > 86400000) { // 24 hours
                    await this.deleteCachedImage(imageUrl);
                    return null;
                }

                console.log("[Storage] Image found in IndexedDB cache:", {
                    url: imageUrl,
                    size: this.formatBytes(cachedImage.blob.size),
                    age: this.formatDuration(age)
                });
                return cachedImage;
            }

            return null;
        } catch (error) {
            console.error("[Storage] Failed to get cached image:", error);
            return null;
        }
    }

    async deleteCachedImage(imageUrl: string): Promise<void> {
        try {
            // Delete from IndexedDB
            const db = await this.openDB();
            const transaction = db.transaction(["images"], "readwrite");
            const store = transaction.objectStore("images");
            await new Promise<void>((resolve, reject) => {
                const request = store.delete(imageUrl);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Delete from Cache API
            try {
                const cache = await caches.open("pump-portal-images-v2");
                await cache.delete(imageUrl);
            } catch (cacheError) {
                console.warn("[Storage] Failed to delete from Cache API:", cacheError);
            }

            console.log("[Storage] Cached image deleted:", imageUrl);
        } catch (error) {
            console.error("[Storage] Failed to delete cached image:", error);
        }
    }

    // 📊 UPLOAD HISTORY FOR DEBUGGING IPFS ISSUES
    async recordUploadAttempt(uploadData: {
        imageUrl: string;
        method: "cached" | "direct";
        success: boolean;
        error?: string;
        metadata?: any;
    }): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["uploadHistory"], "readwrite");
            const store = transaction.objectStore("uploadHistory");

            const record = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                ...uploadData
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(record);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error("[Storage] Failed to record upload attempt:", error);
        }
    }

    async getUploadHistory(limit: number = 50): Promise<any[]> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["uploadHistory"], "readonly");
            const store = transaction.objectStore("uploadHistory");
            const index = store.index("timestamp");

            return new Promise((resolve, reject) => {
                const request = index.getAll(null, limit);
                request.onsuccess = () => {
                    const results = request.result || [];
                    // Sort by timestamp descending
                    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    resolve(results);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("[Storage] Failed to get upload history:", error);
            return [];
        }
    }

    // 🔄 HELPER METHODS FOR IPFS UPLOAD OPTIMIZATION
    async prepareImageForIPFS(imageUrl: string): Promise<{
        blob: Blob;
        filename: string;
        fromCache: boolean;
        metadata: any;
    } | null> {
        console.log("[Storage] Preparing image for IPFS upload:", imageUrl);

        // First, try to get from cache
        const cachedImage = await this.getCachedImage(imageUrl);
        if (cachedImage) {
            console.log("[Storage] Using cached image for IPFS upload");
            return {
                blob: cachedImage.blob,
                filename: cachedImage.metadata.filename,
                fromCache: true,
                metadata: cachedImage.metadata
            };
        }

        // If not cached, we'll need to download it
        console.log("[Storage] Image not cached, will need to download for IPFS");
        return null;
    }

    async optimizeImageForIPFS(blob: Blob, maxSize: number = 1024 * 1024): Promise<Blob> {
        // If image is already small enough, return as-is
        if (blob.size <= maxSize) {
            return blob;
        }

        console.log("[Storage] Optimizing image for IPFS:", {
            originalSize: this.formatBytes(blob.size),
            maxSize: this.formatBytes(maxSize)
        });

        // Create canvas for resizing
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Cannot get canvas context"));
                return;
            }

            img.onload = () => {
                // Calculate new dimensions maintaining aspect ratio
                let { width, height } = img;
                const maxDimension = 800; // Max width/height

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                // Try different quality levels until we get under maxSize
                const tryQuality = (quality: number): void => {
                    canvas.toBlob(optimizedBlob => {
                        if (!optimizedBlob) {
                            reject(new Error("Failed to optimize image"));
                            return;
                        }

                        if (optimizedBlob.size <= maxSize || quality <= 0.1) {
                            console.log("[Storage] Image optimized:", {
                                originalSize: this.formatBytes(blob.size),
                                optimizedSize: this.formatBytes(optimizedBlob.size),
                                reduction: `${(((blob.size - optimizedBlob.size) / blob.size) * 100).toFixed(1)}%`,
                                quality: quality
                            });
                            resolve(optimizedBlob);
                        } else {
                            // Try lower quality
                            tryQuality(Math.max(0.1, quality - 0.1));
                        }
                    }, "image/jpeg", quality);
                };

                tryQuality(0.8); // Start with 80% quality
            };

            img.onerror = () => reject(new Error("Failed to load image for optimization"));
            img.src = URL.createObjectURL(blob);
        });
    }

    // 📊 STORAGE ANALYTICS
    async getStorageInfo(): Promise<any> {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const usagePercent = quota > 0 ? (usage / quota * 100).toFixed(2) : "0";

            // Get detailed breakdown
            const db = await this.openDB();
            const transaction = db.transaction(["wallets", "images", "uploadHistory", "createdCoins", "tokenBalances"], "readonly");

            const walletCount = await new Promise<number>(resolve => {
                const request = transaction.objectStore("wallets").count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const imageCount = await new Promise<number>(resolve => {
                const request = transaction.objectStore("images").count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const uploadCount = await new Promise<number>(resolve => {
                const request = transaction.objectStore("uploadHistory").count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const coinCount = await new Promise<number>(resolve => {
                const request = transaction.objectStore("createdCoins").count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const balanceCount = await new Promise<number>(resolve => {
                const request = transaction.objectStore("tokenBalances").count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            return {
                usage: this.formatBytes(usage),
                quota: this.formatBytes(quota),
                usagePercent: `${usagePercent}%`,
                usageBytes: usage,
                quotaBytes: quota,
                breakdown: {
                    wallets: walletCount,
                    cachedImages: imageCount,
                    uploadHistory: uploadCount,
                    createdCoins: coinCount,
                    tokenBalances: balanceCount
                }
            };
        } catch (error) {
            console.error("[Storage] Failed to get storage info:", error);
            return null;
        }
    }

    // 🧹 CLEANUP METHODS
    async clearImageCache(): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["images"], "readwrite");
            const store = transaction.objectStore("images");

            await new Promise<void>((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            try {
                await caches.delete("pump-portal-images-v2");
            } catch (cacheError) {
                console.warn("[Storage] Failed to clear Cache API:", cacheError);
            }

            console.log("[Storage] Image cache cleared");
        } catch (error) {
            console.error("[Storage] Failed to clear image cache:", error);
        }
    }

    async clearOldUploads(): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(["uploadHistory"], "readwrite");
            const store = transaction.objectStore("uploadHistory");
            const index = store.index("timestamp");

            // Keep only last 100 records
            const allRecords = await new Promise<any[]>((resolve, reject) => {
                const request = index.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });

            if (allRecords.length > 100) {
                allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                const toDelete = allRecords.slice(100);

                for (const record of toDelete) {
                    await new Promise<void>((resolve, reject) => {
                        const deleteRequest = store.delete(record.id);
                        deleteRequest.onsuccess = () => resolve();
                        deleteRequest.onerror = () => reject(deleteRequest.error);
                    });
                }

                console.log("[Storage] Cleaned up old upload records:", toDelete.length);
            }
        } catch (error) {
            console.error("[Storage] Failed to clear old uploads:", error);
        }
    }

    // 🔧 UTILITY METHODS
    private formatBytes(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// Export singleton instance
export const storageManager = PumpStorageManager.getInstance();

// Enhanced wallet store functions (backwards compatible)
export async function getStoredWallets(): Promise<Wallet[]> {
    return await storageManager.getWallets();
}

export async function storeWallet(wallet: Wallet): Promise<void> {
    await storageManager.storeWallet(wallet);
}

export async function deleteStoredWallet(walletId: string): Promise<void> {
    await storageManager.deleteWallet(walletId);
}

// NEW: Default wallet functions
export async function getDefaultWallet(): Promise<string | null> {
    return await storageManager.getDefaultWallet();
}

export async function setDefaultWallet(walletId: string | null): Promise<void> {
    await storageManager.setDefaultWallet(walletId);
}

// NEW: Wallet renaming function
export async function renameWallet(walletId: string, newName: string): Promise<void> {
    await storageManager.renameWallet(walletId, newName);
}

// NEW: Created coins functions
export async function getCreatedCoins(walletId?: string): Promise<CreatedCoin[]> {
    return await storageManager.getCreatedCoins(walletId);
}

export async function storeCreatedCoin(coin: CreatedCoin): Promise<void> {
    await storageManager.storeCreatedCoin(coin);
}

export async function updateCreatedCoinStatus(coinId: string, status: "pending" | "confirmed" | "failed", contractAddress?: string): Promise<void> {
    await storageManager.updateCreatedCoinStatus(coinId, status, contractAddress);
}

// NEW: Utility function to extract contract address from transaction
export function extractContractAddressFromTx(transactionData: any): string | null {
    try {
        // This is a simplified extraction - in reality you'd need to parse the transaction logs
        // For now, we'll return null and let the confirmation process handle it
        if (transactionData && transactionData.result && transactionData.result.meta && transactionData.result.meta.postTokenBalances) {
            const tokenBalances = transactionData.result.meta.postTokenBalances;
            if (tokenBalances.length > 0) {
                return tokenBalances[0].mint;
            }
        }
        return null;
    } catch (error) {
        console.error("[Storage] Failed to extract contract address:", error);
        return null;
    }
}

// NEW: Token balance functions
export async function getStoredTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    return await storageManager.getTokenBalances(walletAddress);
}

export async function storeTokenBalance(balance: TokenBalance): Promise<void> {
    await storageManager.storeTokenBalance(balance);
}

// NEW: Fetch fresh token balances from RPC
export async function fetchTokenBalances(walletAddress: string, walletId?: string): Promise<TokenBalance[]> {
    try {
        console.log("[Storage] Fetching token balances for:", walletAddress);

        const response = await fetch("https://rpc.helius.xyz/?api-key=e3b54e60-daee-442f-8b75-1893c5be291f", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    walletAddress,
                    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
                    { encoding: "jsonParsed" }
                ]
            })
        });

        const data = await response.json();

        if (!data.result?.value) {
            console.log("[Storage] No token accounts found");
            return [];
        }

        const balances: TokenBalance[] = [];
        const currentTime = new Date().toISOString();

        for (const account of data.result.value) {
            const tokenInfo = account.account.data.parsed.info;

            if (tokenInfo.tokenAmount.uiAmount > 0) {
                const balance: TokenBalance = {
                    mint: tokenInfo.mint,
                    uiAmount: tokenInfo.tokenAmount.uiAmount,
                    decimals: tokenInfo.tokenAmount.decimals,
                    walletAddress: walletAddress,
                    walletId: walletId,
                    lastUpdated: currentTime
                };

                // Store in database
                await storageManager.storeTokenBalance(balance);
                balances.push(balance);
            }
        }

        console.log("[Storage] Fetched and stored", balances.length, "token balances");
        return balances;
    } catch (error) {
        console.error("[Storage] Failed to fetch token balances:", error);
        throw error;
    }
}

// NEW: Portfolio summary function
export async function getPortfolioSummary(walletId?: string): Promise<{
    totalCoinsCreated: number;
    totalTokensHeld: number;
    pendingCoins: number;
    confirmedCoins: number;
}> {
    try {
        const createdCoins = await getCreatedCoins(walletId);
        const confirmedCoins = createdCoins.filter(c => c.status === "confirmed").length;
        const pendingCoins = createdCoins.filter(c => c.status === "pending").length;

        // Get token count from all wallets if no specific wallet
        let totalTokensHeld = 0;
        if (walletId) {
            const wallet = (await getStoredWallets()).find(w => w.id === walletId);
            if (wallet?.publicKey) {
                const balances = await getStoredTokenBalances(wallet.publicKey);
                totalTokensHeld = balances.length;
            }
        } else {
            const wallets = await getStoredWallets();
            for (const wallet of wallets) {
                if (wallet.publicKey) {
                    const balances = await getStoredTokenBalances(wallet.publicKey);
                    totalTokensHeld += balances.length;
                }
            }
        }

        return {
            totalCoinsCreated: createdCoins.length,
            totalTokensHeld,
            pendingCoins,
            confirmedCoins
        };
    } catch (error) {
        console.error("[Storage] Failed to get portfolio summary:", error);
        return {
            totalCoinsCreated: 0,
            totalTokensHeld: 0,
            pendingCoins: 0,
            confirmedCoins: 0
        };
    }
}

// Image caching helpers optimized for IPFS uploads
export async function cacheImageForIPFS(imageUrl: string, imageBlob: Blob, metadata?: any): Promise<void> {
    await storageManager.cacheImage(imageUrl, imageBlob, metadata);
}

export async function getCachedImageForIPFS(imageUrl: string): Promise<{
    blob: Blob;
    filename: string;
    metadata: any;
} | null> {
    const cached = await storageManager.getCachedImage(imageUrl);
    if (cached) {
        return {
            blob: cached.blob,
            filename: cached.metadata.filename,
            metadata: cached.metadata
        };
    }
    return null;
}

export async function prepareImageForIPFSUpload(imageUrl: string): Promise<{
    blob: Blob;
    filename: string;
    fromCache: boolean;
    optimized: boolean;
}> {
    const prepared = await storageManager.prepareImageForIPFS(imageUrl);

    if (prepared) {
        // Try to optimize if it's too large
        const maxSize = 1024 * 1024; // 1MB
        if (prepared.blob.size > maxSize) {
            const optimized = await storageManager.optimizeImageForIPFS(prepared.blob, maxSize);
            return {
                blob: optimized,
                filename: prepared.filename,
                fromCache: prepared.fromCache,
                optimized: true
            };
        }

        return { ...prepared, optimized: false };
    }

    throw new Error("Image not available and not cached");
}
