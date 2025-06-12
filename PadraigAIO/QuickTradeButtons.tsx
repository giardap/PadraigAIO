/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { React } from "@webpack/common";

import { marketDataCollector } from "./marketDataUtils";
import { getGlobalTradingSettings } from "./StandaloneTradingSettingsModal";
import { getDefaultWallet, getStoredWallets } from "./storageHelper";
import { showToast } from "./ToastManager";

// Brand colors for consistency
const BRAND_COLORS = {
    primary: "#F2F0E8",
    success: "#38B2AC",
    warning: "#FBB040",
    danger: "#E53E3E",
    text: "#2D3748",
    textMuted: "#718096",
    charcoal: "#4A5568"
};

interface QuickTradeButtonsProps {
    contractAddress: string;
    onViewDetails: () => void;
}

export function QuickTradeButtons({ contractAddress, onViewDetails }: QuickTradeButtonsProps) {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [tokenData, setTokenData] = React.useState<any>(null);

    // Load token data on mount
    React.useEffect(() => {
        const loadTokenData = async () => {
            try {
                const data = await marketDataCollector.collectComprehensiveMarketData(contractAddress, {
                    includeOnChain: false,
                    maxSources: 2 // Limit for quick loading
                });
                setTokenData(data);
            } catch (error) {
                console.warn("[QuickTradeButtons] Failed to load token data:", error);
            }
        };

        loadTokenData();
    }, [contractAddress]);

    const executeQuickTrade = async (action: "buy" | "sell", amount: string) => {
        const loadingKey = `${action}-${amount}`;
        setLoading(loadingKey);

        try {
            // Get default wallet
            const defaultWalletId = await getDefaultWallet();
            if (!defaultWalletId) {
                showToast.error("No default wallet set. Please configure a wallet first.");
                return;
            }

            const wallets = await getStoredWallets();
            const wallet = wallets.find(w => w.id === defaultWalletId);

            if (!wallet || !wallet.apiKey) {
                showToast.error("Default wallet missing API key. Please check wallet configuration.");
                return;
            }

            // Get global trading settings
            const settings = getGlobalTradingSettings();

            // Prepare trade request
            const requestBody = {
                action: action,
                mint: contractAddress,
                amount: parseFloat(amount),
                denominatedInSol: action === "buy",
                slippage: parseInt(settings.slippage),
                priorityFee: parseFloat(settings.priorityFee),
                pool: settings.pool,
                skipPreflight: settings.skipPreflight.toString(),
                jitoOnly: settings.jitoOnly.toString()
            };

            showToast.info(`🚀 Processing ${action} of ${amount} ${action === "buy" ? "SOL" : "tokens"}...`, 2000);

            const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${wallet.apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(`Trade failed: ${response.status} - ${responseText}`);
            }

            let tradeData;
            try {
                tradeData = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`Failed to parse response: ${responseText}`);
            }

            if (tradeData.signature) {
                const tokenSymbol = tokenData?.symbol || "TOKEN";
                const message = `${action === "buy" ? "📈 Bought" : "📉 Sold"} ${tokenSymbol} for ${amount} ${action === "buy" ? "SOL" : "tokens"}`;
                showToast.success(message, 8000);

                console.log("[QuickTrade] Success:", {
                    action,
                    amount,
                    token: tokenSymbol,
                    signature: tradeData.signature,
                    txUrl: `https://solscan.io/tx/${tradeData.signature}`
                });
            } else if (tradeData.error) {
                showToast.error(`❌ Trade failed: ${tradeData.error}`);
            } else {
                showToast.success(`✅ ${action} completed successfully!`);
            }

        } catch (error: any) {
            console.error("[QuickTrade] Error:", error);

            if (error.message && error.message.includes("CORS")) {
                showToast.error("❌ Trade blocked by browser security. Try using the full trade modal.");
            } else {
                showToast.error(`❌ ${action} failed: ${error.message || "Unknown error"}`);
            }
        } finally {
            setLoading(null);
        }
    };

    const formatAddress = (address: string) => {
        if (!address || address.length <= 12) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const buttonBaseStyle = {
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginRight: "6px",
        marginBottom: "4px",
        minWidth: "60px",
        textAlign: "center" as const,
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? "none" as const : "auto" as const
    };

    const quickBuyAmounts = ["0.1", "0.5", "1.0"];

    return (
        <div style={{
            display: "inline-block",
            marginLeft: "8px",
            padding: "6px 8px",
            backgroundColor: BRAND_COLORS.primary + "20",
            borderRadius: "8px",
            border: `1px solid ${BRAND_COLORS.primary}`,
            fontSize: "12px"
        }}>
            {/* Token info */}
            {tokenData && (
                <div style={{
                    fontSize: "10px",
                    color: BRAND_COLORS.textMuted,
                    marginBottom: "4px",
                    textAlign: "center"
                }}>
                    {tokenData.symbol} {tokenData.price ? `($${tokenData.price.toFixed(6)})` : ""}
                </div>
            )}

            {/* Quick buy buttons */}
            <div style={{ marginBottom: "4px" }}>
                {quickBuyAmounts.map(amount => (
                    <button
                        key={`buy-${amount}`}
                        onClick={() => executeQuickTrade("buy", amount)}
                        disabled={loading === `buy-${amount}`}
                        style={{
                            ...buttonBaseStyle,
                            backgroundColor: BRAND_COLORS.success,
                            color: "white"
                        }}
                        onMouseEnter={e => {
                            if (!loading) (e.target as HTMLElement).style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={e => {
                            if (!loading) (e.target as HTMLElement).style.transform = "scale(1)";
                        }}
                        title={`Buy ${amount} SOL worth of tokens`}
                    >
                        {loading === `buy-${amount}` ? "..." : `Buy ${amount}`}
                    </button>
                ))}
            </div>

            {/* Action buttons */}
            <div>
                <button
                    onClick={onViewDetails}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: BRAND_COLORS.charcoal,
                        color: "white",
                        minWidth: "80px"
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLElement).style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLElement).style.transform = "scale(1)";
                    }}
                    title="Open full trading modal"
                >
                    📊 Details
                </button>

                <button
                    onClick={() => {
                        navigator.clipboard.writeText(contractAddress);
                        showToast.info("📋 Contract address copied!", 2000);
                    }}
                    style={{
                        ...buttonBaseStyle,
                        backgroundColor: BRAND_COLORS.textMuted,
                        color: "white",
                        minWidth: "50px"
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLElement).style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLElement).style.transform = "scale(1)";
                    }}
                    title={`Copy address: ${formatAddress(contractAddress)}`}
                >
                    📋
                </button>
            </div>

            {loading && (
                <div style={{
                    fontSize: "9px",
                    color: BRAND_COLORS.textMuted,
                    textAlign: "center",
                    marginTop: "2px"
                }}>
                    Processing...
                </div>
            )}
        </div>
    );
}
