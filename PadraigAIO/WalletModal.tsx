import { ModalRoot, ModalHeader, ModalContent, ModalFooter } from "@utils/modal";
import { Button, Forms, React } from "@webpack/common";
import { 
    getStoredWallets, 
    storeWallet, 
    deleteStoredWallet,
    Wallet,
    storageManager,
    getDefaultWallet,
    setDefaultWallet,
    renameWallet,
    TokenBalance,
    fetchTokenBalances,
    getStoredTokenBalances
} from "./storageHelper";

// Padraig Branding Variables
const PADRAIG_LOGO_BASE64 = "data:image/png;base64,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"
const BRAND_COLORS = {
    primary: "#F2F0E8",       // Beige/Champagne base
    primaryDark: "#E8E5DD",   // Darker beige
    accent1: "#E53E3E",       // Red accent
    accent2: "#FBB040",       // Yellow/Orange accent  
    accent3: "#38B2AC",       // Teal accent
    charcoal: "#4A5568",      // Charcoal grey
    success: "#38B2AC",       // Teal for success states
    warning: "#FBB040",       // Orange for warning states
    danger: "#E53E3E",        // Red for danger states
    text: "#FFFFFF",          // WHITE TEXT for readability
    textMuted: "#E2E8F0"      // Light grey for muted text
};

export function WalletModal(props: any) {
    const [wallets, setWallets] = React.useState<Wallet[]>([]);
    const [walletData, setWalletData] = React.useState<Wallet | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedWallet, setExpandedWallet] = React.useState<string | null>(null);
    const [storageInfo, setStorageInfo] = React.useState<any>(null);
    
    // Default wallet and renaming state
    const [defaultWalletId, setDefaultWalletId] = React.useState<string | null>(null);
    const [renamingWallet, setRenamingWallet] = React.useState<string | null>(null);
    const [newWalletName, setNewWalletName] = React.useState("");

    // NEW: Balance tracking state
    const [solBalances, setSolBalances] = React.useState<Record<string, number>>({});
    const [tokenBalances, setTokenBalances] = React.useState<Record<string, TokenBalance[]>>({});
    const [loadingBalances, setLoadingBalances] = React.useState<Record<string, boolean>>({});
    const [loadingTokens, setLoadingTokens] = React.useState<Record<string, boolean>>({});
    const [lastBalanceUpdate, setLastBalanceUpdate] = React.useState<Record<string, Date>>({});
    const [expandedTokens, setExpandedTokens] = React.useState<Record<string, boolean>>({});
    
    // Auto-refresh settings
    const [autoRefreshBalances, setAutoRefreshBalances] = React.useState(true);
    const [refreshInterval, setRefreshInterval] = React.useState(10000); // 10 seconds default
    const [balanceRefreshEnabled, setBalanceRefreshEnabled] = React.useState(true);

    React.useEffect(() => {
        loadWallets();
        loadStorageInfo();
        loadDefaultWallet();
    }, []);

    // NEW: Auto-refresh effect for all wallet balances
    React.useEffect(() => {
        if (!autoRefreshBalances || !balanceRefreshEnabled || wallets.length === 0) {
            return;
        }

        console.log(`[WalletModal] Starting auto-refresh for ${wallets.length} wallets (${refreshInterval}ms interval)`);

        const refreshIntervalId = setInterval(async () => {
            // Refresh balances for all wallets that have public keys
            const walletsWithKeys = wallets.filter(w => w.publicKey);
            
            for (const wallet of walletsWithKeys) {
                // Only refresh if not currently loading for this wallet
                if (!loadingBalances[wallet.id] && !loadingTokens[wallet.id]) {
                    await refreshWalletBalances(wallet, true); // true = silent refresh
                }
            }
        }, refreshInterval);

        return () => {
            console.log("[WalletModal] Stopping balance auto-refresh");
            clearInterval(refreshIntervalId);
        };
    }, [autoRefreshBalances, balanceRefreshEnabled, refreshInterval, wallets, loadingBalances, loadingTokens]);

    // NEW: Load balances when wallets change
    React.useEffect(() => {
        const loadAllBalances = async () => {
            const walletsWithKeys = wallets.filter(w => w.publicKey);
            
            for (const wallet of walletsWithKeys) {
                // Load SOL balance if we don't have it
                if (!(wallet.id in solBalances)) {
                    await loadSolBalance(wallet);
                }
                
                // Load token balances if we don't have them
                if (!(wallet.id in tokenBalances)) {
                    await loadTokenBalances(wallet);
                }
            }
        };

        if (wallets.length > 0) {
            loadAllBalances();
        }
    }, [wallets]);

    const loadWallets = async () => {
        try {
            console.log("[WalletModal] Loading wallets from enhanced storage...");
            const storedWallets = await getStoredWallets();
            setWallets(storedWallets);
            console.log("[WalletModal] Loaded wallets:", storedWallets.length);
        } catch (error) {
            console.error("[WalletModal] Failed to load wallets:", error);
            setError("Failed to load wallets from storage");
        }
    };

    const loadStorageInfo = async () => {
        try {
            const info = await storageManager.getStorageInfo();
            setStorageInfo(info);
        } catch (error) {
            console.error("[WalletModal] Failed to load storage info:", error);
        }
    };

    // Load default wallet setting
    const loadDefaultWallet = async () => {
        try {
            const defaultId = await getDefaultWallet();
            setDefaultWalletId(defaultId);
            console.log("[WalletModal] Loaded default wallet:", defaultId);
        } catch (error) {
            console.error("[WalletModal] Failed to load default wallet:", error);
        }
    };

    // NEW: Fetch SOL balance for a wallet
    const fetchSolBalance = async (publicKey: string): Promise<number> => {
        try {
            const response = await fetch('https://rpc.helius.xyz/?api-key=e3b54e60-daee-442f-8b75-1893c5be291f', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [publicKey]
                })
            });

            const data = await response.json();
            if (data.result && typeof data.result.value === 'number') {
                return data.result.value / 1e9; // Convert lamports to SOL
            }
            return 0;
        } catch (error) {
            console.error("[WalletModal] Failed to fetch SOL balance for", publicKey, error);
            return 0;
        }
    };

    // NEW: Load SOL balance for a specific wallet
    const loadSolBalance = async (wallet: Wallet, silent: boolean = false) => {
        if (!wallet.publicKey) return;

        if (!silent) {
            setLoadingBalances(prev => ({ ...prev, [wallet.id]: true }));
        }
        
        try {
            const balance = await fetchSolBalance(wallet.publicKey);
            setSolBalances(prev => ({ ...prev, [wallet.id]: balance }));
            setLastBalanceUpdate(prev => ({ ...prev, [wallet.id]: new Date() }));
            
            if (!silent) {
                console.log(`[WalletModal] Loaded SOL balance for ${wallet.name}: ${balance} SOL`);
            }
        } catch (error) {
            console.error("[WalletModal] Error loading SOL balance for wallet", wallet.name, error);
        } finally {
            if (!silent) {
                setLoadingBalances(prev => ({ ...prev, [wallet.id]: false }));
            }
        }
    };

    // NEW: Load token balances for a specific wallet
    const loadTokenBalances = async (wallet: Wallet, silent: boolean = false) => {
        if (!wallet.publicKey) {
            setTokenBalances(prev => ({ ...prev, [wallet.id]: [] }));
            return;
        }

        if (!silent) {
            setLoadingTokens(prev => ({ ...prev, [wallet.id]: true }));
        }
        
        try {
            // First try to get cached balances
            const cachedBalances = await getStoredTokenBalances(wallet.publicKey);
            
            // Check if cached balances are recent (less than 5 minutes old)
            const recentBalances = cachedBalances.filter(balance => {
                const age = Date.now() - new Date(balance.lastUpdated).getTime();
                return age < 300000; // 5 minutes
            });

            if (recentBalances.length > 0 && !silent) {
                setTokenBalances(prev => ({ ...prev, [wallet.id]: recentBalances }));
                
                // If auto-refresh is enabled, fetch fresh data in background
                if (autoRefreshBalances) {
                    fetchTokenBalances(wallet.publicKey, wallet.id).then(freshBalances => {
                        setTokenBalances(prev => ({ ...prev, [wallet.id]: freshBalances }));
                    }).catch(error => {
                        console.error("[WalletModal] Background token balance refresh failed:", error);
                    });
                }
            } else {
                // No recent cached data, fetch fresh
                const freshBalances = await fetchTokenBalances(wallet.publicKey, wallet.id);
                setTokenBalances(prev => ({ ...prev, [wallet.id]: freshBalances }));
            }
            
            setLastBalanceUpdate(prev => ({ ...prev, [wallet.id]: new Date() }));
            
            if (!silent) {
                const balanceCount = tokenBalances[wallet.id]?.length || 0;
                console.log(`[WalletModal] Loaded ${balanceCount} token balances for ${wallet.name}`);
            }
        } catch (error) {
            console.error("[WalletModal] Failed to load token balances for wallet", wallet.name, error);
            setTokenBalances(prev => ({ ...prev, [wallet.id]: [] }));
        } finally {
            if (!silent) {
                setLoadingTokens(prev => ({ ...prev, [wallet.id]: false }));
            }
        }
    };

    // NEW: Refresh all balances for a wallet
    const refreshWalletBalances = async (wallet: Wallet, silent: boolean = false) => {
        if (!wallet.publicKey) return;

        await Promise.all([
            loadSolBalance(wallet, silent),
            loadTokenBalances(wallet, silent)
        ]);
    };

    // NEW: Refresh all wallet balances
    const refreshAllBalances = async () => {
        const walletsWithKeys = wallets.filter(w => w.publicKey);
        
        console.log(`[WalletModal] Refreshing balances for ${walletsWithKeys.length} wallets`);
        
        for (const wallet of walletsWithKeys) {
            await refreshWalletBalances(wallet, false);
        }
    };

    // Set default wallet
    const handleSetDefault = async (walletId: string | null) => {
        try {
            await setDefaultWallet(walletId);
            setDefaultWalletId(walletId);
            console.log("[WalletModal] Default wallet set:", walletId);
        } catch (error) {
            console.error("[WalletModal] Failed to set default wallet:", error);
            setError("Failed to set default wallet");
        }
    };

    // Start renaming process
    const startRename = (wallet: Wallet) => {
        setRenamingWallet(wallet.id);
        setNewWalletName(wallet.name);
    };

    // Cancel renaming
    const cancelRename = () => {
        setRenamingWallet(null);
        setNewWalletName("");
    };

    // Save new wallet name
    const saveRename = async () => {
        if (!renamingWallet || !newWalletName.trim()) return;
        
        try {
            await renameWallet(renamingWallet, newWalletName.trim());
            await loadWallets(); // Reload to show updated name
            setRenamingWallet(null);
            setNewWalletName("");
            console.log("[WalletModal] Wallet renamed successfully");
        } catch (error) {
            console.error("[WalletModal] Failed to rename wallet:", error);
            setError("Failed to rename wallet");
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setWalletData(null);
        
        try {
            console.log("[WalletModal] Generating new wallet with enhanced storage...");
            
            // Use the native helper from the main plugin
            const { generateSolanaKeypair } = 
                (VencordNative as any)?.pluginHelpers?.CreateCoinFromTweet ?? {};

            if (!generateSolanaKeypair) {
                throw new Error("Native plugin helpers not available. Make sure the plugin is properly loaded.");
            }

            // Generate keypair using native function
            const privateKeyBase58 = await generateSolanaKeypair();
            console.log("[WalletModal] Generated keypair successfully");

            // Generate a pump.fun API key (mock for now)
            const apiKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // Extract public key from private key (you'd need to implement this with @solana/web3.js)
            // For now, we'll generate a mock public key
            const publicKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const wallet: Wallet = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: `Wallet ${wallets.length + 1}`,
                apiKey: apiKey,
                publicKey: publicKey,
                privateKey: privateKeyBase58,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Store using enhanced storage
            await storeWallet(wallet);
            
            // Auto-set as default if no default exists
            if (!defaultWalletId && wallets.length === 0) {
                await handleSetDefault(wallet.id);
                console.log("[WalletModal] Set first wallet as default");
            }
            
            // Reload wallets and storage info
            await loadWallets();
            await loadStorageInfo();
            
            setWalletData(wallet);
            
            console.log("[WalletModal] Wallet created and stored successfully:", wallet.name);
        } catch (err: any) {
            console.error("[WalletModal] Generate error:", err);
            setError(err.message || "Failed to generate wallet");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWallet = async (walletId: string) => {
        // Don't allow deleting the default wallet without confirmation
        if (walletId === defaultWalletId) {
            if (!confirm("This is your default wallet. Deleting it will remove the default setting. Continue?")) {
                return;
            }
            await handleSetDefault(null); // Clear default if deleting default wallet
        }
        
        try {
            await deleteStoredWallet(walletId);
            await loadWallets();
            await loadStorageInfo();
            setExpandedWallet(null);
            
            // Clean up balance data
            setSolBalances(prev => {
                const newBalances = { ...prev };
                delete newBalances[walletId];
                return newBalances;
            });
            setTokenBalances(prev => {
                const newBalances = { ...prev };
                delete newBalances[walletId];
                return newBalances;
            });
            setLastBalanceUpdate(prev => {
                const newUpdates = { ...prev };
                delete newUpdates[walletId];
                return newUpdates;
            });
            
            console.log("[WalletModal] Wallet deleted:", walletId);
        } catch (err: any) {
            console.error("[WalletModal] Delete error:", err);
            setError("Failed to delete wallet");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log("[WalletModal] Copied to clipboard");
        }).catch(err => {
            console.error("[WalletModal] Copy failed:", err);
        });
    };

    const toggleWalletExpansion = (walletId: string) => {
        setExpandedWallet(expandedWallet === walletId ? null : walletId);
    };

    // NEW: Toggle token list expansion
    const toggleTokenExpansion = (walletId: string) => {
        setExpandedTokens(prev => ({
            ...prev,
            [walletId]: !prev[walletId]
        }));
    };

    // NEW: Format balance display
    const formatBalance = (balance: number): string => {
        if (balance === 0) return "0.0000";
        if (balance < 0.0001) return balance.toExponential(2);
        return balance.toFixed(4);
    };

    // Export wallets to JSON file
    const exportWallets = async () => {
        try {
            const walletsToExport = await getStoredWallets();
            if (walletsToExport.length === 0) {
                alert("No wallets to export!");
                return;
            }

            const exportData = {
                version: "2.1", // Updated version for enhanced storage with default wallet
                exportDate: new Date().toISOString(),
                defaultWallet: defaultWalletId,
                wallets: walletsToExport,
                metadata: {
                    totalWallets: walletsToExport.length,
                    pluginName: "CreateCoinFromTweet",
                    storageType: "enhanced_indexeddb_with_default"
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `pump-wallets-enhanced-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            console.log("[WalletModal] Exported", walletsToExport.length, "wallets with enhanced storage");
        } catch (err: any) {
            console.error("[WalletModal] Export error:", err);
            setError("Failed to export wallets: " + err.message);
        }
    };

    // Import wallets from JSON file
    const importWallets = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const importData = JSON.parse(content);
                
                // Validate import data structure
                if (!importData.wallets || !Array.isArray(importData.wallets)) {
                    throw new Error("Invalid wallet file format - missing wallets array");
                }

                // Validate each wallet
                const validWallets = importData.wallets.filter((wallet: any) => 
                    wallet && 
                    typeof wallet.id === 'string' && 
                    typeof wallet.name === 'string' && 
                    (wallet.apiKey || wallet.publicKey || wallet.privateKey)
                );

                if (validWallets.length === 0) {
                    throw new Error("No valid wallets found in import file");
                }

                // Get current wallets
                const currentWallets = await getStoredWallets();
                const newWallets: Wallet[] = [];
                const skippedWallets: string[] = [];

                // Process each imported wallet
                for (const importedWallet of validWallets) {
                    // Check if wallet already exists (by name or public key)
                    const existingWallet = currentWallets.find(w => 
                        w.name === importedWallet.name || 
                        (w.publicKey && importedWallet.publicKey && w.publicKey === importedWallet.publicKey)
                    );

                    if (existingWallet) {
                        skippedWallets.push(importedWallet.name);
                    } else {
                        // Create wallet with proper timestamps for enhanced storage
                        const walletWithEnhancedData: Wallet = {
                            ...importedWallet,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            createdAt: importedWallet.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        // Store using enhanced storage
                        await storeWallet(walletWithEnhancedData);
                        newWallets.push(walletWithEnhancedData);
                    }
                }

                // Import default wallet setting if available
                if (importData.defaultWallet && newWallets.some(w => w.id === importData.defaultWallet)) {
                    await handleSetDefault(importData.defaultWallet);
                }

                if (newWallets.length === 0) {
                    alert(`No new wallets to import. ${skippedWallets.length} wallets were skipped (already exist).`);
                    return;
                }

                // Reload wallets and storage info
                await loadWallets();
                await loadStorageInfo();

                // Show success message
                let message = `✅ Successfully imported ${newWallets.length} wallet(s) using enhanced storage!`;
                if (skippedWallets.length > 0) {
                    message += `\n\n⚠️ Skipped ${skippedWallets.length} duplicate wallet(s): ${skippedWallets.join(", ")}`;
                }
                if (importData.defaultWallet) {
                    message += `\n\n🎯 Default wallet setting imported`;
                }
                alert(message);

                console.log("[WalletModal] Imported", newWallets.length, "wallets to enhanced storage, skipped", skippedWallets.length);
                
            } catch (err: any) {
                console.error("[WalletModal] Import error:", err);
                setError("Failed to import wallets: " + err.message);
            }
        };

        reader.readAsText(file);
        // Reset the input so the same file can be imported again
        event.target.value = '';
    };

    // Clear storage
    const clearStorage = async () => {
        if (!confirm("Are you sure you want to clear all storage? This will delete all wallets, cached images, and upload history.")) {
            return;
        }

        try {
            // Clear default wallet setting
            await setDefaultWallet(null);
            
            // Clear image cache
            await storageManager.clearImageCache();
            
            // Clear old uploads
            await storageManager.clearOldUploads();
            
            // Delete all wallets
            const allWallets = await getStoredWallets();
            for (const wallet of allWallets) {
                await deleteStoredWallet(wallet.id);
            }
            
            await loadWallets();
            await loadStorageInfo();
            await loadDefaultWallet();
            
            // Clear balance data
            setSolBalances({});
            setTokenBalances({});
            setLastBalanceUpdate({});
            
            alert("✅ Storage cleared successfully!");
        } catch (err: any) {
            console.error("[WalletModal] Clear storage error:", err);
            setError("Failed to clear storage: " + err.message);
        }
    };

    const renderKeyField = (label: string, value: string) => {
        if (!value) return null;
        
        return (
            <div style={{
                backgroundColor: BRAND_COLORS.primary,
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: `1px solid ${BRAND_COLORS.primaryDark}`
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px"
                }}>
                    <span style={{
                        color: "#000000", // Black text on light background
                        fontWeight: "600",
                        fontSize: "12px"
                    }}>
                        {label}
                    </span>
                    <button
                        onClick={() => copyToClipboard(value)}
                        style={{
                            background: BRAND_COLORS.accent3,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Copy
                    </button>
                </div>
                <div style={{
                    backgroundColor: BRAND_COLORS.primaryDark,
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#000000", // Black text on light background
                    wordBreak: "break-all",
                    maxHeight: "100px",
                    overflowY: "auto"
                }}>
                    {value}
                </div>
            </div>
        );
    };

    return (
        <ModalRoot {...props}>
            <style>{`
                .live-indicator {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
                .balance-item {
                    transition: all 0.2s ease;
                }
                .balance-item:hover {
                    background-color: ${BRAND_COLORS.accent3}20;
                }
                .token-list {
                    max-height: 200px;
                    overflow-y: auto;
                }
            `}</style>
            
            <ModalHeader>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    width: "100%",
                    padding: "12px 0",
                    margin: "0 auto"
                }}>
                    {PADRAIG_LOGO_BASE64 ? (
                        <img 
                            src={PADRAIG_LOGO_BASE64} 
                            alt="Padraig Logo" 
                            style={{
                                height: "42px",
                                width: "auto"
                            }}
                        />
                    ) : (
                        <div style={{
                            color: BRAND_COLORS.text,
                            fontSize: "18px",
                            fontWeight: "600"
                        }}>
                            PadraigAIO
                        </div>
                    )}
                </div>
            </ModalHeader>
            <ModalContent>
                {/* NEW: Balance Refresh Controls */}
                <div style={{
                    backgroundColor: BRAND_COLORS.accent2 + "20",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: `1px solid ${BRAND_COLORS.accent2}`
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px"
                    }}>
                        <span style={{
                            color: BRAND_COLORS.text,
                            fontWeight: "600",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            💰 Real-time Balance Tracking
                            {autoRefreshBalances && balanceRefreshEnabled && (
                                <span 
                                    className="live-indicator"
                                    style={{ 
                                        fontSize: "10px", 
                                        color: "#000000", // Black text
                                        backgroundColor: BRAND_COLORS.success + "30",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontWeight: "600"
                                    }}>
                                    LIVE
                                </span>
                            )}
                        </span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <select
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                                disabled={!autoRefreshBalances || !balanceRefreshEnabled}
                                style={{
                                    backgroundColor: autoRefreshBalances && balanceRefreshEnabled ? BRAND_COLORS.success : BRAND_COLORS.charcoal,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 6px",
                                    fontSize: "9px",
                                    cursor: autoRefreshBalances && balanceRefreshEnabled ? "pointer" : "not-allowed",
                                    fontWeight: "600",
                                    opacity: autoRefreshBalances && balanceRefreshEnabled ? 1 : 0.6
                                }}
                            >
                                <option value={5000}>5s</option>
                                <option value={10000}>10s</option>
                                <option value={15000}>15s</option>
                                <option value={30000}>30s</option>
                                <option value={60000}>1m</option>
                            </select>
                            
                            <button
                                onClick={() => setAutoRefreshBalances(!autoRefreshBalances)}
                                style={{
                                    backgroundColor: autoRefreshBalances ? BRAND_COLORS.success : BRAND_COLORS.charcoal,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                {autoRefreshBalances ? "🟢 Auto" : "⭕ Manual"}
                            </button>
                            
                            <button
                                onClick={() => setBalanceRefreshEnabled(!balanceRefreshEnabled)}
                                style={{
                                    backgroundColor: balanceRefreshEnabled ? BRAND_COLORS.accent3 : BRAND_COLORS.danger,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                {balanceRefreshEnabled ? "Enabled" : "Disabled"}
                            </button>
                            
                            <button
                                onClick={refreshAllBalances}
                                disabled={wallets.filter(w => w.publicKey).length === 0}
                                style={{
                                    backgroundColor: BRAND_COLORS.accent2,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    cursor: wallets.filter(w => w.publicKey).length === 0 ? "not-allowed" : "pointer",
                                    opacity: wallets.filter(w => w.publicKey).length === 0 ? 0.6 : 1,
                                    fontWeight: "600"
                                }}
                            >
                                🔄 Refresh All
                            </button>
                        </div>
                    </div>
                    <div style={{
                        fontSize: "11px",
                        color: BRAND_COLORS.textMuted
                    }}>
                        {balanceRefreshEnabled 
                            ? `✅ Real-time SOL and token balance tracking ${autoRefreshBalances ? `(${refreshInterval/1000}s refresh)` : '(manual only)'}`
                            : "⚠️ Balance tracking disabled - enable to see wallet balances"
                        }
                    </div>
                </div>

                {/* Default Wallet Setting */}
                {wallets.length > 0 && (
                    <div style={{
                        backgroundColor: BRAND_COLORS.accent3 + "20",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        border: `1px solid ${BRAND_COLORS.accent3}`
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px"
                        }}>
                            <span style={{
                                color: BRAND_COLORS.text,
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                🎯 Default Wallet Setting
                            </span>
                            {defaultWalletId && (
                                <button
                                    onClick={() => handleSetDefault(null)}
                                    style={{
                                        background: BRAND_COLORS.warning,
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "10px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Clear Default
                                </button>
                            )}
                        </div>
                        <select
                            value={defaultWalletId || ""}
                            onChange={(e) => handleSetDefault(e.target.value || null)}
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: `1px solid ${BRAND_COLORS.primaryDark}`,
                                backgroundColor: BRAND_COLORS.primary,
                                color: "#000000", // Black text for dropdown
                                fontSize: "12px"
                            }}
                        >
                            <option value="">No Default Wallet (Manual Selection Required)</option>
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.name} {wallet.apiKey ? '(Has API Key)' : '(No API Key)'}
                                    {solBalances[wallet.id] !== undefined ? ` - ${formatBalance(solBalances[wallet.id])} SOL` : ''}
                                </option>
                            ))}
                        </select>
                        <div style={{
                            fontSize: "11px",
                            color: BRAND_COLORS.textMuted,
                            marginTop: "4px"
                        }}>
                            {defaultWalletId 
                                ? "✅ This wallet will be used by default in all trading operations"
                                : "⚠️ You will need to manually select a wallet for each operation"
                            }
                        </div>
                    </div>
                )}

                {walletData && (
                    <div style={{
                        backgroundColor: BRAND_COLORS.primary, // Light background
                        color: BRAND_COLORS.success,
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        marginBottom: "16px",
                        border: `1px solid ${BRAND_COLORS.success}`
                    }}>
                        <div style={{ fontWeight: "bold", marginBottom: "8px", color: BRAND_COLORS.success }}>
                            ✅ Wallet Created Successfully!
                        </div>
                        <div style={{ fontSize: "12px", color: "#000000" }}> {/* Black text for better readability */}
                            Your new wallet "{walletData.name}" has been created and stored securely.
                        </div>
                        <div style={{ fontSize: "11px", color: "#000000", marginTop: "4px" }}> {/* Black text */}
                            Keys generated: {[
                                walletData.apiKey && "API Key",
                                walletData.publicKey && "Public Key", 
                                walletData.privateKey && "Private Key"
                            ].filter(Boolean).join(", ") || "None"}
                            {defaultWalletId === walletData.id && " • Set as Default"}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? "#666" : BRAND_COLORS.accent3,
                        color: loading ? "#ccc" : "#fff",
                        padding: "12px 20px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        width: "100%",
                        marginBottom: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        transition: "all 0.2s ease"
                    }}
                >
                    {loading ? "Generating Wallet..." : "Generate New Wallet"}
                </button>

                {/* Storage Controls */}
                <div style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                    padding: "12px",
                    backgroundColor: BRAND_COLORS.primaryDark,
                    borderRadius: "8px",
                    border: `1px solid ${BRAND_COLORS.accent2}40`
                }}>
                    <button
                        onClick={exportWallets}
                        disabled={wallets.length === 0}
                        style={{
                            backgroundColor: wallets.length === 0 ? "#666" : BRAND_COLORS.accent2,
                            color: wallets.length === 0 ? "#999" : "#fff",
                            padding: "8px 16px",
                            fontWeight: "600",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: wallets.length === 0 ? "not-allowed" : "pointer",
                            flex: "1",
                            opacity: wallets.length === 0 ? 0.5 : 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        📤 Export
                    </button>
                    
                    <label style={{
                        backgroundColor: BRAND_COLORS.primary,
                        color: "#000000", // Black text for label
                        padding: "8px 16px",
                        fontWeight: "600",
                        fontSize: "12px",
                        border: `1px solid ${BRAND_COLORS.accent2}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        flex: "1",
                        textAlign: "center",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                    }}>
                        📥 Import
                        <input
                            type="file"
                            accept=".json"
                            onChange={importWallets}
                            style={{ display: "none" }}
                        />
                    </label>

                    <button
                        onClick={clearStorage}
                        style={{
                            backgroundColor: BRAND_COLORS.danger,
                            color: "white",
                            padding: "8px 12px",
                            fontWeight: "600",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        🗑️ Clear
                    </button>
                </div>

                {/* Wallet Count Info */}
                {wallets.length > 0 && (
                    <div style={{
                        backgroundColor: BRAND_COLORS.primaryDark,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#000000", // Black text for better readability
                        marginBottom: "16px",
                        textAlign: "center",
                        border: `1px solid ${BRAND_COLORS.accent3}40`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                    }}>
                        💾 {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} stored
                        {wallets.some(w => w.publicKey) && (
                            <> • {wallets.filter(w => w.publicKey).length} with public keys</>
                        )}
                        {defaultWalletId && (
                            <> • Default: {wallets.find(w => w.id === defaultWalletId)?.name}</>
                        )}
                        {/* NEW: Total balance info */}
                        {Object.keys(solBalances).length > 0 && (
                            <> • Total: {Object.values(solBalances).reduce((a, b) => a + b, 0).toFixed(4)} SOL</>
                        )}
                    </div>
                )}

                {error && (
                    <div style={{
                        color: BRAND_COLORS.danger,
                        backgroundColor: BRAND_COLORS.danger + "20",
                        padding: "8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginBottom: "16px",
                        border: `1px solid ${BRAND_COLORS.danger}`
                    }}>
                        {error}
                    </div>
                )}

                {wallets.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                        <h4 style={{
                            color: BRAND_COLORS.text,
                            fontSize: "16px",
                            marginBottom: "12px",
                            fontWeight: "600"
                        }}>
                            Your Wallets ({wallets.length})
                        </h4>
                        
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                style={{
                                    backgroundColor: BRAND_COLORS.primaryDark,
                                    padding: "12px",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    border: wallet.id === defaultWalletId 
                                        ? `2px solid ${BRAND_COLORS.accent3}` 
                                        : `1px solid ${BRAND_COLORS.accent2}`
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: expandedWallet === wallet.id ? "12px" : "0"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                                        <button
                                            onClick={() => toggleWalletExpansion(wallet.id)}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: BRAND_COLORS.text,
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}
                                        >
                                            <span style={{
                                                transform: expandedWallet === wallet.id ? "rotate(90deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s ease"
                                            }}>
                                                ▶
                                            </span>
                                        </button>
                                        
                                        {/* Inline renaming */}
                                        {renamingWallet === wallet.id ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={newWalletName}
                                                    onChange={(e) => setNewWalletName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && saveRename()}
                                                    style={{
                                                        backgroundColor: BRAND_COLORS.primary,
                                                        border: `1px solid ${BRAND_COLORS.accent3}`,
                                                        borderRadius: "4px",
                                                        padding: "4px 8px",
                                                        color: "#000000", // Black text in input
                                                        fontSize: "12px",
                                                        flex: 1
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={saveRename}
                                                    style={{
                                                        backgroundColor: BRAND_COLORS.success,
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "3px",
                                                        padding: "4px 6px",
                                                        fontSize: "10px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={cancelRename}
                                                    style={{
                                                        backgroundColor: BRAND_COLORS.danger,
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "3px",
                                                        padding: "4px 6px",
                                                        fontSize: "10px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                                                <span style={{ fontSize: "14px", fontWeight: "600", color: BRAND_COLORS.charcoal }}>
                                                    {wallet.name}
                                                    {wallet.id === defaultWalletId && (
                                                        <span style={{ 
                                                            color: BRAND_COLORS.accent3, 
                                                            fontSize: "10px", 
                                                            marginLeft: "4px" 
                                                        }}>
                                                            🎯 DEFAULT
                                                        </span>
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => startRename(wallet)}
                                                    style={{
                                                        background: BRAND_COLORS.accent2,
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "3px",
                                                        padding: "2px 6px",
                                                        fontSize: "9px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    ✏️ Rename
                                                </button>
                                            </div>
                                        )}
                                        
                                        <span style={{
                                            fontSize: "10px",
                                            color: BRAND_COLORS.textMuted,
                                            fontWeight: "normal"
                                        }}>
                                            ({[
                                                wallet.apiKey && "API",
                                                wallet.publicKey && "PUB", 
                                                wallet.privateKey && "PRIV"
                                            ].filter(Boolean).join(", ")})
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {/* Set as default button */}
                                        {wallet.id !== defaultWalletId && wallet.apiKey && (
                                            <button
                                                onClick={() => handleSetDefault(wallet.id)}
                                                style={{
                                                    backgroundColor: BRAND_COLORS.accent3,
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "10px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            style={{
                                                backgroundColor: BRAND_COLORS.danger,
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                padding: "4px 8px",
                                                fontSize: "10px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* NEW: Balance Display */}
                                {wallet.publicKey && balanceRefreshEnabled && (
                                    <div style={{
                                        backgroundColor: BRAND_COLORS.primary + "10",
                                        padding: "8px",
                                        borderRadius: "6px",
                                        marginBottom: expandedWallet === wallet.id ? "12px" : "0",
                                        border: `1px solid ${BRAND_COLORS.accent3}40`
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "8px"
                                        }}>
                                            <span style={{
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                color: BRAND_COLORS.charcoal
                                            }}>
                                                💰 Live Balances
                                            </span>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <button
                                                    onClick={() => refreshWalletBalances(wallet)}
                                                    disabled={loadingBalances[wallet.id] || loadingTokens[wallet.id]}
                                                    style={{
                                                        backgroundColor: BRAND_COLORS.accent2,
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "3px",
                                                        padding: "2px 6px",
                                                        fontSize: "9px",
                                                        cursor: loadingBalances[wallet.id] || loadingTokens[wallet.id] ? "not-allowed" : "pointer",
                                                        opacity: loadingBalances[wallet.id] || loadingTokens[wallet.id] ? 0.6 : 1
                                                    }}
                                                >
                                                    {loadingBalances[wallet.id] || loadingTokens[wallet.id] ? "🔄" : "🔄 Refresh"}
                                                </button>
                                                {tokenBalances[wallet.id] && tokenBalances[wallet.id].length > 0 && (
                                                    <button
                                                        onClick={() => toggleTokenExpansion(wallet.id)}
                                                        style={{
                                                            backgroundColor: BRAND_COLORS.accent3,
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "3px",
                                                            padding: "2px 6px",
                                                            fontSize: "9px",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        {expandedTokens[wallet.id] ? "Hide Tokens" : `Show ${tokenBalances[wallet.id].length} Tokens`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* SOL Balance */}
                                        <div className="balance-item" style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "4px 8px",
                                            backgroundColor: BRAND_COLORS.primaryDark,
                                            borderRadius: "4px",
                                            marginBottom: "4px"
                                        }}>
                                            <span style={{ fontSize: "11px", fontWeight: "600", color: BRAND_COLORS.charcoal }}>
                                                Solana (SOL)
                                            </span>
                                            <span style={{ 
                                                fontSize: "11px", 
                                                fontFamily: "monospace", 
                                                color: loadingBalances[wallet.id] ? BRAND_COLORS.textMuted : "#000000", // Black text for balance
                                                fontWeight: "600"
                                            }}>
                                                {loadingBalances[wallet.id] 
                                                    ? "Loading..." 
                                                    : solBalances[wallet.id] !== undefined 
                                                        ? `${formatBalance(solBalances[wallet.id])} SOL`
                                                        : "Not loaded"
                                                }
                                            </span>
                                        </div>

                                        {/* Token Balances Summary */}
                                        {tokenBalances[wallet.id] && tokenBalances[wallet.id].length > 0 && (
                                            <div className="balance-item" style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "4px 8px",
                                                backgroundColor: BRAND_COLORS.accent3 + "20",
                                                borderRadius: "4px",
                                                marginBottom: expandedTokens[wallet.id] ? "8px" : "4px"
                                            }}>
                                                <span style={{ fontSize: "11px", fontWeight: "600", color: BRAND_COLORS.charcoal }}>
                                                    Tokens Held
                                                </span>
                                                <span style={{ 
                                                    fontSize: "11px", 
                                                    color: "#000000", // Black text for token count
                                                    fontWeight: "600"
                                                }}>
                                                    {tokenBalances[wallet.id].length} different tokens
                                                </span>
                                            </div>
                                        )}

                                        {/* Expanded Token List */}
                                        {expandedTokens[wallet.id] && tokenBalances[wallet.id] && tokenBalances[wallet.id].length > 0 && (
                                            <div className="token-list" style={{
                                                maxHeight: "150px",
                                                overflowY: "auto",
                                                backgroundColor: BRAND_COLORS.primary + "05",
                                                borderRadius: "4px",
                                                padding: "4px"
                                            }}>
                                                {tokenBalances[wallet.id].map((token, index) => (
                                                    <div key={token.mint || index} className="balance-item" style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        padding: "3px 6px",
                                                        backgroundColor: BRAND_COLORS.primaryDark,
                                                        borderRadius: "3px",
                                                        marginBottom: "2px"
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ 
                                                                fontSize: "10px", 
                                                                fontWeight: "600", 
                                                                color: BRAND_COLORS.charcoal 
                                                            }}>
                                                                {token.tokenInfo?.name || "Unknown Token"}
                                                                {token.tokenInfo?.symbol && ` (${token.tokenInfo.symbol})`}
                                                            </div>
                                                            <div style={{ 
                                                                fontSize: "9px", 
                                                                color: BRAND_COLORS.textMuted,
                                                                fontFamily: "monospace"
                                                            }}>
                                                                {token.mint ? `${token.mint.slice(0, 8)}...${token.mint.slice(-8)}` : 'No mint'}
                                                            </div>
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: "10px", 
                                                            fontFamily: "monospace", 
                                                            color: "#000000", // Black text for token amounts
                                                            fontWeight: "600",
                                                            textAlign: "right"
                                                        }}>
                                                            {token.uiAmount ? token.uiAmount.toLocaleString() : '0'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Loading States */}
                                        {loadingTokens[wallet.id] && (
                                            <div style={{
                                                textAlign: "center",
                                                color: BRAND_COLORS.textMuted,
                                                fontSize: "10px",
                                                padding: "8px"
                                            }}>
                                                🔄 Loading token balances...
                                            </div>
                                        )}

                                        {/* Last Update Time */}
                                        {lastBalanceUpdate[wallet.id] && (
                                            <div style={{
                                                fontSize: "9px",
                                                color: BRAND_COLORS.textMuted,
                                                textAlign: "center",
                                                marginTop: "4px"
                                            }}>
                                                Last updated: {lastBalanceUpdate[wallet.id].toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {expandedWallet === wallet.id && (
                                    <div style={{
                                        borderTop: `1px solid ${BRAND_COLORS.accent2}`,
                                        paddingTop: "12px"
                                    }}>
                                        {renderKeyField("API Key", wallet.apiKey || "")}
                                        {renderKeyField("Public Key", wallet.publicKey || "")}
                                        {renderKeyField("Private Key", wallet.privateKey || "")}
                                        
                                        <div style={{
                                            fontSize: "10px",
                                            color: BRAND_COLORS.textMuted,
                                            marginTop: "8px",
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "8px"
                                        }}>
                                            <div>Created: {new Date(wallet.createdAt).toLocaleString()}</div>
                                            <div>Updated: {new Date(wallet.updatedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ModalContent>
            <ModalFooter>
                <Button
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.LINK}
                    onClick={props.onClose}
                    style={{ color: BRAND_COLORS.textMuted }}
                >
                    Close
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}