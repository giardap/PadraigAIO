<div align="center">

![PadraigAIO Banner](./assets/padraig-banner.png)

# PadraigAIO

**Enhanced Solana token creation and trading directly from Discord**

PadraigAIO is a comprehensive Discord/Vencord plugin that enables seamless creation and trading of Solana tokens through pump.fun, with advanced features like smart contract detection, real-time market data, and automated IPFS uploads.

![Plugin Interface](https://img.shields.io/badge/Platform-Discord%20%2F%20Vencord-5865F2)
![Solana](https://img.shields.io/badge/Blockchain-Solana-9945FF)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

</div>

---

## 🚀 Core Features

### 💼 Advanced Wallet Management
- **Multi-Wallet Support**: Create and manage unlimited Solana wallets
- **Real-Time Balance Tracking**: Live SOL and SPL token balance updates
- **Secure Key Storage**: IndexedDB encryption with local-only storage
- **Default Wallet System**: Set preferred wallet for streamlined operations
- **Portfolio Overview**: Track created tokens and holdings across all wallets
- **Auto-Refresh**: Configurable balance update intervals (5s-1m)

### 🎯 Smart Token Creation
- **One-Click Creation**: Generate tokens directly from Discord messages
- **Twitter/X Integration**: Automatic content extraction from social media embeds
- **Smart Image Processing**: Auto-detect and cache images from messages
- **IPFS Optimization**: Automatic image compression and upload to IPFS
- **Metadata Generation**: Professional token metadata with social links
- **Dev Buy Integration**: Automatically purchase your tokens upon creation

### 📊 Advanced Trading Interface
- **Contract Address Detection**: Automatically detect Solana addresses in messages
- **Real-Time Market Data**: Live price, volume, and liquidity information
- **Quick Trade Buttons**: Configurable buy amounts and sell percentages
- **Multi-Exchange Support**: Auto-routing through best available pools
- **Risk Management**: Built-in slippage and fee controls
- **Transaction Tracking**: Direct links to blockchain explorers

### ⚙️ Professional Configuration
- **Global Trading Settings**: Centralized configuration for all operations
- **Risk Level Indicators**: Visual feedback on trading parameters
- **Preset Configurations**: Conservative, Balanced, and Aggressive presets
- **Quick Action Customization**: Personalize buy amounts and sell percentages
- **MEV Protection**: Optional Jito bundle routing for transaction protection

---

## 🔧 Installation

> **Important**: This is a development plugin for Vencord that must be installed in the `userplugins` folder. You **cannot** use the regular Vencord installer - you must build Vencord from source for development plugins to work.

### Development Installation

#### Prerequisites
```bash
# Ensure you have the required tools
node --version  # Should be v18+ (Node 16+ supported)
pnpm --version  # Should be v8+ (recommended) or npm/yarn
git --version   # Any recent version
```

**Required Dependencies for Solana Integration:**
- `@solana/web3.js` - Solana blockchain interaction
- `bs58` - Base58 encoding/decoding for Solana addresses

#### Step 1: Clone and Setup Vencord (Development)
```bash
# Clone Vencord repository
git clone https://github.com/Vendicated/Vencord.git
cd Vencord

# Install Vencord dependencies
pnpm install

# Install required dependencies for Solana plugins
pnpm add @solana/web3.js bs58

# Create the userplugins directory in src folder
mkdir -p src/userplugins
```

> **Note**: The Vencord installer from vencord.dev **will not work** for user plugins. You must build from source.

#### Step 2: Clone PadraigAIO Plugin
```bash
# Navigate to the userplugins directory (inside Vencord/src/)
cd src/userplugins

# Clone the PadraigAIO plugin
git clone https://github.com/giardap/padraigaio.git PadraigAIO
cd PadraigAIO
```

#### Step 3: Install Plugin Dependencies and Build
```bash
# Install plugin dependencies (if any additional ones needed)
pnpm install

# Build Vencord with the new plugin
cd ../../  # Go back to Vencord root directory
pnpm build

# Inject Vencord into Discord
pnpm inject
```

#### Step 4: Enable Plugin in Discord
1. **Restart Discord completely** (important for new plugins)
2. Open Discord
3. Navigate to `Settings` → `Vencord` → `Plugins`
4. Find "PadraigAIO" and toggle it **ON**

### Development Workflow

#### Making Changes to PadraigAIO
```bash
# After making code changes to the plugin
cd /path/to/Vencord/src/userplugins/PadraigAIO

# Go back to Vencord root and rebuild
cd ../../../  # Go back to Vencord root directory
pnpm build

# Re-inject Vencord to apply changes
pnpm inject
```

#### Live Development Mode
```bash
# For active development, rebuild Vencord after changes
cd /path/to/Vencord
pnpm build && pnpm inject
```

#### Updating the Plugin
```bash
# Pull latest changes (in plugin directory)
cd /path/to/Vencord/src/userplugins/PadraigAIO
git pull origin main

# Go back to Vencord root and rebuild
cd ../../../
pnpm build
pnpm inject
```

#### Updating Vencord
```bash
# Update Vencord itself (in Vencord directory)
cd /path/to/Vencord
git pull origin main
pnpm install

# Reinstall Solana dependencies if needed
pnpm add @solana/web3.js bs58

pnpm build
pnpm inject
```

### Troubleshooting Installation

#### Plugin Not Appearing
```
Problem: PadraigAIO doesn't show up in plugins list
Solutions:
1. Ensure you're using built Vencord, not installer version
2. Check plugin is in Vencord/src/userplugins/PadraigAIO/
3. Verify Vencord built successfully (pnpm build from root)
4. Restart Discord completely
5. Re-inject Vencord (pnpm inject from Vencord root)
```

#### Build Errors
```
Problem: Vencord build fails
Solutions:
1. Check Node.js version (18+ recommended)
2. Ensure Solana dependencies installed: pnpm add @solana/web3.js bs58
3. Clear node_modules and reinstall: rm -rf node_modules && pnpm install
4. Check for TypeScript errors in plugin code
5. Verify plugin is in correct src/userplugins/ directory
```

#### Vencord Injection Issues
```
Problem: Vencord injection fails
Solutions:
1. Close Discord completely before injecting
2. Run as administrator/sudo if needed
3. Disable antivirus temporarily during injection
4. Check Discord app integrity
```

---

## 🛠️ Key Capabilities

### Smart Content Detection
- **Address Recognition**: Detects standard and extended Solana contract addresses
- **Twitter Content Parsing**: Extracts clean text and images from social embeds
- **Multi-Address Support**: Handle messages with multiple contract addresses
- **Proxy Image Handling**: Works with Discord's image proxy system

### Enhanced Storage System
- **IndexedDB Integration**: Persistent, encrypted local storage
- **Image Caching**: Faster repeat operations through intelligent caching
- **Upload History**: Track IPFS upload success rates and performance
- **Data Portability**: Export/import wallet and configuration data
- **Storage Analytics**: Monitor usage and optimize performance

### Market Data Integration
- **Multi-Source Aggregation**: DexScreener, Jupiter, and CoinGecko APIs
- **Real-Time Updates**: 3-30 second refresh intervals
- **Social Links**: Automatic detection of project websites and social media
- **Pool Information**: Liquidity and trading pair details
- **Price History**: 24-hour change indicators with color coding

### Portfolio Management
- **Created Coins Tracking**: Monitor status of your token deployments
- **Holdings Overview**: Real-time token balance across all wallets
- **Performance Metrics**: Track portfolio value and changes
- **Transaction History**: Complete audit trail with blockchain links

---

## 🎮 User Interface

### Main Toolbar
The plugin adds a persistent toolbar to Discord with four main components:

- **💼 Wallets**: Access wallet management and balance tracking
- **🚀 Create**: Launch token creation interface
- **📊 Trade**: Open trading interface with market data
- **⚙️ Settings**: Configure global trading parameters

### Contextual Integration
- **Inline Buttons**: Smart buttons appear under relevant Discord messages
- **Auto-Detection**: Contract addresses trigger automatic trade buttons
- **Quick Actions**: One-click access to creation and trading from message content

---

## 📈 Trading Features

### Buy Operations
- **SOL-Denominated**: Purchase tokens using SOL amounts
- **Quick Buy Buttons**: Preset amounts (0.01, 0.05, 0.1, 0.5, 1.0, 2.0 SOL)
- **Custom Amounts**: Manual entry with validation
- **Balance Checking**: Real-time SOL balance verification
- **Market Preview**: Live price and impact estimates

### Sell Operations
- **Percentage-Based**: Sell 25%, 50%, 75%, or 100% of holdings
- **Token-Denominated**: Specify exact token amounts
- **Holdings Display**: Real-time token balance information
- **Quick Sell Buttons**: Configurable percentage presets
- **Portfolio Integration**: Direct access to held tokens

### Advanced Trading
- **Slippage Control**: 0.1% to 50% tolerance settings
- **Priority Fees**: Configurable gas optimization (0.00001-0.002 SOL)
- **Pool Selection**: Auto-routing or manual exchange selection
- **Transaction Options**: Skip preflight checks for faster execution
- **MEV Protection**: Jito-only routing for large trades

---

## ⚙️ Configuration

### Initial Setup

1. **First Launch**:
   - Plugin will automatically initialize storage
   - Create your first wallet or import existing one
   - Set up default configurations

2. **Wallet Configuration**:
   ```typescript
   // The plugin supports multiple wallet formats
   interface Wallet {
     id: string;
     name: string;
     publicKey?: string;
     privateKey?: string;  // Encrypted locally
     apiKey?: string;      // For advanced features
     createdAt: string;
     updatedAt: string;
   }
   ```

3. **Storage Settings**:
   - **Database**: IndexedDB (local, encrypted)
   - **Cache Size**: Configurable (default: 100MB)
   - **Auto-cleanup**: Old uploads cleaned after 30 days

### Plugin Settings

Access via Discord Settings → Vencord → Plugins → PadraigAIO:

- **Default Wallet**: Set primary wallet for operations
- **Auto-retry**: Enable automatic retry on failed uploads
- **Debug Mode**: Enable detailed logging
- **Image Cache**: Configure caching behavior
- **Network Settings**: RPC endpoints and timeouts

---

## 🔒 Security Features

### Local-First Architecture
- **No Server Dependencies**: All operations run locally in Discord
- **Private Key Security**: Keys never leave your device
- **Encrypted Storage**: IndexedDB with encryption for sensitive data
- **API Key Isolation**: Separate pump.fun keys per wallet

### Risk Management
- **Risk Level Indicators**: Visual feedback on trading parameters
- **Balance Validation**: Prevent trades exceeding available funds
- **Transaction Simulation**: Optional preflight checks
- **Backup System**: Export/import for wallet recovery

### Data Privacy
- **Local Storage Only**: No external data collection
- **Audit Trail**: Complete transaction history with blockchain links
- **Cache Management**: User-controlled image and data caching
- **Secure Cleanup**: Automatic cleanup of sensitive temporary data

---

## 🎨 Customization Options

### Trading Preferences
- **Quick Buy Amounts**: Customize SOL amounts for buy buttons
- **Quick Sell Percentages**: Configure percentage options for selling
- **Default Dev Buy**: Set standard amount for token creation purchases
- **Slippage Tolerance**: Personal risk comfort levels
- **Auto-Refresh Settings**: Balance update frequency preferences

### Interface Customization
- **Theme Integration**: Follows Discord's theme automatically
- **Notification Preferences**: Control trade completion alerts
- **Storage Management**: Configure cache limits and cleanup
- **Debug Options**: Enable detailed logging for troubleshooting

### Workflow Optimization
- **Default Wallet**: Set preferred wallet for all operations
- **Preset Configurations**: Save trading parameter combinations
- **Auto-Detection Settings**: Control smart address recognition
- **Market Data Sources**: Configure data provider preferences

---

## 🔄 Performance Features

### Optimization Systems
- **Image Caching**: 10x faster IPFS uploads for repeated images
- **Balance Batching**: Efficient multi-wallet balance updates
- **Debounced Queries**: Prevents API rate limiting
- **Lazy Loading**: Load data only when needed
- **Memory Management**: Automatic cleanup of old cache data

### Real-Time Updates
- **Live Balance Tracking**: Continuous SOL and token balance monitoring
- **Market Data Streaming**: Real-time price and volume updates
- **Transaction Status**: Live updates on pending operations
- **Portfolio Sync**: Automatic refresh after successful trades

### Reliability Features
- **Error Recovery**: Automatic retry for failed operations
- **Fallback Systems**: Multiple data sources for redundancy
- **Cache Validation**: Automatic cleanup of stale data
- **Connection Handling**: Graceful handling of network issues

---

## 🎯 Use Cases

### Content Creators
- **Instant Token Creation**: Turn Discord messages into tradeable tokens
- **Community Engagement**: Create tokens from community content
- **Social Integration**: Leverage Twitter/X content for token metadata
- **Brand Building**: Professional token metadata with social links

### Active Traders
- **Quick Market Access**: Instant trading from detected contract addresses
- **Portfolio Management**: Track holdings across multiple wallets
- **Risk Management**: Configurable safety parameters
- **Performance Tracking**: Complete transaction and portfolio history

### DeFi Enthusiasts
- **Multi-Exchange Access**: Route through best available liquidity
- **Advanced Trading**: Sophisticated slippage and fee controls
- **MEV Protection**: Optional bundle routing for protection
- **Market Analysis**: Real-time data from multiple sources

### Power Users
- **Automation**: Preset configurations for different strategies
- **Customization**: Extensive personalization options
- **Integration**: Seamless Discord workflow integration
- **Analytics**: Detailed performance and usage metrics

---

## 🔍 Troubleshooting

### Common Issues

#### Plugin Not Loading
```
Problem: Plugin doesn't appear in Discord
Solution:
1. Ensure you built Vencord from source (not installer)
2. Check plugin is in Vencord/src/userplugins/PadraigAIO/
3. Verify Vencord built successfully from root directory
4. Restart Discord completely
5. Re-inject Vencord from root directory
```

#### Upload Failures
```
Problem: IPFS uploads fail consistently
Solutions:
1. Check internet connection
2. Verify image file is valid
3. Try smaller image size (< 10MB)
4. Clear plugin cache
5. Update to latest plugin version
```

#### Wallet Issues
```
Problem: Cannot access stored wallets
Solutions:
1. Check IndexedDB permissions
2. Clear browser cache
3. Re-import wallets
4. Check for storage quota limits
```

#### Discord Integration Problems
```
Problem: Commands not working
Solutions:
1. Re-enable plugin in Vencord settings
2. Check Discord permissions
3. Update Vencord to latest version
4. Clear Discord cache
```

### Debug Mode

Enable debug mode for detailed logging:
1. Settings → Vencord → Plugins → PadraigAIO
2. Enable "Debug Mode"
3. Open Developer Console (Ctrl+Shift+I)
4. Check console for detailed error messages

---

## 📊 Technical Specifications

### Supported Networks
- **Solana Mainnet**: Full trading and creation support
- **Pump.fun Integration**: Native token creation and trading
- **Multi-DEX Support**: Raydium, Jupiter, and other major exchanges

### Data Sources
- **Market Data**: DexScreener, Jupiter, CoinGecko
- **Blockchain Data**: Helius RPC endpoints
- **Image Storage**: IPFS via pump.fun infrastructure
- **Local Storage**: IndexedDB with encryption

### Performance Metrics
- **Response Time**: <2s for most operations
- **Cache Hit Rate**: 90%+ for repeated operations
- **Storage Efficiency**: <50MB typical usage
- **Update Frequency**: 5-30 second intervals for live data

---

## 🏆 What Makes PadraigAIO Special

### Intelligence
- **Context Awareness**: Understands Discord message content and context
- **Smart Detection**: Recognizes contract addresses and social content automatically
- **Adaptive Interface**: UI elements appear contextually based on content

### Integration
- **Native Discord Feel**: Seamlessly integrated into Discord's interface
- **Social-First**: Built for social media content and community interaction
- **Workflow Optimization**: Reduces clicks and complexity for common operations

### Reliability
- **Battle-Tested**: Production-ready with comprehensive error handling
- **Scalable**: Handles multiple wallets and high-frequency trading
- **Maintainable**: Clean architecture with modular components

### Innovation
- **First-of-Kind**: Unique Discord-native token creation and trading
- **Advanced Caching**: Sophisticated optimization for repeated operations
- **Professional UX**: Polished interface with attention to detail

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vencord Team**: For the excellent Discord modification framework
- **Solana Foundation**: For the robust blockchain infrastructure
- **pump.fun**: For providing the token creation platform
- **Discord**: For the platform that makes this all possible
- **Community**: For feedback, bug reports, and feature requests

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/giardap/padraigaio/issues)
- **Discord Server**: [Join our community](https://discord.gg/cgExEhGrGJ)
- **Email**: wrecktivity@proton.me

---

**Built with ❤️ for the Solana and Discord communities**

*Empowering creators to build the future of decentralized finance, one token at a time.*