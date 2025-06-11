import { React } from "@webpack/common";
import { marketDataCollector } from "./marketDataUtils";
import { getStoredWallets, getStoredTokenBalances, getCreatedCoins } from "./storageHelper";
import { showToast } from "./ToastManager";

// Brand colors for consistency
const BRAND_COLORS = {
    primary: "#F2F0E8",
    primaryDark: "#E8E5DD",
    success: "#38B2AC",
    warning: "#FBB040",
    danger: "#E53E3E",
    text: "#2D3748",
    textMuted: "#718096",
    charcoal: "#4A5568"
};

interface TrackedToken {
    address: string;
    symbol: string;
    name: string;
    price?: number;
    priceChange24h?: number;
    balance?: number;
    value?: number;
    lastUpdated: number;
    isCreated?: boolean;
}

interface RecentTrade {
    action: "buy" | "sell";
    symbol: string;
    amount: string;
    timestamp: number;
    success: boolean;
}

interface LivePriceSidebarProps {
    isVisible: boolean;
    onToggle: () => void;
}

export function LivePriceSidebar({ isVisible, onToggle }: LivePriceSidebarProps) {
    const [trackedTokens, setTrackedTokens] = React.useState<TrackedToken[]>([]);
    const [recentTrades, setRecentTrades] = React.useState<RecentTrade[]>([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(true);
    const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());

    // Load initial data
    React.useEffect(() => {
        if (isVisible) {
            loadTrackedTokens();
            loadRecentTrades();
        }
    }, [isVisible]);

    // Auto-refresh prices every 30 seconds when visible
    React.useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            refreshPrices();
        }, 30000);

        return () => clearInterval(interval);
    }, [isVisible, trackedTokens]);

    const loadTrackedTokens = async () => {
        setLoading(true);
        try {
            const wallets = await getStoredWallets();
            const createdCoins = await getCreatedCoins();
            const allTokens = new Map<string, TrackedToken>();

            // Add created coins
            for (const coin of createdCoins) {
                if (coin.status === 'confirmed') {
                    allTokens.set(coin.contractAddress, {
                        address: coin.contractAddress,
                        symbol: coin.symbol,
                        name: coin.name,
                        lastUpdated: Date.now(),
                        isCreated: true
                    });
                }
            }

            // Add tokens from wallet balances
            for (const wallet of wallets) {
                if (wallet.publicKey) {
                    try {
                        const balances = await getStoredTokenBalances(wallet.publicKey);
                        for (const balance of balances) {
                            if (balance.uiAmount > 0) {
                                allTokens.set(balance.mint, {
                                    address: balance.mint,
                                    symbol: balance.tokenInfo?.symbol || "UNK",
                                    name: balance.tokenInfo?.name || "Unknown",
                                    balance: balance.uiAmount,
                                    lastUpdated: Date.now(),
                                    isCreated: false
                                });
                            }
                        }
                    } catch (error) {
                        console.warn("[LivePriceSidebar] Failed to load balances for wallet:", wallet.name);
                    }
                }
            }

            const tokens = Array.from(allTokens.values());
            setTrackedTokens(tokens);

            // Load prices for tokens
            await loadPricesForTokens(tokens);

        } catch (error) {
            console.error("[LivePriceSidebar] Failed to load tracked tokens:", error);
            showToast.error("Failed to load tracked tokens");
        } finally {
            setLoading(false);
        }
    };

    const loadPricesForTokens = async (tokens: TrackedToken[]) => {
        const updatedTokens = await Promise.all(
            tokens.map(async (token) => {
                try {
                    const data = await marketDataCollector.collectComprehensiveMarketData(token.address, {
                        includeOnChain: false,
                        maxSources: 2
                    });

                    const updatedToken = {
                        ...token,
                        price: data.price,
                        priceChange24h: data.priceChange24h,
                        value: token.balance && data.price ? token.balance * data.price : undefined,
                        lastUpdated: Date.now()
                    };

                    return updatedToken;
                } catch (error) {
                    console.warn(`[LivePriceSidebar] Failed to load price for ${token.symbol}`);
                    return token;
                }
            })
        );

        setTrackedTokens(updatedTokens);
        
        // Calculate total portfolio value
        const totalValue = updatedTokens.reduce((sum, token) => {
            return sum + (token.value || 0);
        }, 0);
        setTotalPortfolioValue(totalValue);
        setLastUpdate(new Date());
    };

    const refreshPrices = async () => {
        if (trackedTokens.length > 0) {
            await loadPricesForTokens(trackedTokens);
        }
    };

    const loadRecentTrades = () => {
        // Load from localStorage or other storage
        const stored = localStorage.getItem("pumpportal-recent-trades");
        if (stored) {
            try {
                const trades = JSON.parse(stored);
                setRecentTrades(trades.slice(0, 10)); // Keep last 10 trades
            } catch (error) {
                console.warn("[LivePriceSidebar] Failed to parse recent trades");
            }
        }
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return "N/A";
        if (price < 0.001) return `$${price.toFixed(8)}`;
        if (price < 1) return `$${price.toFixed(6)}`;
        return `$${price.toFixed(4)}`;
    };

    const formatPercentage = (percent: number | undefined) => {
        if (percent === undefined || percent === null || isNaN(percent)) {
            return { text: "N/A", color: BRAND_COLORS.textMuted };
        }
        
        const isPositive = percent >= 0;
        return {
            text: `${isPositive ? '+' : ''}${percent.toFixed(2)}%`,
            color: isPositive ? BRAND_COLORS.success : BRAND_COLORS.danger
        };
    };

    const formatAddress = (address: string) => {
        if (!address || address.length <= 12) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    if (!isVisible) {
        // Collapsed state - just a toggle button
        return (
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    right: "0",
                    transform: "translateY(-50%)",
                    zIndex: 1000,
                    backgroundColor: BRAND_COLORS.charcoal,
                    color: "white",
                    padding: "12px 8px",
                    borderRadius: "8px 0 0 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease"
                }}
                onClick={onToggle}
                title="Open price tracker"
            >
                📈
            </div>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                width: "350px",
                maxHeight: "80vh",
                backgroundColor: BRAND_COLORS.primaryDark,
                border: `1px solid ${BRAND_COLORS.primary}`,
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                zIndex: 1000,
                overflow: "hidden",
                fontSize: "13px"
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "16px",
                    backgroundColor: BRAND_COLORS.charcoal,
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>📈 Live Tracker</div>
                    <div style={{ fontSize: "11px", opacity: 0.8 }}>
                        Updated: {lastUpdate.toLocaleTimeString()}
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        fontSize: "16px"
                    }}
                    title="Close tracker"
                >
                    ✕
                </button>
            </div>

            {/* Portfolio Summary */}
            <div
                style={{
                    padding: "12px 16px",
                    backgroundColor: BRAND_COLORS.success + "20",
                    borderBottom: `1px solid ${BRAND_COLORS.primary}`
                }}
            >
                <div style={{ fontWeight: "600", color: BRAND_COLORS.text }}>
                    Portfolio Value: ${totalPortfolioValue.toFixed(2)}
                </div>
                <div style={{ fontSize: "11px", color: BRAND_COLORS.textMuted }}>
                    {trackedTokens.length} tokens tracked
                </div>
            </div>

            {/* Content */}
            <div style={{ maxHeight: "50vh", overflowY: "auto", padding: "12px" }}>
                {loading ? (
                    <div style={{
                        textAlign: "center",
                        padding: "20px",
                        color: BRAND_COLORS.textMuted
                    }}>
                        🔄 Loading tokens...
                    </div>
                ) : trackedTokens.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "20px",
                        color: BRAND_COLORS.textMuted
                    }}>
                        No tokens to track.
                        <br />Trade some tokens to see them here!
                    </div>
                ) : (
                    <div>
                        {/* Tracked Tokens */}
                        <div style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: BRAND_COLORS.text,
                            marginBottom: "8px"
                        }}>
                            💰 Holdings
                        </div>
                        
                        {trackedTokens.map(token => (
                            <div
                                key={token.address}
                                style={{
                                    padding: "8px",
                                    backgroundColor: BRAND_COLORS.primary + "40",
                                    borderRadius: "6px",
                                    marginBottom: "6px",
                                    border: `1px solid ${BRAND_COLORS.primary}`
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px"
                                }}>
                                    <div style={{
                                        fontWeight: "600",
                                        color: BRAND_COLORS.text,
                                        fontSize: "12px"
                                    }}>
                                        {token.symbol}
                                        {token.isCreated && (
                                            <span style={{
                                                marginLeft: "4px",
                                                fontSize: "10px"
                                            }}>🎯</span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: BRAND_COLORS.text
                                    }}>
                                        {formatPrice(token.price)}
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "10px"
                                }}>
                                    <span style={{ color: BRAND_COLORS.textMuted }}>
                                        {token.balance ? `${token.balance.toLocaleString()} tokens` : formatAddress(token.address)}
                                    </span>
                                    <span style={{ 
                                        color: formatPercentage(token.priceChange24h).color,
                                        fontWeight: "600"
                                    }}>
                                        {formatPercentage(token.priceChange24h).text}
                                    </span>
                                </div>
                                
                                {token.value && (
                                    <div style={{
                                        fontSize: "11px",
                                        color: BRAND_COLORS.success,
                                        fontWeight: "600",
                                        textAlign: "right",
                                        marginTop: "2px"
                                    }}>
                                        ${token.value.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: "12px 16px",
                    backgroundColor: BRAND_COLORS.primary + "20",
                    borderTop: `1px solid ${BRAND_COLORS.primary}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <button
                    onClick={refreshPrices}
                    disabled={loading}
                    style={{
                        backgroundColor: BRAND_COLORS.success,
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        fontSize: "11px",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        fontWeight: "600"
                    }}
                >
                    {loading ? "🔄" : "🔄 Refresh"}
                </button>
                
                <div style={{
                    fontSize: "10px",
                    color: BRAND_COLORS.textMuted
                }}>
                    Auto-refresh: 30s
                </div>
            </div>
        </div>
    );
}