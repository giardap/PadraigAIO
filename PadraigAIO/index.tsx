/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openModal } from "@utils/modal";
import definePlugin, { PluginAuthor } from "@utils/types";
import { React, ReactDOM } from "@webpack/common";

import { addressDetector } from "./addressUtils";
import { BuySellModal } from "./BuySellModal";
import { CoinModal } from "./CoinModal";
import { LivePriceSidebar } from "./LivePriceSidebar";
import { PortfolioCommandCenter } from "./PortfolioCommandCenter";
import { StandaloneTradingSettingsModal } from "./StandaloneTradingSettingsModal";
import { storageManager } from "./storageHelper";
import { ToastContainer } from "./ToastManager";
import { WalletModal } from "./WalletModal";
import { WelcomePopup } from "./WelcomePopup";
import { SniperStatusIndicator } from "./TokenSniper";
import { SniperModal } from "./SniperModal";

// Padraig Branding Variables
// Padraig Branding Variables
const PADRAIG_LOGO_BASE64 = "data:image/png;base64,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";

const BRAND_COLORS = {
    primary: "#1B2951", // Midnight blue base
    primaryDark: "#0F1B2E", // Darker midnight blue
    accent1: "#E53E3E", // Red accent
    accent2: "#FBB040", // Yellow/Orange accent
    accent3: "#38B2AC", // Teal accent
    charcoal: "#4A5568", // Charcoal grey
    success: "#38B2AC", // Teal for success states
    warning: "#FBB040", // Orange for warning states
    danger: "#E53E3E", // Red for danger states
    text: "#2D3748", // Dark text
    textMuted: "#718096" // Muted text
};

// Global debug settings
let debugInfoEnabled = true;

// Load debug setting from localStorage
try {
    const savedDebugSetting = localStorage.getItem("padraig-debug-enabled");
    if (savedDebugSetting !== null) {
        debugInfoEnabled = JSON.parse(savedDebugSetting);
    }
} catch (error) {
    console.warn("[PumpPortalPlugin] Failed to load debug setting:", error);
}

// Theme configuration - stored in localStorage
const THEME_STORAGE_KEY = "padraig-theme-config";

const getThemeConfig = () => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            toolbarButtonColor: BRAND_COLORS.primary,
            toolbarButtonHoverColor: BRAND_COLORS.primaryDark,
            accentColor: BRAND_COLORS.accent1,
            enableCustomColors: true
        };
    } catch {
        return {
            toolbarButtonColor: BRAND_COLORS.primary,
            toolbarButtonHoverColor: BRAND_COLORS.primaryDark,
            accentColor: BRAND_COLORS.accent1,
            enableCustomColors: true
        };
    }
};

const saveThemeConfig = (config: any) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
};

export default definePlugin({
    name: "CreateCoinFromTweet",
    description: "PadraigAIO",
    authors: [{ name: "Padraig" } as PluginAuthor],

    start() {
        console.log("[PumpPortalPlugin] Starting enhanced unified plugin by Padraig (@PadraigTools)...");

        // Apply original colors (remove any custom styling)
        this.updateColors();

        // Show welcome popup on first launch
        this.showWelcomeIfFirstTime();

        // Initialize storage system
        this.initializeStorage();

        // Add persistent buttons to Discord interface
        const addPersistentButtons = () => {
            // Remove existing buttons if they exist
            document.querySelectorAll(".pump-persistent-button, .padraig-branding").forEach(el => el.remove());

            // Find a good place to add the buttons
            const containers = [
                document.querySelector('[class*="toolbar"]'),
                document.querySelector('[class*="titleBar"]'),
                document.querySelector('[class*="headerBar"]'),
                document.querySelector("header"),
                document.querySelector('[class*="channelHeader"]'),
                document.querySelector('[class*="children"]:not([class*="message"])')
            ].filter(Boolean);

            if (containers.length > 0) {
                const container = containers[0];
                if (!container) return;

                // Create enhanced branding container
                const brandingContainer = document.createElement("div");
                brandingContainer.className = "padraig-branding";
                brandingContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 4px;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryDark});
                    border-radius: 8px;
                    border: 1px solid ${BRAND_COLORS.accent2};
                    z-index: 1000;
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                // Add logo if available
                if (PADRAIG_LOGO_BASE64) {
                    const logo = document.createElement("img");
                    logo.src = PADRAIG_LOGO_BASE64;
                    logo.alt = "Padraig Logo";
                    logo.style.cssText = `
                        width: 24px;
                        height: 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    `;
                    
                    // Add hover effects
                    logo.onmouseenter = () => {
                        logo.style.transform = "scale(1.1)";
                        logo.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                    };
                    
                    logo.onmouseleave = () => {
                        logo.style.transform = "scale(1)";
                        logo.style.boxShadow = "none";
                    };
                    
                    // Add click handler to open Portfolio Command Center
                    logo.onclick = () => {
                        openModal((props: any) => React.createElement(PortfolioCommandCenter, {
                            ...props,
                            debugInfoEnabled
                        }));
                    };
                    
                    brandingContainer.appendChild(logo);
                }


                // Add storage status indicator

                // Create button container
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "pump-persistent-button pump-button-container";
                buttonContainer.style.cssText = `
                    display: flex;
                    gap: 8px;
                    margin-left: 8px;
                `;

                // Enhanced Wallet Manager Button
                const walletBtn = document.createElement("button");
                walletBtn.className = "pump-persistent-button";
                walletBtn.textContent = "💼 Wallets";
                walletBtn.style.cssText = `
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd);
                    color: #fff;
                    border: 2px solid ${BRAND_COLORS.success};
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                walletBtn.addEventListener("mouseenter", () => {
                    walletBtn.style.transform = "translateY(-1px)";
                    walletBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    walletBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}ee, ${BRAND_COLORS.primary}cc)`;
                });

                walletBtn.addEventListener("mouseleave", () => {
                    walletBtn.style.transform = "translateY(0)";
                    walletBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    walletBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd)`;
                });

                walletBtn.onclick = () => {
                    openModal((props: any) => React.createElement(WalletModal, {
                        ...props,
                        debugInfoEnabled
                    }));
                };

                // Enhanced Create Coin Button
                const coinBtn = document.createElement("button");
                coinBtn.className = "pump-persistent-button";
                coinBtn.textContent = "🚀Create";
                coinBtn.style.cssText = `
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd);
                    color: #fff;
                    border: 2px solid ${BRAND_COLORS.accent2};
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                coinBtn.addEventListener("mouseenter", () => {
                    coinBtn.style.transform = "translateY(-1px)";
                    coinBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    coinBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}ee, ${BRAND_COLORS.primary}cc)`;
                });

                coinBtn.addEventListener("mouseleave", () => {
                    coinBtn.style.transform = "translateY(0)";
                    coinBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    coinBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd)`;
                });

                coinBtn.onclick = async () => {
                    const extractedData = await this.extractMessageData();

                    openModal((props: any) => React.createElement(CoinModal, {
                        ...props,
                        ...extractedData,
                        debugInfoEnabled
                    }));
                };

                // Enhanced Buy/Sell Button
                const tradeBtn = document.createElement("button");
                tradeBtn.className = "pump-persistent-button";
                tradeBtn.textContent = "📊Trade";
                tradeBtn.style.cssText = `
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd);
                    color: #fff;
                    border: 2px solid #9F7AEA;
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                tradeBtn.addEventListener("mouseenter", () => {
                    tradeBtn.style.transform = "translateY(-1px)";
                    tradeBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    tradeBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}ee, ${BRAND_COLORS.primary}cc)`;
                });

                tradeBtn.addEventListener("mouseleave", () => {
                    tradeBtn.style.transform = "translateY(0)";
                    tradeBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    tradeBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd)`;
                });

                tradeBtn.onclick = () => {
                    openModal((props: any) => React.createElement(BuySellModal, {
                        ...props,
                        debugInfoEnabled
                    }));
                };

                // Simple Global Trading Settings Button
                const settingsBtn = document.createElement("button");
                settingsBtn.className = "pump-persistent-button";
                settingsBtn.textContent = "⚙️";
                settingsBtn.style.cssText = `
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd);
                    color: #fff;
                    border: 2px solid ${BRAND_COLORS.accent1};
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;

                settingsBtn.addEventListener("mouseenter", () => {
                    settingsBtn.style.transform = "translateY(-1px)";
                    settingsBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    settingsBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}ee, ${BRAND_COLORS.primary}cc)`;
                });

                settingsBtn.addEventListener("mouseleave", () => {
                    settingsBtn.style.transform = "translateY(0)";
                    settingsBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    settingsBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd)`;
                });

                // Simple settings modal opening - just like the other buttons
                settingsBtn.onclick = () => {
                    openModal((props: any) => React.createElement(StandaloneTradingSettingsModal, props));
                };

                // Sniper Button
                const sniperBtn = document.createElement("button");
                sniperBtn.className = "pump-persistent-button";
                sniperBtn.textContent = "🎯Sniper";
                sniperBtn.style.cssText = `
                    background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd);
                    color: white;
                    border: 2px solid ${BRAND_COLORS.accent3};
                    border-radius: 6px;
                    padding: 6px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                    margin-right: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                `;

                sniperBtn.addEventListener("mouseenter", () => {
                    sniperBtn.style.transform = "translateY(-1px)";
                    sniperBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                    sniperBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}ee, ${BRAND_COLORS.primary}cc)`;
                });

                sniperBtn.addEventListener("mouseleave", () => {
                    sniperBtn.style.transform = "translateY(0)";
                    sniperBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    sniperBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primary}dd)`;
                });

                sniperBtn.onclick = () => {
                    openModal((props: any) => React.createElement(SniperModal, props));
                };

                buttonContainer.appendChild(walletBtn);
                buttonContainer.appendChild(coinBtn);
                buttonContainer.appendChild(tradeBtn);
                buttonContainer.appendChild(settingsBtn);
                buttonContainer.appendChild(sniperBtn);
                brandingContainer.appendChild(buttonContainer);
                container.appendChild(brandingContainer);

                console.log("[PumpPortalPlugin] Enhanced branded toolbar added");
            } else {
                console.log("[PumpPortalPlugin] Could not find container for toolbar");
            }
        };

        // Add buttons immediately
        addPersistentButtons();

        // Mount ToastContainer
        this.mountToastContainer();

        // Mount LivePriceSidebar - DISABLED
        // this.mountLivePriceSidebar();

        // Mount Sniper Status
        this.mountSniperStatus();

        // Enhanced message observer with caching and CA detection
        const messageObserver = new MutationObserver(mutations => {
            // Re-add persistent buttons if they disappear
            if (!document.querySelector(".pump-persistent-button")) {
                addPersistentButtons();
            }

            // Re-mount components if they disappear
            if (!document.getElementById("padraig-toast-container")) {
                this.mountToastContainer();
            }
            // LivePriceSidebar mounting disabled
            // if (!document.getElementById("padraig-price-sidebar")) {
            //     this.mountLivePriceSidebar();
            // }
            if (!document.getElementById("padraig-sniper-status")) {
                this.mountSniperStatus();
            }

            // Enhanced inline button processing with CA detection
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    const contentDivs = node.querySelectorAll("div[class*='messageContent_'], div[class*='markup_']");
                    contentDivs.forEach(content => {
                        this.processMessageContent(content as HTMLElement);
                    });
                }
            }
        });

        messageObserver.observe(document.body, { childList: true, subtree: true });
        this._cleanup = () => messageObserver.disconnect();
    },

    // Show welcome popup every time Discord starts
    async showWelcomeIfFirstTime() {
        try {
            console.log("[PumpPortalPlugin] Showing welcome popup on startup");

            // Wait a moment for Discord to fully load
            setTimeout(() => {
                openModal((props: any) => React.createElement(WelcomePopup, {
                    ...props,
                    onClose: () => {
                        console.log("[PumpPortalPlugin] Welcome popup closed");
                        props.onClose?.();
                    }
                }));
            }, 2000); // 2 second delay to let Discord load

            console.log("[PumpPortalPlugin] Welcome popup scheduled");
        } catch (error) {
            console.error("[PumpPortalPlugin] Error showing welcome popup:", error);
        }
    },

    // Initialize enhanced storage system
    async initializeStorage() {
        try {
            console.log("[PumpPortalPlugin] Initializing enhanced storage...");

            // Test storage capabilities
            const capabilities = {
                indexedDB: typeof indexedDB !== "undefined",
                cacheAPI: typeof caches !== "undefined",
                storageEstimate: typeof navigator.storage !== "undefined"
            };

            console.log("[PumpPortalPlugin] Storage capabilities:", capabilities);

            if (!capabilities.indexedDB) {
                console.warn("[PumpPortalPlugin] IndexedDB not available - wallet persistence may be limited");
            }

            if (!capabilities.cacheAPI) {
                console.warn("[PumpPortalPlugin] Cache API not available - image caching disabled");
            }

            // Initialize storage and get info
            const info = await storageManager.getStorageInfo();
            console.log("[PumpPortalPlugin] Storage initialized:", info);

            // Clean up old data if needed
            await storageManager.clearOldUploads();

        } catch (error) {
            console.error("[PumpPortalPlugin] Storage initialization failed:", error);
        }
    },

    // Mount ToastContainer to DOM
    mountToastContainer() {
        try {
            console.log("[PumpPortalPlugin] Mounting ToastContainer...");

            // Remove existing toast container if it exists
            const existingToastContainer = document.getElementById("padraig-toast-container");
            if (existingToastContainer) {
                existingToastContainer.remove();
            }

            // Create container for ToastContainer
            const toastContainerDiv = document.createElement("div");
            toastContainerDiv.id = "padraig-toast-container";
            toastContainerDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;

            // Mount ToastContainer React component
            const ToastContainerElement = React.createElement(ToastContainer, {});

            // Add to DOM
            document.body.appendChild(toastContainerDiv);

            // Use createRoot (React 18+)
            try {
                const root = (ReactDOM as any).createRoot(toastContainerDiv);
                root.render(ToastContainerElement);
                this._toastRoot = root;
            } catch (error) {
                console.error("[PumpPortalPlugin] Error creating React root for ToastContainer:", error);
            }

            console.log("[PumpPortalPlugin] ToastContainer mounted successfully");
        } catch (error) {
            console.error("[PumpPortalPlugin] Error mounting ToastContainer:", error);
        }
    },

    // Mount LivePriceSidebar to DOM
    mountLivePriceSidebar() {
        try {
            console.log("[PumpPortalPlugin] Mounting LivePriceSidebar...");

            // Remove existing sidebar if it exists
            const existingSidebar = document.getElementById("padraig-price-sidebar");
            if (existingSidebar) {
                existingSidebar.remove();
            }

            // Create container for LivePriceSidebar
            const sidebarContainerDiv = document.createElement("div");
            sidebarContainerDiv.id = "padraig-price-sidebar";
            sidebarContainerDiv.style.cssText = `
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                z-index: 9999;
                transition: transform 0.3s ease;
            `;

            // State management for sidebar visibility
            let isVisible = false;

            // Mount LivePriceSidebar React component with state management
            const LivePriceSidebarElement = React.createElement(LivePriceSidebar, {
                isVisible: isVisible,
                onToggle: () => {
                    isVisible = !isVisible;
                    sidebarContainerDiv.style.transform = isVisible
                        ? "translateY(-50%) translateX(0)"
                        : "translateY(-50%) translateX(calc(100% - 40px))";
                }
            });

            // Add to DOM
            document.body.appendChild(sidebarContainerDiv);

            // Use createRoot (React 18+)
            try {
                const root = (ReactDOM as any).createRoot(sidebarContainerDiv);
                root.render(LivePriceSidebarElement);
                this._sidebarRoot = root;
            } catch (error) {
                console.error("[PumpPortalPlugin] Error creating React root for LivePriceSidebar:", error);
            }

            // Add toggle button to existing UI
            this.addLivePriceSidebarToggle(() => {
                isVisible = !isVisible;
                const newElement = React.createElement(LivePriceSidebar, {
                    isVisible: isVisible,
                    onToggle: () => {
                        isVisible = !isVisible;
                        sidebarContainerDiv.style.transform = isVisible
                            ? "translateY(-50%) translateX(0)"
                            : "translateY(-50%) translateX(calc(100% - 40px))";
                    }
                });

                if (this._sidebarRoot) {
                    this._sidebarRoot.render(newElement);
                } else {
                    try {
                        const root = (ReactDOM as any).createRoot(sidebarContainerDiv);
                        root.render(newElement);
                        this._sidebarRoot = root;
                    } catch (error) {
                        console.error("[PumpPortalPlugin] Error creating React root in toggle:", error);
                    }
                }
            });

            console.log("[PumpPortalPlugin] LivePriceSidebar mounted successfully");
        } catch (error) {
            console.error("[PumpPortalPlugin] Error mounting LivePriceSidebar:", error);
        }
    },

    // Mount Sniper Status Indicator
    mountSniperStatus() {
        try {
            console.log("[PumpPortalPlugin] Mounting Sniper Status...");

            // Remove existing sniper status if it exists
            const existingStatus = document.getElementById("padraig-sniper-status");
            if (existingStatus) {
                existingStatus.remove();
            }

            // Create container for sniper status
            const statusContainerDiv = document.createElement("div");
            statusContainerDiv.id = "padraig-sniper-status";
            statusContainerDiv.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9998;
                transition: all 0.3s ease;
            `;

            // Mount SniperStatusIndicator React component
            const SniperStatusElement = React.createElement(SniperStatusIndicator, {});

            // Add to DOM
            document.body.appendChild(statusContainerDiv);

            // Use createRoot (React 18+)
            try {
                const root = (ReactDOM as any).createRoot(statusContainerDiv);
                root.render(SniperStatusElement);
                this._sniperStatusRoot = root;
            } catch (error) {
                console.error("[PumpPortalPlugin] Error creating React root for SniperStatus:", error);
            }

            console.log("[PumpPortalPlugin] SniperStatus mounted successfully");
        } catch (error) {
            console.error("[PumpPortalPlugin] Error mounting SniperStatus:", error);
        }
    },

    // Enhanced function to detect valid Solana contract addresses with improved accuracy
    detectSolanaContractAddresses(text: string, maxResults: number = 10): string[] {
        const addressScores = addressDetector.detectSolanaContractAddresses(text, maxResults);

        // Return just the addresses, sorted by score
        return addressScores.map(scoreObj => scoreObj.address);
    },

    // Enhanced Solana contract address validation using new utility
    isValidSolanaAddress(address: string): boolean {
        return addressDetector.isValidSolanaAddress(address);
    },

    // Clean message text for address detection by removing Discord UI elements
    cleanMessageTextForAddressDetection(messageContainer: Element, rawText: string): string {
        try {
            // Get the actual message content, excluding Discord UI elements
            const messageContentElements = messageContainer.querySelectorAll('[class*="messageContent"]');

            let cleanText = "";

            if (messageContentElements.length > 0) {
                // Extract text from message content only
                cleanText = messageContentElements[0].textContent || "";
            } else {
                // Fallback to raw text if we can't find message content
                cleanText = rawText;
            }

            // Remove common Discord UI elements that could interfere with address detection
            cleanText = cleanText
                // Remove timestamps (e.g., "Today at 3:45 PM", "Yesterday at 11:30 AM")
                .replace(/\b(?:Today|Yesterday|\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b/gi, "")
                // Remove standalone time stamps (e.g., "3:45 PM", "11:30 AM")
                .replace(/\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b/gi, "")
                // Remove user mentions (@username)
                .replace(/@[a-zA-Z0-9_.-]+/g, "")
                // Remove channel mentions (#channel)
                .replace(/#[a-zA-Z0-9_-]+/g, "")
                // Remove Discord message reactions and emojis patterns
                .replace(/:\w+:/g, "") // Discord custom emojis
                // Remove excessive whitespace
                .replace(/\s+/g, " ")
                .trim();

            // Additional cleaning for embed content if present
            const embedDescriptions = messageContainer.querySelectorAll('[class*="embedDescription"]');
            if (embedDescriptions.length > 0) {
                const embedText = embedDescriptions[0].textContent || "";
                // Prefer embed text for Twitter/social media content
                if (embedText.length > 50) { // Only use if substantial content
                    cleanText = embedText
                        .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
                        .replace(/\s+/g, " ")
                        .trim();
                }
            }

            console.log("[PumpPortalPlugin] Cleaned text for address detection:", {
                original: rawText.substring(0, 100) + "...",
                cleaned: cleanText.substring(0, 100) + "...",
                length: { original: rawText.length, cleaned: cleanText.length }
            });

            return cleanText;

        } catch (error) {
            console.warn("[PumpPortalPlugin] Error cleaning message text:", error);
            // Return original text if cleaning fails
            return rawText;
        }
    },

    // Enhanced Twitter content detection
    isActualTwitterContent(messageContainer: Element, messageText: string): boolean {
        // Check for explicit Twitter/X URLs
        if (messageText.includes("twitter.com") || messageText.includes("x.com") || messageText.includes("t.co")) {
            return true;
        }

        // Check for Twitter-specific embeds
        const embedTitle = messageContainer.querySelector('div[class*="embedTitle"]');
        const embedAuthor = messageContainer.querySelector('div[class*="embedAuthor"]');
        const embedFooter = messageContainer.querySelector('div[class*="embedFooter"]');
        const embedProvider = messageContainer.querySelector('div[class*="embedProvider"]');

        // Look for Twitter-specific indicators in embeds
        if (embedTitle || embedAuthor || embedFooter || embedProvider) {
            const embedText = [embedTitle, embedAuthor, embedFooter, embedProvider]
                .filter(el => el)
                .map(el => el?.textContent || "")
                .join(" ")
                .toLowerCase();

            // Check for Twitter-specific text patterns
            if (embedText.includes("twitter") ||
                embedText.includes("tweeted") ||
                embedText.includes("replied") ||
                embedText.includes("retweeted") ||
                embedText.includes("x.com") ||
                (embedText.includes("@") && (embedText.includes("posted") || embedText.includes("shared")))) {
                return true;
            }
        }

        // Check for Twitter-style content patterns
        const twitterPatterns = [
            /(?:^|\s)@\w+\s+(?:tweeted|posted|shared|replied):/i,
            /(?:^|\s)@\w+\s+replied to/i,
            /(?:^|\s)@\w+\s+retweeted/i,
            /(?:tweeted|posted on twitter|shared on x):/i,
            /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/i
        ];

        for (const pattern of twitterPatterns) {
            if (pattern.test(messageText)) {
                return true;
            }
        }

        // Check for image embeds that might be from Twitter
        const images = messageContainer.querySelectorAll("img");
        for (const img of images) {
            const imgSrc = (img as HTMLImageElement).src;
            if (imgSrc && (imgSrc.includes("pbs.twimg.com") || imgSrc.includes("twitter.com"))) {
                return true;
            }
        }

        // Check for Twitter proxy images in Discord
        const allElements = messageContainer.querySelectorAll("*");
        for (const element of allElements) {
            const href = element.getAttribute("href");
            if (href && (href.includes("twitter.com") || href.includes("x.com"))) {
                return true;
            }
        }

        // Fallback: if there's an embed and the word "tweet" appears, probably Twitter
        if ((embedTitle || embedAuthor || embedFooter || embedProvider) &&
            (messageText.toLowerCase().includes("tweet") || messageText.toLowerCase().includes("twitter"))) {
            return true;
        }

        return false;
    },

    // Enhanced URL validation function
    validateUrl(url: string): string {
        // If empty or null, return default
        if (!url || typeof url !== "string") {
            return "https://pumpportal.fun";
        }

        // Trim and clean the URL
        const cleanUrl = url.trim();

        // If too short to be a valid URL, return default
        if (cleanUrl.length < 10) {
            return "https://pumpportal.fun";
        }

        // If it contains spaces or line breaks, try to extract the first URL
        if (cleanUrl.includes(" ") || cleanUrl.includes("\n")) {
            const urlMatch = cleanUrl.match(/https?:\/\/[^\s\n]+/);
            if (urlMatch) {
                return this.validateUrl(urlMatch[0]);
            }
            return "https://pumpportal.fun";
        }

        // Try to construct URL to validate
        try {
            const urlObj = new URL(cleanUrl);
            return urlObj.href;
        } catch (error) {
            // If it doesn't start with http/https, try adding https://
            if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                try {
                    const urlObj = new URL("https://" + cleanUrl);
                    return urlObj.href;
                } catch (error2) {
                    return "https://pumpportal.fun";
                }
            }
            return "https://pumpportal.fun";
        }
    },

    // Extract images from the currently visible/selected messages only
    async extractMessageData(specificMessageContainer?: Element) {
        let targetMessage: Element | null = null;

        if (specificMessageContainer) {
            // Use the provided specific message container
            targetMessage = specificMessageContainer;
        } else {
            // Try to find the most recently visible or selected message
            const recentMessages = Array.from(document.querySelectorAll('[class*="message"]:not([class*="groupStart"])')).slice(-5);

            if (recentMessages.length > 0) {
                // Use the last visible message
                targetMessage = recentMessages[recentMessages.length - 1];
            }
        }

        let extractedLink = "";
        let extractedImages: string[] = [];
        let messageContent = "";
        const statusLinks: string[] = [];
        const accountLinks: string[] = [];
        const otherLinks: string[] = [];

        if (targetMessage) {
            const messageText = targetMessage.textContent || "";
            const messageId = targetMessage.getAttribute("id") ||
                targetMessage.getAttribute("data-list-item-id") ||
                targetMessage.querySelector("[data-list-item-id]")?.getAttribute("data-list-item-id") ||
                Date.now().toString();

            // Extract text content
            const embedDescriptions = targetMessage.querySelectorAll('div[class*="embedDescription"]');
            if (embedDescriptions.length > 0) {
                messageContent = embedDescriptions[0].textContent || "";
            } else {
                messageContent = messageText;
            }

            // Clean up message content
            messageContent = messageContent
                .replace(/https?:\/\/[^\s]+/g, "")
                .replace(/\s+/g, " ")
                .trim();

            // Enhanced link extraction with better validation
            const links: string[] = [];

            const isValidTwitterUrl = (url: string): boolean => {
                if (!url || typeof url !== "string") return false;
                const lowerUrl = url.toLowerCase();
                return (
                    lowerUrl.includes("twitter.com") ||
                    lowerUrl.includes("x.com") ||
                    lowerUrl.includes("t.co") ||
                    lowerUrl.includes("trib.al")
                ) && !lowerUrl.includes("discord");
            };

            // Extract from anchor tags WITHIN THIS MESSAGE ONLY
            const anchorTags = targetMessage.querySelectorAll("a[href]");
            anchorTags.forEach(anchor => {
                const { href } = (anchor as HTMLAnchorElement);
                if (href && isValidTwitterUrl(href)) {
                    const validatedUrl = this.validateUrl(href);
                    if (validatedUrl !== "https://pumpportal.fun") {
                        if (href.includes("/status/")) {
                            statusLinks.push(validatedUrl);
                        } else if (href.includes("x.com/") || href.includes("twitter.com/")) {
                            accountLinks.push(validatedUrl);
                        } else {
                            otherLinks.push(validatedUrl);
                        }
                        if (!links.includes(validatedUrl)) {
                            links.push(validatedUrl);
                        }
                    }
                }
            });

            // Extract URLs from text with improved regex
            const urlMatches = messageText.matchAll(/https?:\/\/[^\s\]]+/g);
            for (const match of urlMatches) {
                const url = match[0];
                if (isValidTwitterUrl(url)) {
                    const validatedUrl = this.validateUrl(url);
                    if (validatedUrl !== "https://pumpportal.fun" && !links.includes(validatedUrl)) {
                        if (url.includes("/status/")) {
                            statusLinks.push(validatedUrl);
                        } else if (url.includes("x.com/") || url.includes("twitter.com/")) {
                            accountLinks.push(validatedUrl);
                        } else {
                            otherLinks.push(validatedUrl);
                        }
                        links.push(validatedUrl);
                    }
                }
            }

            // Handle shortened URLs with better validation
            const shortUrlMatches = messageText.matchAll(/(?:^|\s)((?:trib\.al|t\.co)\/[A-Za-z0-9]+)/g);
            for (const match of shortUrlMatches) {
                if (match[1] && match[1].length > 3) {
                    const url = "https://" + match[1];
                    const validatedUrl = this.validateUrl(url);
                    if (validatedUrl !== "https://pumpportal.fun" && !links.includes(validatedUrl)) {
                        otherLinks.push(validatedUrl);
                        links.push(validatedUrl);
                    }
                }
            }

            // Prioritize links with validation
            if (statusLinks.length > 0) {
                extractedLink = statusLinks[0];
            } else if (accountLinks.length > 0) {
                extractedLink = accountLinks[0];
            } else if (otherLinks.length > 0) {
                extractedLink = otherLinks[0];
            }

            // Final validation of the extracted link
            extractedLink = this.validateUrl(extractedLink);

            // Enhanced image detection - SCOPED TO THIS MESSAGE ONLY
            const images: string[] = [];

            // Method 1: Check ALL elements within THIS SPECIFIC MESSAGE ONLY
            const allElements = targetMessage.querySelectorAll("*");

            allElements.forEach(element => {
                const href = element.getAttribute("href");
                if (href && href.includes("pbs.twimg.com") && !images.includes(href)) {
                    images.push(href);
                }

                const { attributes } = element;
                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    if (attr.value && attr.value.includes("pbs.twimg.com") && !images.includes(attr.value)) {
                        images.push(attr.value);
                    }
                }
            });

            // Method 2: Look for img tags within THIS MESSAGE ONLY
            const allImages = targetMessage.querySelectorAll("img");

            allImages.forEach(img => {
                const imgElement = img as HTMLImageElement;
                const { src } = imgElement;

                if (src &&
                    !src.includes("discord.com/assets") &&
                    !src.includes("emoji") &&
                    !imgElement.className.includes("embedAuthorIcon") &&
                    src.includes("pbs.twimg.com") &&
                    !images.includes(src)) {
                    images.push(src);
                }
            });

            // Method 3: Text parsing for image URLs within THIS MESSAGE ONLY
            const twitterImageRegex = /https?:\/\/[^\s]*pbs\.twimg\.com\/[^\s)]+/g;
            const imageMatches = messageText.matchAll(twitterImageRegex);
            for (const match of imageMatches) {
                const imageUrl = match[0];
                if (!images.includes(imageUrl)) {
                    images.push(imageUrl);
                }
            }

            // Method 4: Check innerHTML for embedded URLs within THIS MESSAGE ONLY
            const messageHTML = targetMessage.innerHTML;
            const htmlImageMatches = messageHTML.matchAll(/https?:\/\/[^"'\s]*pbs\.twimg\.com\/[^"'\s]*/g);
            for (const match of htmlImageMatches) {
                const imageUrl = match[0];
                if (!images.includes(imageUrl)) {
                    images.push(imageUrl);
                }
            }

            // Method 5: Look for background-image styles within THIS MESSAGE ONLY
            allElements.forEach(element => {
                const style = window.getComputedStyle(element);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage.includes("pbs.twimg.com")) {
                    const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (urlMatch && !images.includes(urlMatch[1])) {
                        images.push(urlMatch[1]);
                    }
                }
            });

            // Method 6: Enhanced Discord proxy detection within THIS MESSAGE ONLY
            const discordProxyRegex = /https:\/\/images-ext-\d+\.discordapp\.net\/external\/[^"'\s]*/g;
            const proxyMatches = messageHTML.matchAll(discordProxyRegex);
            for (const match of proxyMatches) {
                const proxyUrl = match[0];
                if (proxyUrl.includes("pbs.twimg.com") && !images.includes(proxyUrl)) {
                    images.push(proxyUrl);
                }
            }

            // Clean up URLs and ensure they're unique to THIS MESSAGE
            const uniqueImages = [...new Set(images)].map(url => {
                return url.replace(/[)}\]"'>]+$/, "");
            });

            extractedImages = uniqueImages;
        }

        return {
            extractedLink,
            extractedImages,
            messageContent,
            statusLinks,
            accountLinks,
            otherLinks
        };
    },

    // Enhanced message content processing with CA detection and trade button injection
    processMessageContent(content: HTMLElement) {
        // Skip if buttons already exist
        if (content.parentElement?.querySelector(".pump-button-inline")) return;

        const messageContainer = content.closest("[class*='message_']");
        if (!messageContainer) return;

        const messageText = messageContainer.textContent ?? "";

        // Extract clean message text for address detection (remove Discord UI elements)
        const cleanMessageText = this.cleanMessageTextForAddressDetection(messageContainer, messageText);

        // Extract clean tweet text
        let cleanTweetText = "";
        const embedDescriptions = messageContainer.querySelectorAll('div[class*="embedDescription"]');
        if (embedDescriptions.length > 0) {
            const firstDesc = embedDescriptions[0];
            cleanTweetText = firstDesc.textContent || "";
            cleanTweetText = cleanTweetText
                .replace(/https?:\/\/[^\s]+/g, "")
                .replace(/\s+/g, " ")
                .trim();
        }

        if (!cleanTweetText) {
            cleanTweetText = messageText
                .replace(/\[[^\]]*\]/g, "")
                .replace(/@\w+\s+Tweeted:/g, "")
                .replace(/@\w+\s+Replied to [^:]+:/g, "")
                .replace(/@\w+\s+Retweeted [^:]+:/g, "")
                .replace(/\(edited\)/g, "")
                .replace(/https?:\/\/[^\s]+/g, "")
                .replace(/🚀\s*Create\s*Coin/g, "")
                .replace(/💼\s*Wallet\s*Manager/g, "")
                .replace(/📊\s*Trade/g, "")
                .replace(/\s+/g, " ")
                .trim();
        }

        // Enhanced Twitter content detection - be more permissive for now
        const hasTwitterContent = this.isActualTwitterContent(messageContainer, messageText) ||
            messageText.toLowerCase().includes("tweet") ||
            messageText.includes("@") ||
            messageText.includes("twitter.com") ||
            messageText.includes("x.com") ||
            messageContainer.querySelector('div[class*="embedTitle"]') ||
            messageContainer.querySelector('div[class*="embedDescription"]');

        // Check for Solana contract addresses using cleaned text
        const detectedAddresses = this.detectSolanaContractAddresses(cleanMessageText);
        const hasValidCA = detectedAddresses.length > 0;

        // Only proceed if we have either Twitter content or valid CAs
        if (!hasTwitterContent && !hasValidCA) return;

        // Create enhanced inline wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "pump-button-inline";
        wrapper.style.cssText = `
            margin-top: 4px; 
            display: flex; 
            gap: 6px; 
            align-items: center; 
            width: fit-content;
            background: linear-gradient(135deg, ${BRAND_COLORS.primary}20, ${BRAND_COLORS.primaryDark}20);
            padding: 3px 6px;
            border-radius: 4px;
            border: 1px solid ${BRAND_COLORS.accent2}30;
        `;

        // Add small logo if available
        if (PADRAIG_LOGO_BASE64) {
            const smallLogo = document.createElement("img");
            smallLogo.src = PADRAIG_LOGO_BASE64;
            smallLogo.alt = "Padraig";
            smallLogo.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 2px;
            `;
            wrapper.appendChild(smallLogo);
        }

        // Add Quick Create Button for Twitter content
        if (hasTwitterContent) {
            const quickCoinBtn = document.createElement("button");
            quickCoinBtn.textContent = "🚀 Quick Create";
            quickCoinBtn.style.cssText = `
                background: linear-gradient(135deg, ${BRAND_COLORS.accent2}, ${BRAND_COLORS.accent2}dd);
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 2px 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            quickCoinBtn.addEventListener("mouseenter", () => {
                quickCoinBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.accent2}ee, ${BRAND_COLORS.accent2}cc)`;
            });

            quickCoinBtn.addEventListener("mouseleave", () => {
                quickCoinBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.accent2}, ${BRAND_COLORS.accent2}dd)`;
            });

            quickCoinBtn.onclick = async () => {
                // Extract data from this specific message container
                const extractedData = await this.extractMessageData(messageContainer);

                openModal((props: any) => React.createElement(CoinModal, {
                    ...props,
                    ...extractedData,
                    messageContent: cleanTweetText || messageText
                }));
            };

            wrapper.appendChild(quickCoinBtn);
        }

        // Add Trade Button for detected contract addresses
        if (hasValidCA) {
            const quickTradeBtn = document.createElement("button");
            quickTradeBtn.textContent = `📊 Trade ${detectedAddresses.length > 1 ? `(${detectedAddresses.length})` : ""}`;
            quickTradeBtn.style.cssText = `
                background: linear-gradient(135deg, ${BRAND_COLORS.accent3}, ${BRAND_COLORS.accent3}dd);
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 2px 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: ${hasTwitterContent ? "4px" : "0"};
            `;

            quickTradeBtn.addEventListener("mouseenter", () => {
                quickTradeBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.accent3}ee, ${BRAND_COLORS.accent3}cc)`;
            });

            quickTradeBtn.addEventListener("mouseleave", () => {
                quickTradeBtn.style.background = `linear-gradient(135deg, ${BRAND_COLORS.accent3}, ${BRAND_COLORS.accent3}dd)`;
            });

            quickTradeBtn.onclick = () => {
                // Use the first detected address as the primary CA
                const primaryCA = detectedAddresses[0];

                openModal((props: any) => React.createElement(BuySellModal, {
                    ...props,
                    debugInfoEnabled,
                    // Pre-populate the mint address
                    initialMintAddress: primaryCA,
                    detectedAddresses: detectedAddresses // Pass all detected addresses for reference
                }));
            };

            // Add a tooltip showing the detected addresses
            quickTradeBtn.title = `Detected Contract Addresses:\n${detectedAddresses.map((addr, i) =>
                `${i + 1}. ${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`
            ).join("\n")}`;

            wrapper.appendChild(quickTradeBtn);
        }

        const messageWrapper = content.closest("[class*='messageContent_']") || content;
        if (messageWrapper.parentElement) {
            messageWrapper.parentElement.appendChild(wrapper);
        }
    },

    updateColors() {
        // Remove custom styling - back to original
        const style = document.getElementById("padraig-plugin-colors");
        if (style) {
            style.remove();
        }
    },

    stop() {
        console.log("[PumpPortalPlugin] Stopping enhanced plugin...");

        // Clean up UI elements
        document.querySelectorAll(".pump-button-inline, .pump-persistent-button, .padraig-branding").forEach(el => el.remove());

        // Clean up custom styles
        const customStyles = document.getElementById("padraig-plugin-colors");
        if (customStyles) customStyles.remove();

        // Clean up ToastContainer
        const toastContainer = document.getElementById("padraig-toast-container");
        if (toastContainer) {
            if (this._toastRoot) {
                this._toastRoot.unmount();
                this._toastRoot = null;
            }
            toastContainer.remove();
        }

        // Clean up LivePriceSidebar
        const sidebarContainer = document.getElementById("padraig-price-sidebar");
        if (sidebarContainer) {
            if (this._sidebarRoot) {
                this._sidebarRoot.unmount();
                this._sidebarRoot = null;
            }
            sidebarContainer.remove();
        }

        // Clean up Sniper Status
        const sniperContainer = document.getElementById("padraig-sniper-status");
        if (sniperContainer) {
            if (this._sniperStatusRoot) {
                this._sniperStatusRoot.unmount();
                this._sniperStatusRoot = null;
            }
            sniperContainer.remove();
        }

        // Disconnect sniper WebSocket
        import("./TokenSniper").then(({ tokenSniper }) => {
            tokenSniper.disconnect();
        });

        // Disconnect observers
        this._cleanup?.();

        console.log("[PumpPortalPlugin] Enhanced plugin stopped");
    }
});
