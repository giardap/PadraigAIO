import { React } from "@webpack/common";
import { showToast } from "./ToastManager";

// ========================================================================================
// TYPES AND INTERFACES
// ========================================================================================

export interface SniperCriteria {
    tokenName?: string;           // Exact or partial match
    symbol?: string;              // Symbol criteria  
    minLiquidity?: number;        // Minimum SOL in pool
    maxSupply?: number;           // Maximum token supply
    keywords?: string[];          // Must contain keywords
    blacklist?: string[];         // Avoid these keywords
    creatorAddress?: string;      // Specific creator to snipe
}

export interface SniperTradingConfig {
    buyAmount: number;            // SOL per wallet
    slippage: number;             // Max slippage %
    maxGas: number;               // Gas limit
    wallets: string[];            // Array of wallet IDs to use
    staggerDelay?: number;        // Delay between wallet buys (ms)
    pool: "pump" | "bonk";        // Which pool to use
}

export interface SniperSafetyConfig {
    maxDailySpend: number;        // Daily spending limit
    cooldownPeriod: number;       // Time between snipes (seconds)
    requireConfirmation: boolean; // Manual approval for buys
    enabled: boolean;             // Master enable/disable
}

export interface SniperConfig {
    criteria: SniperCriteria;
    trading: SniperTradingConfig;
    safety: SniperSafetyConfig;
}

export interface TokenCreationData {
    mint: string;
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    showName?: boolean;
    createdTimestamp: number;
    raydiumPool?: string;
    complete?: boolean;
    creator?: string;
    totalSupply?: number;
    initialLiquidity?: number;
}

export interface SniperStats {
    totalAttempts: number;
    successfulSnipes: number;
    failedSnipes: number;
    totalSpent: number;
    averageSpeed: number;         // ms from detection to purchase
    lastSnipeTime: number;
    dailySpent: number;
}

// ========================================================================================
// WEBSOCKET MANAGER
// ========================================================================================

class SniperWebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;
    private subscribers: Set<(data: TokenCreationData) => void> = new Set();
    
    constructor() {
        this.connect();
    }

    connect(): void {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.isConnecting = true;
        console.log("[TokenSniper] Connecting to PumpPortal WebSocket...");

        try {
            this.ws = new WebSocket('wss://pumpportal.fun/api/data');
            
            this.ws.onopen = () => {
                console.log("[TokenSniper] WebSocket connected successfully");
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                
                // Subscribe to new token events
                this.subscribe();
                
                showToast.success("Sniper WebSocket Connected");
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error("[TokenSniper] Error parsing WebSocket message:", error);
                }
            };

            this.ws.onclose = (event) => {
                console.log("[TokenSniper] WebSocket closed:", event.code, event.reason);
                this.isConnecting = false;
                this.ws = null;
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else {
                    showToast.error("Sniper WebSocket failed to connect after multiple attempts");
                }
            };

            this.ws.onerror = (error) => {
                console.error("[TokenSniper] WebSocket error:", error);
                this.isConnecting = false;
                showToast.error("Sniper WebSocket connection error");
            };

        } catch (error) {
            console.error("[TokenSniper] Failed to create WebSocket:", error);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }

    private subscribe(): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Subscribe to new token creation events
        const payload = {
            method: "subscribeNewToken"
        };
        
        this.ws.send(JSON.stringify(payload));
        console.log("[TokenSniper] Subscribed to new token events");
    }

    private handleMessage(data: any): void {
        // Handle new token creation events
        if (data.mint && data.name) {
            const tokenData: TokenCreationData = {
                mint: data.mint,
                name: data.name,
                symbol: data.symbol || "",
                description: data.description,
                image: data.image,
                createdTimestamp: Date.now(),
                creator: data.creator,
                totalSupply: data.totalSupply,
                initialLiquidity: data.initialLiquidity,
                complete: data.complete
            };

            // Notify all subscribers
            this.subscribers.forEach(callback => {
                try {
                    callback(tokenData);
                } catch (error) {
                    console.error("[TokenSniper] Error in subscriber callback:", error);
                }
            });
        }
    }

    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        
        console.log(`[TokenSniper] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    subscribeToTokens(callback: (data: TokenCreationData) => void): () => void {
        this.subscribers.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscribers.clear();
        console.log("[TokenSniper] WebSocket disconnected");
    }

    getConnectionStatus(): string {
        if (!this.ws) return "Disconnected";
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return "Connecting";
            case WebSocket.OPEN: return "Connected";
            case WebSocket.CLOSING: return "Closing";
            case WebSocket.CLOSED: return "Closed";
            default: return "Unknown";
        }
    }
}

// ========================================================================================
// SNIPER ENGINE
// ========================================================================================

class TokenSniperEngine {
    private config: SniperConfig;
    private stats: SniperStats;
    private wsManager: SniperWebSocketManager;
    private lastSnipeTime = 0;

    constructor() {
        this.config = this.getDefaultConfig();
        this.stats = this.getDefaultStats();
        this.wsManager = new SniperWebSocketManager();
        
        // Subscribe to token creation events
        this.wsManager.subscribeToTokens(this.handleNewToken.bind(this));
        
        // Reset daily spent counter at midnight
        this.scheduleDailyReset();
    }

    private getDefaultConfig(): SniperConfig {
        return {
            criteria: {
                tokenName: "",
                symbol: "",
                keywords: [],
                blacklist: ["scam", "rug", "fake"],
                minLiquidity: 0.1,
                maxSupply: 1000000000
            },
            trading: {
                buyAmount: 0.1,
                slippage: 10,
                maxGas: 0.005,
                wallets: [],
                staggerDelay: 100,
                pool: "pump"
            },
            safety: {
                maxDailySpend: 5.0,
                cooldownPeriod: 5,
                requireConfirmation: true,
                enabled: false
            }
        };
    }

    private getDefaultStats(): SniperStats {
        return {
            totalAttempts: 0,
            successfulSnipes: 0,
            failedSnipes: 0,
            totalSpent: 0,
            averageSpeed: 0,
            lastSnipeTime: 0,
            dailySpent: 0
        };
    }

    private handleNewToken(tokenData: TokenCreationData): void {
        if (!this.config.safety.enabled) return;

        console.log("[TokenSniper] New token detected:", tokenData.name, tokenData.symbol);

        // Check if token matches criteria
        if (this.matchesCriteria(tokenData)) {
            console.log("[TokenSniper] Token matches snipe criteria!");
            this.executeSnipe(tokenData);
        }
    }

    private matchesCriteria(token: TokenCreationData): boolean {
        const { criteria } = this.config;

        // Check token name
        if (criteria.tokenName && criteria.tokenName.trim()) {
            const nameMatch = token.name.toLowerCase().includes(criteria.tokenName.toLowerCase());
            if (!nameMatch) return false;
        }

        // Check symbol
        if (criteria.symbol && criteria.symbol.trim()) {
            const symbolMatch = token.symbol.toLowerCase().includes(criteria.symbol.toLowerCase());
            if (!symbolMatch) return false;
        }

        // Check keywords (must contain at least one)
        if (criteria.keywords && criteria.keywords.length > 0) {
            const hasKeyword = criteria.keywords.some(keyword => 
                token.name.toLowerCase().includes(keyword.toLowerCase()) ||
                (token.description && token.description.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (!hasKeyword) return false;
        }

        // Check blacklist (must not contain any)
        if (criteria.blacklist && criteria.blacklist.length > 0) {
            const hasBlacklisted = criteria.blacklist.some(word => 
                token.name.toLowerCase().includes(word.toLowerCase()) ||
                (token.description && token.description.toLowerCase().includes(word.toLowerCase()))
            );
            if (hasBlacklisted) return false;
        }

        // Check minimum liquidity
        if (criteria.minLiquidity && token.initialLiquidity && token.initialLiquidity < criteria.minLiquidity) {
            return false;
        }

        // Check maximum supply
        if (criteria.maxSupply && token.totalSupply && token.totalSupply > criteria.maxSupply) {
            return false;
        }

        // Check creator address
        if (criteria.creatorAddress && criteria.creatorAddress.trim()) {
            if (token.creator !== criteria.creatorAddress) return false;
        }

        return true;
    }

    private async executeSnipe(token: TokenCreationData): Promise<void> {
        const startTime = Date.now();
        this.stats.totalAttempts++;

        try {
            // Safety checks
            if (!this.canExecuteSnipe()) {
                console.log("[TokenSniper] Snipe blocked by safety checks");
                return;
            }

            // Show confirmation if required
            if (this.config.safety.requireConfirmation) {
                const confirmed = await this.showConfirmationDialog(token);
                if (!confirmed) {
                    console.log("[TokenSniper] Snipe cancelled by user");
                    return;
                }
            }

            showToast.info(`🎯 Sniping ${token.name} (${token.symbol})`);

            // Execute buy with selected wallets
            const results = await this.executeBuyOrders(token);
            
            // Update stats
            const executionTime = Date.now() - startTime;
            this.updateStats(results, executionTime);

            // Update last snipe time
            this.lastSnipeTime = Date.now();

            showToast.success(`✅ Snipe completed for ${token.name}`);

        } catch (error: any) {
            console.error("[TokenSniper] Snipe execution failed:", error);
            this.stats.failedSnipes++;
            showToast.error(`❌ Snipe failed for ${token.name}: ${error.message}`);
        }
    }

    private canExecuteSnipe(): boolean {
        const now = Date.now();

        // Check cooldown period
        if (this.lastSnipeTime > 0) {
            const timeSinceLastSnipe = (now - this.lastSnipeTime) / 1000;
            if (timeSinceLastSnipe < this.config.safety.cooldownPeriod) {
                console.log("[TokenSniper] Cooldown period active");
                return false;
            }
        }

        // Check daily spending limit
        const totalCost = this.config.trading.buyAmount * this.config.trading.wallets.length;
        if (this.stats.dailySpent + totalCost > this.config.safety.maxDailySpend) {
            console.log("[TokenSniper] Daily spending limit would be exceeded");
            showToast.error("Daily spending limit would be exceeded");
            return false;
        }

        // Check if wallets are configured
        if (this.config.trading.wallets.length === 0) {
            console.log("[TokenSniper] No wallets configured");
            showToast.error("No wallets configured for sniping");
            return false;
        }

        return true;
    }

    private async showConfirmationDialog(token: TokenCreationData): Promise<boolean> {
        return new Promise((resolve) => {
            const message = `Snipe ${token.name} (${token.symbol}) for ${this.config.trading.buyAmount} SOL per wallet?`;
            const confirmed = confirm(message);
            resolve(confirmed);
        });
    }

    private async executeBuyOrders(token: TokenCreationData): Promise<any[]> {
        const { trading } = this.config;
        const promises = trading.wallets.map(async (walletId, index) => {
            
            // Stagger purchases to avoid MEV
            if (trading.staggerDelay && trading.staggerDelay > 0 && index > 0) {
                await new Promise(resolve => 
                    setTimeout(resolve, index * trading.staggerDelay!)
                );
            }

            return this.executeBuyForWallet(walletId, token, trading);
        });

        return Promise.allSettled(promises);
    }

    private async executeBuyForWallet(walletId: string, token: TokenCreationData, config: SniperTradingConfig): Promise<any> {
        // This would integrate with the existing trading system
        // For now, we'll simulate the API call
        console.log(`[TokenSniper] Executing buy for wallet ${walletId}: ${token.mint}`);
        
        // TODO: Integrate with actual PumpPortal API
        const response = await fetch(`https://pumpportal.fun/api/trade?api-key=WALLET_API_KEY`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "buy",
                mint: token.mint,
                denominatedInSol: "true",
                amount: config.buyAmount,
                slippage: config.slippage,
                priorityFee: config.maxGas,
                pool: config.pool
            })
        });

        if (!response.ok) {
            throw new Error(`Buy failed: ${response.statusText}`);
        }

        return response.json();
    }

    private updateStats(results: any[], executionTime: number): void {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        this.stats.successfulSnipes += successful;
        this.stats.failedSnipes += failed;
        this.stats.averageSpeed = (this.stats.averageSpeed + executionTime) / 2;
        
        const spent = successful * this.config.trading.buyAmount;
        this.stats.totalSpent += spent;
        this.stats.dailySpent += spent;
    }

    private scheduleDailyReset(): void {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.stats.dailySpent = 0;
            console.log("[TokenSniper] Daily spending limit reset");
            
            // Schedule next reset
            this.scheduleDailyReset();
        }, msUntilMidnight);
    }

    // Public methods for UI interaction
    updateConfig(newConfig: Partial<SniperConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log("[TokenSniper] Configuration updated");
    }

    getConfig(): SniperConfig {
        return { ...this.config };
    }

    getStats(): SniperStats {
        return { ...this.stats };
    }

    enable(): void {
        this.config.safety.enabled = true;
        showToast.success("Token Sniper enabled");
    }

    disable(): void {
        this.config.safety.enabled = false;
        showToast.info("Token Sniper disabled");
    }

    isEnabled(): boolean {
        return this.config.safety.enabled;
    }

    getConnectionStatus(): string {
        return this.wsManager.getConnectionStatus();
    }

    isConnected(): boolean {
        return this.wsManager.isConnected();
    }

    disconnect(): void {
        this.wsManager.disconnect();
    }
}

// ========================================================================================
// SINGLETON INSTANCE
// ========================================================================================

export const tokenSniper = new TokenSniperEngine();

// ========================================================================================
// REACT COMPONENT (Basic UI - we'll expand this)
// ========================================================================================

export const SniperStatusIndicator: React.FC = () => {
    const [status, setStatus] = React.useState(tokenSniper.getConnectionStatus());
    const [enabled, setEnabled] = React.useState(tokenSniper.isEnabled());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setStatus(tokenSniper.getConnectionStatus());
            setEnabled(tokenSniper.isEnabled());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const statusColor = status === "Connected" ? "#22c55e" : 
                       status === "Connecting" ? "#f59e0b" : "#ef4444";

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            padding: "4px 8px",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "4px",
            border: `1px solid ${statusColor}20`
        }}>
            <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: statusColor
            }} />
            <span style={{ color: statusColor }}>
                🎯 {enabled ? "SNIPER" : "OFF"} ({status})
            </span>
        </div>
    );
};