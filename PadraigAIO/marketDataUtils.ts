/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Enhanced Market Data Collection and Analysis Utilities
 * Provides comprehensive market data from multiple sources with advanced analytics
 */

export interface EnhancedTokenMetadata {
    // Basic token info
    address: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    totalSupply?: number;
    description?: string;
    logoURI?: string;

    // Market data
    price?: number;
    marketCap?: number;
    fullyDilutedValuation?: number;
    volume24h?: number;
    volume1h?: number;
    volume6h?: number;
    volume7d?: number;
    priceChange1h?: number;
    priceChange6h?: number;
    priceChange24h?: number;
    priceChange7d?: number;
    priceChange30d?: number;

    // Trading metrics
    buys24h?: number;
    sells24h?: number;
    transactions24h?: number;
    uniqueWallets24h?: number;
    holdersCount?: number;
    liquidity?: number;
    liquidityUsd?: number;

    // Pool information
    pooledSol?: number;
    pooledTokens?: number;
    poolAddress?: string;
    dexName?: string;

    // Price extremes
    ath?: number; // All time high
    athDate?: string;
    atl?: number; // All time low
    atlDate?: string;
    high24h?: number;
    low24h?: number;

    // Social and external links
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
    reddit?: string;

    // Analytical metrics
    volatility?: number;
    beta?: number;
    sharpeRatio?: number;
    volume24hChangePercent?: number;
    marketCapRank?: number;

    // Supply metrics
    circulatingSupply?: number;
    maxSupply?: number;
    inflationRate?: number;
    burnRate?: number;

    // DeFi metrics
    tvl?: number; // Total value locked
    apr?: number; // Annual percentage rate
    apy?: number; // Annual percentage yield
    stakingRatio?: number;

    // Risk metrics
    rugPullRisk?: "low" | "medium" | "high";
    liquidityRisk?: "low" | "medium" | "high";
    concentrationRisk?: "low" | "medium" | "high";

    // Timestamp and source info
    lastUpdated?: string;
    dataSource?: string[];
    confidence?: number; // 0-1 confidence in data accuracy
}

export interface MarketDataSource {
    name: string;
    priority: number;
    rateLimit: number; // requests per minute
    lastRequest: number;
    available: boolean;
}

export interface PriceAlert {
    tokenAddress: string;
    type: "above" | "below" | "change_percent";
    targetValue: number;
    currentValue: number;
    triggered: boolean;
    createdAt: string;
}

export class EnhancedMarketDataCollector {
    private requestCache = new Map<string, { data: any; timestamp: number }>();
    private readonly cacheTimeout = 60000; // 1 minute cache
    private requestQueue: Array<{ source: string; request: () => Promise<any> }> = [];
    private isProcessingQueue = false;

    // Data sources configuration
    private dataSources: { [key: string]: MarketDataSource } = {
        dexscreener: {
            name: "DexScreener",
            priority: 1,
            rateLimit: 60, // 60 requests per minute
            lastRequest: 0,
            available: true
        },
        jupiter: {
            name: "Jupiter",
            priority: 2,
            rateLimit: 100,
            lastRequest: 0,
            available: true
        },
        coingecko: {
            name: "CoinGecko",
            priority: 3,
            rateLimit: 30,
            lastRequest: 0,
            available: true
        },
        birdeye: {
            name: "Birdeye",
            priority: 4,
            rateLimit: 50,
            lastRequest: 0,
            available: true
        },
        solscan: {
            name: "Solscan",
            priority: 5,
            rateLimit: 60,
            lastRequest: 0,
            available: true
        },
        solana_rpc: {
            name: "Solana RPC",
            priority: 6,
            rateLimit: 120,
            lastRequest: 0,
            available: true
        },
        helius: {
            name: "Helius",
            priority: 7,
            rateLimit: 60,
            lastRequest: 0,
            available: true
        }
    };

    /**
     * Main function to collect comprehensive market data
     */
    async collectComprehensiveMarketData(
        tokenAddress: string,
        options: {
            includeHistorical?: boolean;
            includeOnChain?: boolean;
            includeSocial?: boolean;
            includeRiskAnalysis?: boolean;
            maxSources?: number;
        } = {}
    ): Promise<EnhancedTokenMetadata> {
        const {
            includeHistorical = true,
            includeOnChain = true,
            includeSocial = true,
            includeRiskAnalysis = true,
            maxSources = 5
        } = options;

        console.log(`[MarketDataCollector] Collecting comprehensive data for ${tokenAddress}`);

        const aggregatedData: EnhancedTokenMetadata = {
            address: tokenAddress,
            dataSource: [],
            lastUpdated: new Date().toISOString()
        };

        try {
            // Collect data from multiple sources in parallel
            const dataPromises: Promise<Partial<EnhancedTokenMetadata>>[] = [];

            // Primary market data sources
            dataPromises.push(this.fetchDexScreenerData(tokenAddress));
            dataPromises.push(this.fetchJupiterData(tokenAddress));
            dataPromises.push(this.fetchCoinGeckoData(tokenAddress));
            dataPromises.push(this.fetchBirdeyeData(tokenAddress));

            if (includeOnChain) {
                dataPromises.push(this.fetchOnChainData(tokenAddress));
                dataPromises.push(this.fetchSolscanData(tokenAddress));
            }

            if (includeSocial) {
                dataPromises.push(this.fetchSocialData(tokenAddress));
            }

            // Wait for all data sources with timeout
            const results = await Promise.allSettled(
                dataPromises.map(p => Promise.race([
                    p,
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout")), 10000)
                    )
                ]))
            );

            // Aggregate successful results
            results.forEach((result, index) => {
                if (result.status === "fulfilled" && result.value) {
                    this.mergeMarketData(aggregatedData, result.value);
                } else {
                    console.warn(`[MarketDataCollector] Source ${index} failed:`, result);
                }
            });

            // Calculate derived metrics
            this.calculateDerivedMetrics(aggregatedData);

            if (includeRiskAnalysis) {
                await this.performRiskAnalysis(aggregatedData);
            }

            // Set confidence score based on data completeness
            aggregatedData.confidence = this.calculateConfidenceScore(aggregatedData);

            console.log(`[MarketDataCollector] Collected data from ${aggregatedData.dataSource?.length || 0} sources`);

        } catch (error) {
            console.error("[MarketDataCollector] Error collecting data:", error);
            aggregatedData.confidence = 0.1;
        }

        return aggregatedData;
    }

    /**
     * Fetch data from DexScreener API
     */
    private async fetchDexScreenerData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `dexscreener_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
            const data = await response.json();

            if (data.pairs && data.pairs.length > 0) {
                // Select best pair by liquidity
                const bestPair = data.pairs.reduce((best: any, current: any) => {
                    const currentLiquidity = parseFloat(current.liquidity?.usd || "0");
                    const bestLiquidity = parseFloat(best.liquidity?.usd || "0");
                    return currentLiquidity > bestLiquidity ? current : best;
                });

                const result: Partial<EnhancedTokenMetadata> = {
                    name: bestPair.baseToken.name,
                    symbol: bestPair.baseToken.symbol,
                    price: parseFloat(bestPair.priceUsd || "0"),
                    marketCap: parseFloat(bestPair.marketCap || "0"),
                    fullyDilutedValuation: parseFloat(bestPair.fdv || "0"),
                    volume24h: parseFloat(bestPair.volume?.h24 || "0"),
                    volume1h: parseFloat(bestPair.volume?.h1 || "0"),
                    volume6h: parseFloat(bestPair.volume?.h6 || "0"),
                    priceChange24h: parseFloat(bestPair.priceChange?.h24 || "0"),
                    priceChange1h: parseFloat(bestPair.priceChange?.h1 || "0"),
                    priceChange6h: parseFloat(bestPair.priceChange?.h6 || "0"),
                    liquidity: parseFloat(bestPair.liquidity?.usd || "0"),
                    poolAddress: bestPair.pairAddress,
                    dexName: bestPair.dexId,
                    buys24h: parseInt(bestPair.txns?.h24?.buys || "0"),
                    sells24h: parseInt(bestPair.txns?.h24?.sells || "0"),
                    transactions24h: parseInt(bestPair.txns?.h24?.buys || "0") + parseInt(bestPair.txns?.h24?.sells || "0"),
                    website: bestPair.info?.websites?.[0],
                    twitter: bestPair.info?.socials?.find((s: any) => s.type === "twitter")?.url,
                    telegram: bestPair.info?.socials?.find((s: any) => s.type === "telegram")?.url,
                    dataSource: ["dexscreener"]
                };

                this.setCachedData(cacheKey, result);
                return result;
            }
        } catch (error) {
            console.warn("[MarketDataCollector] DexScreener API error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch data from Jupiter API
     */
    private async fetchJupiterData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `jupiter_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAddress}`);
            const data = await response.json();

            if (data.data && data.data[tokenAddress]) {
                const tokenData = data.data[tokenAddress];
                const result: Partial<EnhancedTokenMetadata> = {
                    price: tokenData.price,
                    dataSource: ["jupiter"]
                };

                this.setCachedData(cacheKey, result);
                return result;
            }
        } catch (error) {
            console.warn("[MarketDataCollector] Jupiter API error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch data from CoinGecko API
     */
    private async fetchCoinGeckoData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `coingecko_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // First try to find the token by address
            const searchResponse = await fetch(
                `https://api.coingecko.com/api/v3/coins/solana/contract/${tokenAddress}`
            );

            if (searchResponse.ok) {
                const data = await searchResponse.json();

                const result: Partial<EnhancedTokenMetadata> = {
                    name: data.name,
                    symbol: data.symbol,
                    description: data.description?.en,
                    logoURI: data.image?.large,
                    website: data.links?.homepage?.[0],
                    twitter: data.links?.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : undefined,
                    reddit: data.links?.subreddit_url,
                    github: data.links?.repos_url?.github?.[0],
                    marketCapRank: data.market_cap_rank,
                    ath: data.market_data?.ath?.usd,
                    athDate: data.market_data?.ath_date?.usd,
                    atl: data.market_data?.atl?.usd,
                    atlDate: data.market_data?.atl_date?.usd,
                    high24h: data.market_data?.high_24h?.usd,
                    low24h: data.market_data?.low_24h?.usd,
                    priceChange24h: data.market_data?.price_change_percentage_24h,
                    priceChange7d: data.market_data?.price_change_percentage_7d,
                    priceChange30d: data.market_data?.price_change_percentage_30d,
                    volume24h: data.market_data?.total_volume?.usd,
                    marketCap: data.market_data?.market_cap?.usd,
                    fullyDilutedValuation: data.market_data?.fully_diluted_valuation?.usd,
                    totalSupply: data.market_data?.total_supply,
                    circulatingSupply: data.market_data?.circulating_supply,
                    maxSupply: data.market_data?.max_supply,
                    dataSource: ["coingecko"]
                };

                this.setCachedData(cacheKey, result);
                return result;
            }
        } catch (error) {
            console.warn("[MarketDataCollector] CoinGecko API error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch data from Birdeye API
     */
    private async fetchBirdeyeData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `birdeye_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const headers = {
                "X-API-KEY": "YOUR_BIRDEYE_API_KEY" // Replace with actual API key
            };

            // Fetch token overview
            const overviewResponse = await fetch(
                `https://public-api.birdeye.so/defi/token_overview?address=${tokenAddress}`,
                { headers }
            );

            if (overviewResponse.ok) {
                const overviewData = await overviewResponse.json();

                // Fetch price data
                const priceResponse = await fetch(
                    `https://public-api.birdeye.so/defi/price?address=${tokenAddress}`,
                    { headers }
                );

                const priceData = priceResponse.ok ? await priceResponse.json() : null;

                const result: Partial<EnhancedTokenMetadata> = {
                    price: priceData?.data?.value,
                    marketCap: overviewData?.data?.mc,
                    volume24h: overviewData?.data?.v24hUSD,
                    liquidity: overviewData?.data?.liquidity,
                    holdersCount: overviewData?.data?.holder,
                    dataSource: ["birdeye"]
                };

                this.setCachedData(cacheKey, result);
                return result;
            }
        } catch (error) {
            console.warn("[MarketDataCollector] Birdeye API error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch on-chain data from Solana RPC
     */
    private async fetchOnChainData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `onchain_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Use Helius RPC for better reliability
            const rpcUrl = "https://rpc.helius.xyz/?api-key=e3b54e60-daee-442f-8b75-1893c5be291f";

            // Get token supply
            const supplyResponse = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getTokenSupply",
                    params: [tokenAddress]
                })
            });

            const supplyData = await supplyResponse.json();

            // Get account info
            const accountResponse = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 2,
                    method: "getAccountInfo",
                    params: [tokenAddress, { encoding: "base64" }]
                })
            });

            const accountData = await accountResponse.json();

            const result: Partial<EnhancedTokenMetadata> = {
                totalSupply: supplyData.result?.value?.amount ?
                    parseInt(supplyData.result.value.amount) / Math.pow(10, supplyData.result.value.decimals) : undefined,
                decimals: supplyData.result?.value?.decimals,
                dataSource: ["solana_rpc"]
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.warn("[MarketDataCollector] On-chain data error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch data from Solscan API
     */
    private async fetchSolscanData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        const cacheKey = `solscan_${tokenAddress}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.solscan.io/token/holders?token=${tokenAddress}&limit=1`);
            const data = await response.json();

            const result: Partial<EnhancedTokenMetadata> = {
                holdersCount: data.total,
                dataSource: ["solscan"]
            };

            this.setCachedData(cacheKey, result);
            return result;
        } catch (error) {
            console.warn("[MarketDataCollector] Solscan API error:", error);
        }

        return { dataSource: [] };
    }

    /**
     * Fetch social and metadata from various sources
     */
    private async fetchSocialData(tokenAddress: string): Promise<Partial<EnhancedTokenMetadata>> {
        // This would integrate with social media APIs to get additional data
        // For now, return empty data
        return { dataSource: [] };
    }

    /**
     * Merge data from different sources, prioritizing by source reliability
     */
    private mergeMarketData(target: EnhancedTokenMetadata, source: Partial<EnhancedTokenMetadata>): void {
        for (const [key, value] of Object.entries(source)) {
            if (value !== undefined && value !== null && key !== "dataSource") {
                // Only update if target doesn't have the value or source is higher priority
                if (target[key as keyof EnhancedTokenMetadata] === undefined) {
                    (target as any)[key] = value;
                }
            }
        }

        // Merge data sources
        if (source.dataSource) {
            target.dataSource = [...(target.dataSource || []), ...source.dataSource];
        }
    }

    /**
     * Calculate derived metrics from collected data
     */
    private calculateDerivedMetrics(data: EnhancedTokenMetadata): void {
        // Calculate volatility if we have price changes
        if (data.priceChange1h && data.priceChange24h) {
            const priceChanges = [data.priceChange1h, data.priceChange6h, data.priceChange24h].filter(Boolean);
            if (priceChanges.length > 1) {
                const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change!, 2), 0) / priceChanges.length;
                data.volatility = Math.sqrt(variance);
            }
        }

        // Calculate volume change percentage
        if (data.volume24h && data.volume1h) {
            const hourlyRate = data.volume1h * 24;
            data.volume24hChangePercent = ((hourlyRate - data.volume24h) / data.volume24h) * 100;
        }

        // Estimate market cap if missing but have price and supply
        if (!data.marketCap && data.price && data.circulatingSupply) {
            data.marketCap = data.price * data.circulatingSupply;
        }

        // Calculate FDV if missing but have price and total supply
        if (!data.fullyDilutedValuation && data.price && data.totalSupply) {
            data.fullyDilutedValuation = data.price * data.totalSupply;
        }
    }

    /**
     * Perform risk analysis on the token
     */
    private async performRiskAnalysis(data: EnhancedTokenMetadata): Promise<void> {
        // Liquidity risk assessment
        if (data.liquidity !== undefined) {
            if (data.liquidity < 10000) {
                data.liquidityRisk = "high";
            } else if (data.liquidity < 100000) {
                data.liquidityRisk = "medium";
            } else {
                data.liquidityRisk = "low";
            }
        }

        // Rug pull risk assessment (simplified)
        let rugRiskScore = 0;

        // Check if there's a website
        if (!data.website) rugRiskScore += 1;

        // Check social presence
        if (!data.twitter && !data.telegram) rugRiskScore += 1;

        // Check liquidity
        if (data.liquidity && data.liquidity < 50000) rugRiskScore += 1;

        // Check holder count
        if (data.holdersCount && data.holdersCount < 100) rugRiskScore += 1;

        if (rugRiskScore >= 3) {
            data.rugPullRisk = "high";
        } else if (rugRiskScore >= 2) {
            data.rugPullRisk = "medium";
        } else {
            data.rugPullRisk = "low";
        }

        // Concentration risk (would need holder distribution data)
        data.concentrationRisk = "medium"; // Default until we have more data
    }

    /**
     * Calculate confidence score based on data completeness and source diversity
     */
    private calculateConfidenceScore(data: EnhancedTokenMetadata): number {
        let score = 0;
        const maxScore = 10;

        // Source diversity (max 3 points)
        const sourceCount = data.dataSource?.length || 0;
        score += Math.min(sourceCount * 0.5, 3);

        // Data completeness (max 7 points)
        const importantFields = [
            "price", "volume24h", "marketCap", "liquidity", "name", "symbol", "holdersCount"
        ];

        const completedFields = importantFields.filter(field =>
            data[field as keyof EnhancedTokenMetadata] !== undefined
        ).length;

        score += (completedFields / importantFields.length) * 7;

        return Math.min(score / maxScore, 1);
    }

    /**
     * Cache management
     */
    private getCachedData(key: string): any {
        const cached = this.requestCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.requestCache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Clean up old cache entries
        if (this.requestCache.size > 200) {
            this.cleanupCache();
        }
    }

    private cleanupCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.requestCache.entries()) {
            if (now - entry.timestamp > this.cacheTimeout) {
                this.requestCache.delete(key);
            }
        }
    }

    /**
     * Get market data with historical context
     */
    async getHistoricalData(
        tokenAddress: string,
        timeframe: "1h" | "24h" | "7d" | "30d" = "24h"
    ): Promise<{ timestamp: number; price: number; volume: number }[]> {
        // This would implement historical data fetching
        // For now, return empty array
        return [];
    }

    /**
     * Get real-time price updates via WebSocket
     */
    subscribeToRealTimeUpdates(
        tokenAddress: string,
        callback: (data: Partial<EnhancedTokenMetadata>) => void
    ): () => void {
        // This would implement WebSocket connection for real-time updates
        // For now, return a no-op unsubscribe function
        return () => {};
    }

    /**
     * Export collected data for analysis
     */
    exportMarketData(data: EnhancedTokenMetadata, format: "json" | "csv" = "json"): string {
        if (format === "json") {
            return JSON.stringify(data, null, 2);
        } else {
            // Convert to CSV format
            const headers = Object.keys(data).join(",");
            const values = Object.values(data).map(v =>
                typeof v === "object" ? JSON.stringify(v) : v
            ).join(",");
            return `${headers}\n${values}`;
        }
    }
}

// Export singleton instance
export const marketDataCollector = new EnhancedMarketDataCollector();
