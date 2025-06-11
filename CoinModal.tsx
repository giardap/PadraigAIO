import { ModalRoot, ModalHeader, ModalContent, ModalFooter } from "@utils/modal";
import { Button, Text, Forms, React } from "@webpack/common";
import { getGlobalTradingSettings } from "./StandaloneTradingSettingsModal";
import { 
    getStoredWallets, 
    storeWallet, 
    deleteStoredWallet,
    Wallet,
    storageManager,
    getCachedImageForIPFS,
    cacheImageForIPFS,
    prepareImageForIPFSUpload,
    getDefaultWallet,
    updateCreatedCoinStatus,
    extractContractAddressFromTx,
    storeCreatedCoin,
    CreatedCoin
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
    text: "#2D3748",          // Dark text
    textMuted: "#718096"      // Muted text
};

// Enhanced storage helper for React context (handles Vencord frame wrapping)
class ReactUploadStorage {
    async storeUploadData(imageData: string, metadata: {
        name: string;
        symbol: string;
        filename: string;
        description: string;
        website: string;
        mint: string;
    }): Promise<boolean> {
        try {
            const { storeUploadData } = 
                (VencordNative as any)?.pluginHelpers?.CreateCoinFromTweet ?? {};

            if (!storeUploadData) {
                throw new Error("Native storeUploadData function not available");
            }

            // Vencord wraps parameters into an object, so we pass both as a single object
            const success = await storeUploadData({
                imageData: imageData,
                metadata: metadata
            });

            if (!success) {
                throw new Error("Failed to store upload data in native context");
            }

            console.log("[ReactUploadStorage] Upload data stored successfully via native function (Vencord frame wrapping handled)");
        } catch (error) {
            console.error("[ReactUploadStorage] Failed to store upload data:", error);
            throw error;
        }
    }
}

const reactUploadStorage = new ReactUploadStorage();

export function CoinModal(props: any) {
    const [coinName, setCoinName] = React.useState("");
    const [symbol, setSymbol] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = React.useState<string>("");
    const [selectedWallet, setSelectedWallet] = React.useState<string>("");
    const [wallets, setWallets] = React.useState<Wallet[]>([]);
    const [walletBalances, setWalletBalances] = React.useState<Record<string, number>>({});
    const [loadingBalances, setLoadingBalances] = React.useState<Record<string, boolean>>({});
    const [loading, setLoading] = React.useState(false);
    const [response, setResponse] = React.useState<string | null>(null);
    
    // Enhanced storage state
    const [storageInfo, setStorageInfo] = React.useState<any>(null);
    const [usingCachedImage, setUsingCachedImage] = React.useState(false);
    const [uploadHistory, setUploadHistory] = React.useState<any[]>([]);
    const [imageOptimized, setImageOptimized] = React.useState(false);

    // NEW: Get dev buy amount from global settings and allow manual override
    const globalSettings = getGlobalTradingSettings();
    const [buyAmount, setBuyAmount] = React.useState(globalSettings.devBuyAmount || "0.1");
    const [useCustomBuyAmount, setUseCustomBuyAmount] = React.useState(false);

    // Load wallets from enhanced storage and set default
    React.useEffect(() => {
        const loadWalletsAndDefault = async () => {
            console.log("[CoinModal] Loading wallets and default setting...");
            try {
                const storedWallets = await getStoredWallets();
                console.log("[CoinModal] Loaded wallets from IndexedDB:", storedWallets.length);
                setWallets(storedWallets);

                // Load default wallet setting
                const defaultWalletId = await getDefaultWallet();
                if (defaultWalletId && storedWallets.find(w => w.id === defaultWalletId)) {
                    setSelectedWallet(defaultWalletId);
                    console.log("[CoinModal] Default wallet loaded:", defaultWalletId);
                } else if (storedWallets.length > 0) {
                    // If no default set but wallets exist, use first wallet
                    setSelectedWallet(storedWallets[0].id);
                    console.log("[CoinModal] No default, using first wallet:", storedWallets[0].name);
                }
            } catch (error) {
                console.error("[CoinModal] Failed to load wallets:", error);
                setWallets([]);
            }
        };
        loadWalletsAndDefault();
    }, []);

    // NEW: Update buy amount when global settings change
    React.useEffect(() => {
        if (!useCustomBuyAmount) {
            const currentSettings = getGlobalTradingSettings();
            setBuyAmount(currentSettings.devBuyAmount || "0.1");
        }
    }, [useCustomBuyAmount]);

    // Load storage info and upload history
    React.useEffect(() => {
        const loadStorageData = async () => {
            try {
                const [info, history] = await Promise.all([
                    storageManager.getStorageInfo(),
                    storageManager.getUploadHistory(10)
                ]);
                setStorageInfo(info);
                setUploadHistory(history);
            } catch (error) {
                console.error("[CoinModal] Failed to load storage data:", error);
            }
        };
        loadStorageData();
    }, []);

    // Fetch SOL balance for a given public key using Helius RPC
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
            console.error("[CoinModal] Failed to fetch balance for", publicKey, error);
            return 0;
        }
    };

    // Load balance for a specific wallet
    const loadWalletBalance = async (wallet: Wallet) => {
        if (!wallet.publicKey) return;

        setLoadingBalances(prev => ({ ...prev, [wallet.id]: true }));
        
        try {
            const balance = await fetchSolBalance(wallet.publicKey);
            setWalletBalances(prev => ({ ...prev, [wallet.id]: balance }));
        } catch (error) {
            console.error("[CoinModal] Error loading balance for wallet", wallet.name, error);
        } finally {
            setLoadingBalances(prev => ({ ...prev, [wallet.id]: false }));
        }
    };

    // Load balances for all wallets when wallets change
    React.useEffect(() => {
        wallets.forEach(wallet => {
            if (wallet.publicKey && !(wallet.id in walletBalances)) {
                loadWalletBalance(wallet);
            }
        });
    }, [wallets]);

    // Get the currently selected wallet object
    const selectedWalletObj = React.useMemo(() => {
        const wallet = wallets.find(w => w.id === selectedWallet);
        console.log("[CoinModal] Selected wallet:", wallet?.name || "None");
        return wallet;
    }, [selectedWallet, wallets]);

    // Auto-populate description from message content
    React.useEffect(() => {
        if (props.messageContent && !description) {
            const cleanContent = props.messageContent
                .replace(/https?:\/\/[^\s]+/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 200);
            
            if (cleanContent) {
                setDescription(cleanContent);
            }
        }
    }, [props.messageContent]);

    // Set first extracted image as preview if available
    React.useEffect(() => {
        if (props.extractedImages && props.extractedImages.length > 0 && !imagePreview) {
            setSelectedImageUrl(props.extractedImages[0]);
            setImagePreview(props.extractedImages[0]);
            checkCachedImage(props.extractedImages[0]);
        }
    }, [props.extractedImages]);

    // Check if image is cached
    const checkCachedImage = async (imageUrl: string) => {
        try {
            const cached = await getCachedImageForIPFS(imageUrl);
            if (cached) {
                console.log("[CoinModal] Image found in cache:", {
                    url: imageUrl,
                    size: cached.blob.size,
                    filename: cached.filename
                });
                setUsingCachedImage(true);
                
                // Create object URL for preview
                const objectUrl = URL.createObjectURL(cached.blob);
                setImagePreview(objectUrl);
            } else {
                setUsingCachedImage(false);
            }
        } catch (error) {
            console.error("[CoinModal] Failed to check cached image:", error);
            setUsingCachedImage(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setSelectedImageUrl("");
            setUsingCachedImage(false);
            setImageOptimized(false);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const selectExtractedImage = async (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setImagePreview(imageUrl);
        setImage(null);
        setImageOptimized(false);
        await checkCachedImage(imageUrl);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log("[CoinModal] Copied to clipboard");
        }).catch(err => {
            console.error("[CoinModal] Copy failed:", err);
        });
    };

    const formatAddress = (address: string) => {
        if (!address) return "";
        if (address.length <= 12) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    // Enhanced URL validation
    const validateUrl = (url: string): string => {
        console.log("[CoinModal] Validating URL:", url);
        
        if (!url || typeof url !== 'string') {
            return "https://pumpportal.fun";
        }

        const cleanUrl = url.trim();
        
        if (cleanUrl.length < 10) {
            console.warn("[CoinModal] URL too short, using default:", cleanUrl);
            return "https://pumpportal.fun";
        }

        try {
            const urlObj = new URL(cleanUrl);
            return urlObj.href;
        } catch (error) {
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                try {
                    const urlObj = new URL('https://' + cleanUrl);
                    return urlObj.href;
                } catch (error2) {
                    console.warn("[CoinModal] Could not validate URL, using default:", cleanUrl);
                    return "https://pumpportal.fun";
                }
            }
            
            console.warn("[CoinModal] Invalid URL, using default:", cleanUrl);
            return "https://pumpportal.fun";
        }
    };

    // NEW: Handle quick buy amount presets
    const handleQuickBuyAmount = (amount: string) => {
        setBuyAmount(amount);
        setUseCustomBuyAmount(true);
    };

    // Enhanced submit with integrated working IPFS upload logic
    const submit = async () => {
        if (!coinName || !symbol || (!image && !selectedImageUrl)) {
            alert("Please provide a name, symbol, and image.");
            return;
        }
        
        if (!selectedWallet || !selectedWalletObj?.apiKey) {
            alert("Please select a wallet with an API key to create tokens.");
            return;
        }

        setLoading(true);
        setResponse("🚀 Starting token creation with IPFS upload...");

        const nameStr = coinName || "Untitled Coin";
        const symbolStr = symbol || "COIN";
        const descStr = description || "Generated via Pump.fun plugin";
        
        // Enhanced URL validation
        const rawLinkStr = props.extractedLink || "https://pumpportal.fun";
        const linkStr = validateUrl(rawLinkStr);
        
        console.log("[CoinModal] URL validation:", {
            raw: rawLinkStr,
            validated: linkStr,
            changed: rawLinkStr !== linkStr
        });

        let uploadMethod: 'cached' | 'direct' = 'direct';
        let imageUrl: string = "";
        let filename: string = "";

        try {
            console.log("[CoinModal] Starting token creation with integrated IPFS...");
            
            // Get the native upload functions
            const { generateSolanaKeypair, storeUploadData, processUpload } = 
                (VencordNative as any)?.pluginHelpers?.CreateCoinFromTweet ?? {};

            if (!generateSolanaKeypair || !storeUploadData || !processUpload) {
                throw new Error("Native plugin helpers not available. Make sure the plugin is properly loaded.");
            }

            setResponse("🔑 Generating mint keypair...");
            const mint = await generateSolanaKeypair();
            console.log("[CoinModal] Generated mint:", mint);

            // Enhanced image handling with storage integration
            if (selectedImageUrl) {
                setResponse("📁 Checking cached images for faster processing...");
                
                try {
                    // Try to use cached and optimized image first
                    const prepared = await prepareImageForIPFSUpload(selectedImageUrl);
                    
                    if (prepared.fromCache) {
                        console.log("[CoinModal] Using cached image for IPFS upload:", {
                            size: prepared.blob.size,
                            optimized: prepared.optimized
                        });
                        
                        uploadMethod = 'cached';
                        setResponse(`💾 Using cached image (${prepared.optimized ? 'optimized, ' : ''}${(prepared.blob.size / 1024).toFixed(1)}KB)...`);
                        
                        // Convert cached blob to data URL for bridge transfer
                        const base64 = await blobToBase64(prepared.blob);
                        imageUrl = `data:${prepared.blob.type};base64,${base64}`;
                        filename = prepared.filename;
                        setImageOptimized(prepared.optimized);
                        
                        // Check bridge transfer size
                        if (imageUrl.length > 1500000) { // 1.5MB limit for bridge
                            throw new Error("Cached image still too large for bridge transfer. Using direct native download.");
                        }
                    } else {
                        throw new Error("Image not cached, using direct download");
                    }
                    
                } catch (cacheError) {
                    console.log("[CoinModal] Cache attempt failed, using direct download:", cacheError.message);
                    
                    // Fallback to direct native download
                    uploadMethod = 'direct';
                    imageUrl = selectedImageUrl;
                    filename = "extracted_image.png";
                    setResponse("🌐 Image not cached, downloading directly in native context...");
                }
                
            } else if (image) {
                // Handle uploaded file
                console.log("[CoinModal] Processing uploaded file...");
                setResponse("📤 Processing uploaded file...");
                
                try {
                    const imageBlob = new Blob([await image.arrayBuffer()], { type: image.type });
                    
                    // Try to optimize if too large
                    const maxSize = 1024 * 1024; // 1MB
                    let processedBlob = imageBlob;
                    
                    if (imageBlob.size > maxSize) {
                        setResponse("🔧 Optimizing large image...");
                        processedBlob = await storageManager.optimizeImageForIPFS(imageBlob, maxSize);
                        setImageOptimized(true);
                        console.log("[CoinModal] Image optimized:", {
                            original: imageBlob.size,
                            optimized: processedBlob.size,
                            reduction: `${(((imageBlob.size - processedBlob.size) / imageBlob.size) * 100).toFixed(1)}%`
                        });
                    }
                    
                    // Convert to data URL
                    const base64 = await blobToBase64(processedBlob);
                    imageUrl = `data:${processedBlob.type};base64,${base64}`;
                    filename = image.name;
                    uploadMethod = 'direct';
                    
                    // Cache for future use
                    const cacheKey = `uploaded_${Date.now()}_${image.name}`;
                    await cacheImageForIPFS(cacheKey, processedBlob, {
                        originalUrl: cacheKey,
                        filename: image.name
                    });
                    
                    // Final size check
                    if (imageUrl.length > 1500000) {
                        throw new Error("Processed image still too large for bridge transfer.");
                    }
                    
                } catch (processingError) {
                    throw new Error(`Failed to process uploaded file: ${processingError.message}`);
                }
                
            } else {
                throw new Error("No image source available");
            }

            // Use integrated working IPFS upload approach
            setResponse("💾 Storing upload data via integrated native context...");

            console.log("[CoinModal] Starting integrated IPFS upload with working method:", {
                method: uploadMethod,
                imageSize: imageUrl.length,
                optimized: imageOptimized,
                filename: filename,
                linkUrl: linkStr,
                linkValid: linkStr !== "https://pumpportal.fun",
                approach: "integrated-working-upload",
                devBuyAmount: buyAmount,
                useCustomAmount: useCustomBuyAmount
            });

            // Record upload attempt
            const uploadStartTime = Date.now();
            
            try {
                // Step 1: Store upload data using working approach
                await reactUploadStorage.storeUploadData(imageUrl, {
                    name: nameStr,
                    symbol: symbolStr,
                    filename: filename,
                    description: descStr,
                    website: linkStr,
                    mint: mint
                });

                setResponse("📡 Processing IPFS upload via integrated native context...");

                // Step 2: Process upload using integrated working method
                console.log("[CoinModal] Calling integrated working IPFS upload:", {
                    approach: "integrated-working-two-step",
                    step1: "storeUploadData completed (Vencord frame + object wrapping handled)",
                    step2: "calling processUpload",
                    imageDataLength: imageUrl.length,
                    isDataUrl: imageUrl.startsWith('data:'),
                    vencordFrameFixApplied: true,
                    integratedWithMainPlugin: true
                });
                
                const result = await processUpload();

                if (result.metadataUri) {
                    // Record successful upload
                    await storageManager.recordUploadAttempt({
                        imageUrl: selectedImageUrl || filename,
                        method: uploadMethod,
                        success: true,
                        metadata: {
                            uploadTime: Date.now() - uploadStartTime,
                            imageSize: imageUrl.length,
                            optimized: imageOptimized,
                            metadataUri: result.metadataUri,
                            linkUsed: linkStr,
                            approach: "integrated-working-upload"
                        }
                    });

                    console.log("[CoinModal] ✅ Integrated IPFS Upload successful! URI:", result.metadataUri);
                    setResponse(`✅ Image uploaded to IPFS successfully!\n💰 Creating token with ${buyAmount} SOL dev buy${useCustomBuyAmount ? ' (custom)' : ' (from settings)'}...`);

                    // Continue with token creation...
                    const requestBody = {
                        action: "create",
                        tokenMetadata: {
                            name: nameStr,
                            symbol: symbolStr,
                            uri: result.metadataUri
                        },
                        mint: mint,
                        denominatedInSol: "true",
                        amount: parseFloat(buyAmount),
                        slippage: 10,
                        priorityFee: 0.0005,
                        pool: "pump"
                    };

                    console.log("[CoinModal] Making token creation request:", requestBody);

                    try {
                        setResponse(`💰 Creating token transaction with ${buyAmount} SOL dev buy...`);
                        
                        const createResponse = await fetch(`https://pumpportal.fun/api/trade?api-key=${selectedWalletObj.apiKey}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            body: JSON.stringify(requestBody)
                        });

                        if (!createResponse.ok) {
                            const errorText = await createResponse.text();
                            console.error("[CoinModal] Token creation failed:", createResponse.status, errorText);
                            throw new Error(`Token creation failed: ${createResponse.status} - ${errorText}`);
                        }

                        const createJson = await createResponse.json();
                        console.log("[CoinModal] Token creation response:", createJson);

                        // Store the created coin in our database
                        const createdCoin: CreatedCoin = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            name: nameStr,
                            symbol: symbolStr,
                            contractAddress: mint, // Will be updated when we get the actual contract address
                            metadataUri: result.metadataUri,
                            transactionSignature: createJson.signature || "",
                            walletId: selectedWallet,
                            status: createJson.signature ? 'pending' : 'failed',
                            createdAt: new Date().toISOString()
                        };

                        await storeCreatedCoin(createdCoin);

                        if (createJson.signature) {
                            const txUrl = `https://solscan.io/tx/${createJson.signature}`;
                            setResponse(`✅ Token created successfully! 🎉

Method: ${uploadMethod} (${imageOptimized ? 'optimized' : 'original'})
IPFS: ${result.metadataUri}
Wallet: ${selectedWalletObj.name}
Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom amount)' : '(from global settings)'}
Transaction:`);
                            
                            // Add clickable transaction link
                            setTimeout(() => {
                                const responseContainer = document.querySelector('.coin-modal-response');
                                if (responseContainer) {
                                    const linkElement = document.createElement('a');
                                    linkElement.href = txUrl;
                                    linkElement.target = '_blank';
                                    linkElement.rel = 'noopener noreferrer';
                                    linkElement.textContent = txUrl;
                                    linkElement.style.cssText = `
                                        color: ${BRAND_COLORS.accent3};
                                        text-decoration: underline;
                                        word-break: break-all;
                                        display: block;
                                        margin-top: 8px;
                                        cursor: pointer;
                                        font-size: 11px;
                                    `;
                                    responseContainer.appendChild(linkElement);
                                    
                                    const copyBtn = document.createElement('button');
                                    copyBtn.textContent = '📋 Copy Link';
                                    copyBtn.style.cssText = `
                                        background: ${BRAND_COLORS.accent3};
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        padding: 4px 8px;
                                        font-size: 10px;
                                        margin-top: 4px;
                                        cursor: pointer;
                                    `;
                                    copyBtn.onclick = () => {
                                        navigator.clipboard.writeText(txUrl);
                                        copyBtn.textContent = '✅ Copied!';
                                        setTimeout(() => copyBtn.textContent = '📋 Copy Link', 2000);
                                    };
                                    responseContainer.appendChild(copyBtn);
                                }
                            }, 100);
                            
                            if (selectedWalletObj?.publicKey) {
                                setTimeout(() => {
                                    loadWalletBalance(selectedWalletObj);
                                }, 2000);
                            }
                            
                        } else {
                            setResponse("✅ Token creation completed!\nResponse: " + JSON.stringify(createJson, null, 2));
                        }

                    } catch (corsError: any) {
                        console.log("[CoinModal] Browser trade request failed:", corsError.message);
                        setResponse(`✅ IPFS upload successful!\n❌ Token creation blocked by CORS\n\n💡 Metadata uploaded successfully to IPFS. You can create the token manually using the URI.\n\nDev Buy Amount: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(from settings)'}`);
                    }

                } else {
                    setResponse(`❌ Upload failed - no metadata URI returned\n\nResponse: ${JSON.stringify(result, null, 2)}`);
                }

            } catch (uploadError: any) {
                // Record failed upload
                await storageManager.recordUploadAttempt({
                    imageUrl: selectedImageUrl || filename,
                    method: uploadMethod,
                    success: false,
                    error: uploadError.message,
                    metadata: {
                        uploadTime: Date.now() - uploadStartTime,
                        imageSize: imageUrl.length,
                        optimized: imageOptimized,
                        linkUsed: linkStr,
                        approach: "integrated-working-upload"
                    }
                });
                
                throw uploadError;
            }

        } catch (e: any) {
            console.error("[CoinModal] Token creation error:", e);
            
            // Enhanced error messages with integrated upload info
            if (e.message && e.message.includes('Invalid URL')) {
                setResponse(`🔗 Invalid URL detected.\n\n💡 Attempted optimizations:\n• Storage check: ${usingCachedImage ? '✅ Found' : '❌ Not cached'}\n• URL validation: ${selectedImageUrl ? 'Failed' : 'N/A'}\n• Link validation: ${linkStr !== "https://pumpportal.fun" ? '✅ Valid' : '❌ Fallback used'}\n• Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(settings)'}\n\n🔧 Try a different image or use direct upload.`);
            } else if (e.message && e.message.includes('large for bridge transfer')) {
                setResponse(`📏 Image too large for transfer.\n\n💡 Optimization attempted:\n• Original optimization: ${imageOptimized ? '✅ Applied' : '❌ Not needed'}\n• Final size: ${imageUrl ? (imageUrl.length / 1024).toFixed(1) + 'KB' : 'Unknown'}\n• Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(settings)'}\n\n🔧 Try a smaller image or different format.`);
            } else if (e.message && e.message.includes('Native plugin helpers not available')) {
                setResponse(`🔧 Plugin not loaded properly.\n\n💡 Available features:\n• IndexedDB: ${typeof indexedDB !== 'undefined' ? '✅ Available' : '❌ Missing'}\n• Cache API: ${typeof caches !== 'undefined' ? '✅ Available' : '❌ Missing'}\n• Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(settings)'}\n\n📝 Restart Discord/Vencord and try again.`);
            } else if (e.message && e.message.includes('select a wallet')) {
                setResponse(`🔑 Wallet Selection Required.\n\n💡 Current state:\n• Wallets available: ${wallets.length}\n• Default wallet: ${selectedWalletObj?.name || 'None set'}\n• API key ready: ${selectedWalletObj?.apiKey ? 'Yes' : 'No'}\n• Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(settings)'}\n\n🔧 Please select a wallet with an API key.`);
            } else {
                setResponse(`❌ Error: ${e.message}\n\n🔧 Attempted approach:\n• Method: ${uploadMethod}\n• Cached: ${usingCachedImage ? 'Yes' : 'No'}\n• Optimized: ${imageOptimized ? 'Yes' : 'No'}\n• Link valid: ${linkStr !== "https://pumpportal.fun" ? 'Yes' : 'No'}\n• Wallet: ${selectedWalletObj?.name || 'None'}\n• Dev Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(custom)' : '(settings)'}\n\n📝 Check console for detailed logs.`);
            }
            
            console.log("[CoinModal] Detailed error info:", {
                error: e,
                stack: e.stack,
                message: e.message,
                timestamp: new Date().toISOString(),
                approach: "integrated-working-ipfs-upload",
                method: uploadMethod,
                cached: usingCachedImage,
                optimized: imageOptimized,
                wallet: selectedWalletObj?.name,
                devBuyAmount: buyAmount,
                useCustomAmount: useCustomBuyAmount,
                urlValidation: {
                    raw: props.extractedLink,
                    validated: linkStr,
                    isValid: linkStr !== "https://pumpportal.fun"
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get base64 from blob
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                if (!result || !result.includes(',')) {
                    reject(new Error("FileReader returned invalid result"));
                    return;
                }
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = () => reject(new Error("FileReader failed"));
            reader.readAsDataURL(blob);
        });
    };

    const inputStyle = {
        backgroundColor: "#44403C",
        border: `1px solid ${BRAND_COLORS.primaryDark}`,
        borderRadius: "6px",
        padding: "8px 10px",
        color: BRAND_COLORS.primary,
        fontSize: "13px",
        width: "300px",
        maxWidth: "100%"
    };

    const labelStyle = {
        color: BRAND_COLORS.primary,
        fontSize: "13px",
        fontWeight: "600",
        marginBottom: "6px",
        display: "block"
    };

    return (
        <ModalRoot {...props}>
            <style>{`
                input::placeholder, textarea::placeholder {
                    color: #A0AEC0 !important;
                    opacity: 0.7;
                }
                input:disabled::placeholder {
                    color: #718096 !important;
                    opacity: 0.5;
                }
                .quick-amount-button {
                    transition: all 0.2s ease;
                    transform: scale(1);
                }
                .quick-amount-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                .quick-amount-button:active {
                    transform: scale(0.95);
                }
            `}</style>
            <ModalHeader>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    width: "100%",
                    padding: "12px 0"
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

            <ModalContent style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-start" }}>
                    
                    {/* Wallet Selection */}
                    <div style={{ width: "100%" }}>
                        <label style={labelStyle}>Wallet Selection</label>
                        
                        <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            style={{
                                ...inputStyle,
                                marginBottom: "12px",
                                outline: "none",
                                width: "320px"
                            }}
                        >
                            <option value="">-- Select a wallet --</option>
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.name} {wallet.publicKey ? `(${formatAddress(wallet.publicKey)})` : '(No Public Key)'}
                                </option>
                            ))}
                        </select>

                    {/* Display selected wallet details */}
                    {selectedWallet && selectedWalletObj && (
                        <div style={{
                            backgroundColor: BRAND_COLORS.primaryDark,
                            padding: "12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: BRAND_COLORS.text
                        }}>
                            <div style={{ marginBottom: "8px" }}>
                                <span style={{ color: BRAND_COLORS.text, fontWeight: "600" }}>
                                    Wallet: {selectedWalletObj.name}
                                </span>
                            </div>
                            
                            <div style={{ marginBottom: "8px" }}>
                                <span style={{ color: BRAND_COLORS.textMuted }}>API Key: </span>
                                <span style={{ color: selectedWalletObj.apiKey ? BRAND_COLORS.success : BRAND_COLORS.danger }}>
                                    {selectedWalletObj.apiKey ? "✅ Available" : "❌ Missing"}
                                </span>
                            </div>
                            
                            {selectedWalletObj.publicKey && (
                                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ color: BRAND_COLORS.textMuted }}>Public Key:</span>
                                    <code style={{
                                        backgroundColor: BRAND_COLORS.primary,
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "10px",
                                        color: BRAND_COLORS.text
                                    }}>
                                        {formatAddress(selectedWalletObj.publicKey)}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(selectedWalletObj.publicKey!)}
                                        style={{
                                            background: BRAND_COLORS.accent3,
                                            color: "white",
                                            border: "none",
                                            borderRadius: "3px",
                                            padding: "2px 6px",
                                            fontSize: "9px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}

                            {selectedWalletObj.publicKey && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ color: BRAND_COLORS.textMuted }}>Balance:</span>
                                    {loadingBalances[selectedWalletObj.id] ? (
                                        <span style={{ color: BRAND_COLORS.textMuted }}>Loading...</span>
                                    ) : (
                                        <span style={{ 
                                            color: BRAND_COLORS.text, 
                                            fontWeight: "600",
                                            fontFamily: "monospace"
                                        }}>
                                            {walletBalances[selectedWalletObj.id]?.toFixed(4) ?? "0.0000"} SOL
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                        {wallets.length === 0 && (
                            <div style={{
                                backgroundColor: BRAND_COLORS.warning + "20",
                                color: BRAND_COLORS.warning,
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                border: `1px solid ${BRAND_COLORS.warning}`,
                                width: "fit-content"
                            }}>
                                💡 No wallets found. Use the Wallet Manager to generate wallets first!
                            </div>
                        )}
                    </div>

                    {/* Enhanced Image Selection */}
                    <div>
                        <label style={labelStyle}>Choose Image (Enhanced with IPFS Upload)</label>
                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            marginBottom: "16px",
                            flexWrap: "wrap"
                        }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "12px",
                                border: `2px dashed ${BRAND_COLORS.accent2}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                backgroundColor: BRAND_COLORS.primaryDark,
                                position: "relative",
                                overflow: "hidden"
                            }} onClick={() => document.getElementById('imageInput')?.click()}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px"
                                    }} />
                                ) : (
                                    <span style={{
                                        fontSize: "32px",
                                        color: BRAND_COLORS.textMuted,
                                        userSelect: "none"
                                    }}>+</span>
                                )}
                                {usingCachedImage && (
                                    <div style={{
                                        position: "absolute",
                                        top: "2px",
                                        right: "2px",
                                        background: BRAND_COLORS.success,
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "16px",
                                        height: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px"
                                    }}>
                                        💾
                                    </div>
                                )}
                            </div>
                            <input 
                                id="imageInput"
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                            <div>
                                <Text style={{ color: BRAND_COLORS.primary, fontSize: "14px", fontWeight: "500" }}>
                                    Upload image {usingCachedImage && "(💾 Cached)"} - Enhanced IPFS
                                </Text>
                                <Text style={{ color: BRAND_COLORS.textMuted, fontSize: "12px" }}>
                                    PNG, JPG up to 5MB (auto-optimized)
                                </Text>
                                {image && (
                                    <div style={{
                                        fontSize: "10px",
                                        color: image.size > 5 * 1024 * 1024 ? BRAND_COLORS.danger : BRAND_COLORS.success,
                                        marginTop: "2px"
                                    }}>
                                        {image.size > 5 * 1024 * 1024 ? "❌ Too large!" : `✅ ${(image.size / 1024).toFixed(1)}KB ${image.size > 1024*1024 ? '(will optimize)' : ''}`}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {props.extractedImages && props.extractedImages.length > 0 && (
                            <div style={{ marginTop: "12px" }}>
                                <Text style={{ 
                                    color: BRAND_COLORS.primary,
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    marginBottom: "6px",
                                    display: "block"
                                }}>
                                    Or select from message (cached for faster uploads):
                                </Text>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {props.extractedImages.slice(0, 4).map((imageUrl: string, index: number) => (
                                        <div key={index} style={{ position: "relative" }}>
                                            <img
                                                src={imageUrl}
                                                alt={`Extracted ${index + 1}`}
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    borderRadius: "8px",
                                                    border: selectedImageUrl === imageUrl ? `2px solid ${BRAND_COLORS.accent3}` : "2px solid transparent",
                                                    cursor: "pointer",
                                                    objectFit: "cover",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onClick={() => selectExtractedImage(imageUrl)}
                                            />
                                            {/* Show cache indicator */}
                                            <div style={{
                                                position: "absolute",
                                                top: "2px",
                                                right: "2px",
                                                background: "rgba(0,0,0,0.7)",
                                                color: "white",
                                                borderRadius: "50%",
                                                width: "14px",
                                                height: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "8px"
                                            }}>
                                                {selectedImageUrl === imageUrl && usingCachedImage ? '💾' : '🌐'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div>
                        <label style={labelStyle}>Coin Name</label>
                        <input 
                            type="text"
                            value={coinName} 
                            onChange={(e) => setCoinName(e.target.value)} 
                            placeholder="e.g. LaunchToken"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Symbol</label>
                        <input 
                            type="text"
                            value={symbol} 
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                            placeholder="e.g. LAUNCH"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Optional..."
                            style={{
                                ...inputStyle,
                                height: "60px",
                                width: "350px",
                                resize: "vertical",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Website</label>
                        <input 
                            type="text"
                            value={props.extractedLink || ""}
                            disabled
                            style={{
                                ...inputStyle,
                                opacity: 0.6,
                                cursor: "not-allowed",
                                backgroundColor: "#2D2A27"
                            }}
                        />
                        <Text style={{ 
                            color: BRAND_COLORS.textMuted, 
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block"
                        }}>
                            Auto-detected from message content 
                            {props.extractedLink && validateUrl(props.extractedLink) !== "https://pumpportal.fun" ? 
                                " ✅ Valid" : " ⚠️ Using fallback"}
                        </Text>
                    </div>

                    {/* NEW: Enhanced Dev Buy Amount with Settings Integration */}
                    <div style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <label style={labelStyle}>💰 Dev Buy Amount (SOL)</label>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{
                                    fontSize: "10px",
                                    color: useCustomBuyAmount ? BRAND_COLORS.warning : BRAND_COLORS.success,
                                    backgroundColor: (useCustomBuyAmount ? BRAND_COLORS.warning : BRAND_COLORS.success) + "20",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontWeight: "600"
                                }}>
                                    {useCustomBuyAmount ? "CUSTOM" : "FROM SETTINGS"}
                                </span>
                                <button
                                    onClick={() => {
                                        setUseCustomBuyAmount(false);
                                        setBuyAmount(globalSettings.devBuyAmount || "0.1");
                                    }}
                                    style={{
                                        backgroundColor: BRAND_COLORS.accent3,
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "10px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                    title="Reset to global settings value"
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: "8px" }}>
                            <input 
                                type="number"
                                value={buyAmount} 
                                onChange={(e) => {
                                    setBuyAmount(e.target.value);
                                    setUseCustomBuyAmount(true);
                                }}
                                placeholder="0.1"
                                min="0.01"
                                max="10"
                                step="0.01"
                                style={{
                                    ...inputStyle,
                                    borderColor: useCustomBuyAmount ? BRAND_COLORS.warning : BRAND_COLORS.primaryDark
                                }}
                            />
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(4, 1fr)", 
                            gap: "8px",
                            marginBottom: "8px"
                        }}>
                            {["0.01", "0.05", "0.1", "0.2", "0.5", "1.0"].slice(0, 4).map(amount => (
                                <button
                                    key={amount}
                                    className="quick-amount-button"
                                    onClick={() => handleQuickBuyAmount(amount)}
                                    style={{
                                        backgroundColor: buyAmount === amount ? BRAND_COLORS.accent2 : BRAND_COLORS.charcoal,
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 4px",
                                        fontSize: "11px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "2px"
                                    }}
                                >
                                    <span>{amount}</span>
                                    <span style={{ fontSize: "8px", opacity: 0.8 }}>SOL</span>
                                </button>
                            ))}
                        </div>
                        
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(2, 1fr)", 
                            gap: "8px",
                            marginBottom: "8px"
                        }}>
                            {["0.5", "1.0"].map(amount => (
                                <button
                                    key={amount}
                                    className="quick-amount-button"
                                    onClick={() => handleQuickBuyAmount(amount)}
                                    style={{
                                        backgroundColor: buyAmount === amount ? BRAND_COLORS.accent2 : BRAND_COLORS.charcoal,
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 4px",
                                        fontSize: "11px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "2px"
                                    }}
                                >
                                    <span>{amount}</span>
                                    <span style={{ fontSize: "8px", opacity: 0.8 }}>SOL</span>
                                </button>
                            ))}
                        </div>
                        
                        <Text style={{ 
                            fontSize: "11px", 
                            color: BRAND_COLORS.textMuted 
                        }}>
                            {useCustomBuyAmount ? (
                                <>Custom amount (overrides global setting of {globalSettings.devBuyAmount || "0.1"} SOL)</>
                            ) : (
                                <>Using global setting from ⚙️ Settings ({globalSettings.devBuyAmount || "0.1"} SOL)</>
                            )}
                            <br />
                            SOL to buy your own token immediately after creation
                        </Text>
                        
                        {/* Show current wallet balance for reference */}
                        {selectedWalletObj?.id && walletBalances[selectedWalletObj.id] !== undefined && (
                            <div style={{
                                fontSize: "10px",
                                color: parseFloat(buyAmount) > walletBalances[selectedWalletObj.id] ? BRAND_COLORS.danger : BRAND_COLORS.textMuted,
                                marginTop: "4px",
                                padding: "4px 8px",
                                backgroundColor: parseFloat(buyAmount) > walletBalances[selectedWalletObj.id] ? BRAND_COLORS.danger + "10" : BRAND_COLORS.primaryDark,
                                borderRadius: "4px"
                            }}>
                                {parseFloat(buyAmount) > walletBalances[selectedWalletObj.id] ? "⚠️ " : "💼 "}
                                Wallet balance: {walletBalances[selectedWalletObj.id].toFixed(4)} SOL
                                {parseFloat(buyAmount) > walletBalances[selectedWalletObj.id] && " (Insufficient funds!)"}
                            </div>
                        )}
                    </div>

                    {/* Storage Management Controls */}
                    <div style={{ width: "100%", marginTop: "12px" }}>
                        <label style={labelStyle}>Storage Management</label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                                onClick={async () => {
                                    await storageManager.clearImageCache();
                                    alert("Image cache cleared!");
                                    const info = await storageManager.getStorageInfo();
                                    setStorageInfo(info);
                                }}
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
                                🗑️ Clear Cache
                            </button>
                            
                            <button
                                onClick={async () => {
                                    const info = await storageManager.getStorageInfo();
                                    alert(`Storage: ${info?.usage} used (${info?.usagePercent})\nCached images: ${info?.breakdown?.cachedImages}\nUpload history: ${info?.breakdown?.uploadHistory}`);
                                }}
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
                                📊 Storage Info
                            </button>
                            
                            <button
                                onClick={async () => {
                                    const history = await storageManager.getUploadHistory(5);
                                    const summary = history.map(h => `${h.success ? '✅' : '❌'} ${h.method} - ${new Date(h.timestamp).toLocaleString()}`).join('\n');
                                    alert(`Recent Uploads:\n${summary || 'No uploads yet'}`);
                                }}
                                style={{
                                    background: BRAND_COLORS.charcoal,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    cursor: "pointer"
                                }}
                            >
                                📈 Upload History
                            </button>
                        </div>
                    </div>
                </div>

                {response && (
                    <div 
                        className="coin-modal-response"
                        style={{
                            marginTop: "16px",
                            padding: "12px",
                            backgroundColor: response.includes("✅") 
                                ? BRAND_COLORS.success + "20"
                                : BRAND_COLORS.danger + "20",
                            border: `1px solid ${response.includes("✅") 
                                ? BRAND_COLORS.success
                                : BRAND_COLORS.danger}`,
                            borderRadius: "8px",
                            fontSize: "12px"
                        }}
                    >
                        <Text style={{ 
                            color: response.includes("✅") 
                                ? BRAND_COLORS.success
                                : BRAND_COLORS.danger
                        }}>
                            {response}
                        </Text>
                    </div>
                )}
            </ModalContent>

            <ModalFooter style={{ padding: "20px 24px", paddingTop: "0" }}>
                <button
                    onClick={submit}
                    disabled={loading || !coinName || !symbol || (!image && !selectedImageUrl) || !selectedWalletObj?.apiKey}
                    style={{
                        backgroundColor: loading || !coinName || !symbol || (!image && !selectedImageUrl) || !selectedWalletObj?.apiKey ? "#666" : BRAND_COLORS.accent3,
                        color: loading || !coinName || !symbol || (!image && !selectedImageUrl) || !selectedWalletObj?.apiKey ? "#ccc" : "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                        padding: "14px 24px",
                        borderRadius: "12px",
                        border: "none",
                        width: "100%",
                        cursor: loading || !coinName || !symbol || (!image && !selectedImageUrl) || !selectedWalletObj?.apiKey ? "not-allowed" : "pointer",
                        opacity: loading || !coinName || !symbol || (!image && !selectedImageUrl) || !selectedWalletObj?.apiKey ? 0.7 : 1,
                        transition: "all 0.2s ease"
                    }}
                >
                    {loading ? "Creating Token..." : `Create Coin ${usingCachedImage ? '(💾 Cached)' : ''} - Buy: ${buyAmount} SOL ${useCustomBuyAmount ? '(Custom)' : '(Settings)'} - Wallet: ${selectedWalletObj?.name || 'Select Wallet'}`}
                </button>
                <Button
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.LINK}
                    onClick={props.onClose}
                    style={{ marginTop: "12px", color: BRAND_COLORS.textMuted }}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}