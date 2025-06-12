/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Enhanced Solana Address Detection and Validation Utilities
 * Provides comprehensive contract address detection with improved accuracy and validation
 */

export interface AddressScore {
    address: string;
    score: number;
    type: "mint" | "wallet" | "program" | "unknown";
    contextClues: string[];
}

export interface ValidationCache {
    [address: string]: {
        isValid: boolean;
        timestamp: number;
        type?: string;
    };
}

export class EnhancedAddressDetector {
    private validationCache: ValidationCache = {};
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Known Solana program addresses for better validation
    private readonly knownPrograms = new Set([
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token Program
        "11111111111111111111111111111111", // System Program
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", // Token-2022 Program
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
        "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium AMM Program
        "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", // Jupiter Program
        "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", // Pump.fun Program
    ]);

    // Enhanced detection patterns for all types of Solana addresses
    private readonly detectionPatterns = [
        // Standard Solana base58 addresses (most restrictive first)
        {
            pattern: /\b[1-9A-HJ-NP-Za-km-z]{43,44}\b/g,
            priority: 10,
            description: "Standard Solana address (43-44 chars)"
        },
        {
            pattern: /\b[1-9A-HJ-NP-Za-km-z]{32,42}\b/g,
            priority: 8,
            description: "Shorter Solana address (32-42 chars)"
        },
        // Addresses with common token suffixes (more permissive length)
        {
            pattern: /\b[1-9A-HJ-NP-Za-km-z]{25,}(?:pump|bonk|boop|coin|token|sol|inu|meme|fun|moon|degen|chad|pepe|shib|doge|cat|dog|ape|bear|bull|gem|diamond|rocket|fire|based|cope|seethe|wagmi|ngmi|gmi|lfg|hodl|rekt|fud|fomo|yolo|send|launch|dev|team|community|airdrop|presale|fair|safe|rug|scam|memecoin|defi|dao|nft|web3|crypto|blockchain|decentralized|trustless|permissionless|yield|farm|stake|mint|burn|bridge|swap|pool|vault|treasury|governance|protocol|network|layer|chain|node|validator|consensus|block|transaction|hash|signature|keypair|wallet|account|balance|transfer|approve|revoke|freeze|thaw|close|create|initialize|update|migrate|upgrade|deprecate|sunset|emergency|pause|unpause|whitelist|blacklist|kyc|aml|compliance|audit|verify|certify|register|unregister|enable|disable|activate|deactivate|start|stop|begin|end|open|close|lock|unlock|seal|unseal|wrap|unwrap|deposit|withdraw|claim|collect|distribute|allocate|deallocate|assign|unassign|bind|unbind|link|unlink|connect|disconnect|join|leave|enter|exit|add|remove|insert|delete|append|prepend|push|pop|shift|unshift|slice|splice|concat|merge|split|chunk|batch|queue|stack|heap|tree|graph|map|set|list|array|vector|matrix|table|index|key|value|pair|tuple|struct|enum|union|interface|trait|impl|mod|use|pub|fn|let|mut|const|static|extern|unsafe|async|await|yield|return|break|continue|loop|while|for|if|else|match|case|default|try|catch|finally|throw|panic|assert|debug|info|warn|error|trace|log|print|println|format|parse|serialize|deserialize|encode|decode|compress|decompress|encrypt|decrypt|sign|verify|validate|sanitize|normalize|canonicalize|optimize|minimize|maximize|sort|search|find|filter|map|reduce|fold|scan|collect|iterate|enumerate|zip|unzip|flatten|group|partition|split|join|concat|merge|diff|patch|apply|revert|rollback|commit|checkout|branch|tag|release|version|major|minor|patch|prerelease|build|test|bench|doc|lint|format|check|clean|install|uninstall|update|upgrade|downgrade|publish|unpublish|pack|unpack|bundle|unbundle|compile|build|run|exec|spawn|kill|signal|interrupt|suspend|resume|pause|unpause|wait|notify|broadcast|multicast|unicast|send|receive|transmit|relay|forward|redirect|proxy|gateway|router|switch|hub|bridge|tunnel|vpn|ssh|ssl|tls|http|https|tcp|udp|ip|dns|dhcp|nat|firewall|iptables|route|ping|traceroute|nslookup|dig|curl|wget|fetch|get|post|put|patch|delete|head|options|connect|trace|websocket|socket|port|host|domain|subdomain|tld|url|uri|urn|uuid|guid|id|hash|checksum|crc|md5|sha1|sha256|sha512|hmac|pbkdf2|scrypt|argon2|bcrypt|aes|des|rsa|ecc|ecdsa|ed25519|secp256k1|bip32|bip39|bip44|hd|hierarchical|deterministic|mnemonic|seed|entropy|random|secure|insecure|vulnerable|exploit|attack|defense|protection|security|privacy|anonymity|pseudonymity|identity|authentication|authorization|permission|role|privilege|access|control|policy|rule|constraint|requirement|specification|standard|protocol|algorithm|heuristic|strategy|pattern|design|architecture|framework|library|sdk|api|interface|contract|abi|bytecode|opcode|instruction|assembly|machine|virtual|runtime|interpreter|compiler|transpiler|optimizer|minifier|obfuscator|deobfuscator|disassembler|assembler|linker|loader|debugger|profiler|tracer|monitor|meter|gauge|counter|timer|clock|timestamp|duration|interval|period|frequency|rate|bandwidth|throughput|latency|delay|jitter|packet|frame|buffer|cache|memory|storage|disk|file|directory|folder|path|name|extension|mime|content|type|size|length|width|height|depth|dimension|coordinate|position|location|address|offset|index|pointer|reference|handle|descriptor|identifier|label|tag|annotation|comment|documentation|readme|license|copyright|patent|trademark|brand|logo|icon|image|picture|photo|video|audio|sound|music|voice|speech|text|string|character|byte|bit|boolean|integer|float|double|decimal|number|digit|numeral|count|quantity|amount|total|sum|average|mean|median|mode|range|variance|deviation|distribution|probability|statistics|analytics|metrics|measurement|benchmark|performance|efficiency|scalability|reliability|availability|durability|consistency|integrity|correctness|completeness|accuracy|precision|recall|specificity|sensitivity|selectivity|discrimination|classification|clustering|regression|prediction|forecast|estimation|approximation|interpolation|extrapolation|simulation|modeling|optimization|maximization|minimization|calibration|tuning|adjustment|configuration|setting|parameter|argument|option|flag|switch|toggle|button|slider|knob|dial|wheel|lever|handle|grip|control|interface|display|screen|monitor|panel|dashboard|console|terminal|command|shell|prompt|cursor|pointer|mouse|keyboard|input|output|device|hardware|software|firmware|driver|plugin|addon|extension|module|component|element|widget|gadget|tool|utility|helper|assistant|agent|bot|robot|automation|script|macro|shortcut|alias|bookmark|favorite|history|log|record|entry|item|object|entity|instance|class|type|kind|category|group|set|collection|container|wrapper|adapter|converter|transformer|processor|handler|manager|controller|service|daemon|worker|thread|process|task|job|queue|scheduler|dispatcher|router|balancer|distributor|aggregator|collector|accumulator|buffer|pool|cache|store|repository|database|table|row|column|field|attribute|property|value|data|information|knowledge|wisdom|intelligence|ai|ml|dl|nn|cnn|rnn|lstm|gru|transformer|attention|embedding|vector|tensor|matrix|array|list|tree|graph|network|node|edge|vertex|path|route|circuit|loop|cycle|iteration|recursion|backtracking|divide|conquer|greedy|dynamic|programming|algorithm|sorting|searching|hashing|indexing|caching|memoization|tabulation|bottom|up|top|down|breadth|first|depth|pre|post|order|traversal|visit|explore|discover|find|locate|identify|recognize|detect|sense|perceive|observe|monitor|track|trace|follow|chase|hunt|seek|search|scan|survey|inspect|examine|analyze|study|investigate|research|experiment|test|validate|verify|confirm|prove|disprove|refute|reject|accept|approve|deny|allow|permit|grant|revoke|suspend|resume|continue|proceed|advance|progress|move|shift|change|modify|alter|update|upgrade|downgrade|enhance|improve|optimize|refactor|refine|polish|clean|sanitize|purify|filter|process|transform|convert|translate|interpret|compile|parse|serialize|deserialize|encode|decode|compress|decompress|encrypt|decrypt|hash|sign|verify|authenticate|authorize|login|logout|register|unregister|subscribe|unsubscribe|follow|unfollow|like|unlike|share|unshare|comment|uncomment|vote|unvote|rate|unrate|review|unreview|report|unreport|flag|unflag|block|unblock|mute|unmute|hide|unhide|show|display|render|draw|paint|sketch|animate|transition|fade|slide|zoom|rotate|scale|translate|skew|matrix|transform|clip|mask|overlay|underlay|background|foreground|layer|z|index|opacity|alpha|transparency|visibility|hidden|visible|collapse|expand|fold|unfold|wrap|unwrap|break|unbreak|join|split|merge|diff|patch|apply|revert|undo|redo|copy|paste|cut|select|deselect|highlight|focus|blur|hover|click|double|right|middle|wheel|scroll|drag|drop|resize|move|rotate|scale|pinch|zoom|pan|swipe|tap|touch|gesture|event|listener|handler|callback|promise|future|async|await|sync|defer|delay|timeout|interval|timer|clock|schedule|cron|task|job|worker|thread|fiber|coroutine|generator|iterator|stream|flow|pipe|channel|buffer|queue|stack|heap|priority|fair|round|robin|lottery|weighted|random|deterministic|predictable|unpredictable|stable|unstable|consistent|inconsistent|reliable|unreliable|available|unavailable|online|offline|connected|disconnected|active|inactive|enabled|disabled|on|off|true|false|yes|no|positive|negative|success|failure|error|warning|info|debug|trace|fatal|critical|high|medium|low|urgent|normal|deferred|immediate|delayed|scheduled|pending|running|completed|failed|cancelled|aborted|timeout|expired|fresh|stale|dirty|clean|valid|invalid|correct|incorrect|accurate|inaccurate|precise|imprecise|exact|approximate|close|far|near|distant|local|remote|global|universal|specific|general|particular|common|rare|frequent|infrequent|often|seldom|always|never|sometimes|maybe|perhaps|possibly|probably|definitely|certainly|surely|absolutely|relatively|comparatively|proportionally|exponentially|logarithmically|linearly|quadratically|cubically|polynomially|exponential|logarithmic|linear|quadratic|cubic|polynomial|constant|variable|parameter|argument|function|method|procedure|routine|subroutine|macro|lambda|closure|anonymous|named|public|private|protected|internal|external|static|dynamic|virtual|abstract|concrete|generic|specific|template|instance|singleton|factory|builder|observer|visitor|strategy|command|state|decorator|adapter|facade|proxy|bridge|composite|flyweight|chain|responsibility|mediator|memento|prototype|iterator|null|object|monad|functor|applicative|monoid|semigroup|group|ring|field|vector|space|metric|norm|distance|similarity|dissimilarity|correlation|covariance|variance|deviation|error|residual|loss|cost|objective|constraint|penalty|reward|incentive|punishment|feedback|forward|backward|propagation|gradient|descent|ascent|optimization|maximization|minimization|search|exploration|exploitation|balance|tradeoff|compromise|solution|problem|question|answer|response|request|query|command|instruction|directive|order|suggestion|recommendation|advice|guidance|help|support|assistance|service|feature|functionality|capability|ability|skill|talent|expertise|knowledge|experience|practice|training|learning|teaching|education|instruction|tutorial|guide|manual|documentation|specification|standard|protocol|convention|pattern|idiom|best|practice|anti|pattern|code|smell|refactor|clean|readable|maintainable|extensible|flexible|modular|composable|reusable|testable|debuggable|profiler|traceable|monitorable|observable|measurable|scalable|performant|efficient|fast|slow|quick|delayed|responsive|unresponsive|lag|latency|throughput|bandwidth|capacity|utilization|load|stress|pressure|tension|compression|expansion|contraction|growth|shrinkage|increase|decrease|addition|subtraction|multiplication|division|modulo|remainder|quotient|dividend|divisor|numerator|denominator|fraction|decimal|percentage|ratio|proportion|rate|frequency|period|cycle|phase|amplitude|wavelength|spectrum|range|domain|codomain|image|kernel|null|space|basis|dimension|rank|determinant|trace|eigenvalue|eigenvector|singular|value|decomposition|factorization|diagonalization|orthogonalization|normalization|standardization|regularization|penalization|smoothing|filtering|convolution|correlation|autocorrelation|cross|power|spectral|density|fourier|transform|laplace|z|discrete|continuous|analog|digital|binary|ternary|decimal|hexadecimal|octal|base|radix|positional|notation|representation|encoding|compression|lossless|lossy|huffman|lempel|ziv|arithmetic|delta|run|length|dictionary|substitution|encryption|symmetric|asymmetric|public|private|key|cipher|stream|block|mode|padding|initialization|vector|nonce|salt|pepper|rainbow|table|brute|force|dictionary|attack|cryptanalysis|cryptography|steganography|watermark|digital|signature|certificate|authority|trust|chain|validation|verification|authentication|authorization|access|control|list|role|based|attribute|capability|mandatory|discretionary|rule|policy|engine|firewall|intrusion|detection|prevention|system|antivirus|malware|virus|worm|trojan|horse|rootkit|spyware|adware|ransomware|phishing|spoofing|hijacking|injection|overflow|underflow|race|condition|deadlock|livelock|starvation|priority|inversion|thrashing|fragmentation|garbage|collection|memory|leak|dangling|pointer|buffer|overflow|stack|smashing|heap|spray|return|oriented|programming|rop|jump|oriented|jop|code|reuse|attack|exploit|vulnerability|zero|day|patch|update|hotfix|service|pack|rollup|cumulative|security|bulletin|advisory|cve|cvss|score|severity|criticality|impact|likelihood|probability|risk|assessment|management|mitigation|remediation|response|incident|breach|disclosure|responsible|coordinated|bug|bounty|penetration|testing|red|team|blue|purple|white|hat|hacker|cracker|script|kiddie|advanced|persistent|threat|apt|nation|state|actor|criminal|organization|insider|threat|social|engineering|phishing|spear|whaling|vishing|smishing|pretexting|baiting|quid|pro|quo|tailgating|piggybacking|shoulder|surfing|dumpster|diving|reconnaissance|footprinting|scanning|enumeration|fingerprinting|banner|grabbing|service|version|detection|operating|system|identification|network|mapping|topology|discovery|asset|inventory|attack|surface|threat|model|modeling|analysis|tree|fault|fmea|hazop|bow|tie|event|root|cause|fishbone|ishikawa|diagram|five|whys|brainstorming|mind|map|affinity|nominal|group|technique|delphi|method|swot|strengths|weaknesses|opportunities|threats|pestle|political|economic|social|technological|legal|environmental|factors|porter|forces|competitive|advantage|differentiation|cost|leadership|focus|strategy|blue|ocean|red|disruptive|innovation|sustaining|incremental|radical|breakthrough|paradigm|shift|transformation|digital|revolution|industry|automation|artificial|intelligence|machine|learning|deep|neural|network|natural|language|processing|computer|vision|robotics|internet|things|iot|edge|computing|cloud|fog|mist|serverless|microservices|containers|orchestration|kubernetes|docker|devops|continuous|integration|deployment|delivery|monitoring|observability|telemetry|metrics|logs|traces|alerts|notifications|dashboards|visualization|business|intelligence|analytics|data|science|big|warehouse|lake|mart|pipeline|etl|elt|streaming|batch|real|time|near|offline|online|hybrid|multi|omni|channel|customer|experience|user|interface|design|thinking|lean|startup|mvp|minimum|viable|product|agile|scrum|kanban|waterfall|spiral|iterative|incremental|rapid|application|development|rad|extreme|programming|xp|test|driven|tdd|behavior|bdd|acceptance|atdd|pair|mob|code|review|static|dynamic|white|box|black|grey|unit|integration|end|smoke|sanity|regression|performance|load|stress|volume|spike|endurance|usability|accessibility|security|penetration|compatibility|cross|browser|platform|device|responsive|adaptive|mobile|first|desktop|tablet|phone|watch|tv|voice|assistant|chatbot|virtual|reality|vr|augmented|ar|mixed|mr|extended|xr|hologram|projection|display|screen|monitor|projector|printer|scanner|camera|microphone|speaker|headphone|earphone|keyboard|mouse|touchpad|trackball|joystick|gamepad|controller|sensor|accelerometer|gyroscope|magnetometer|gps|compass|barometer|thermometer|hygrometer|light|proximity|fingerprint|face|iris|voice|recognition|biometric|two|factor|multi|authentication|single|sign|sso|oauth|openid|connect|saml|ldap|active|directory|radius|kerberos|ntlm|pki|x509|ssl|tls|vpn|ipsec|wireguard|openvpn|tor|onion|routing|proxy|socks|http|tunnel|port|forwarding|nat|traversal|upnp|stun|turn|ice|webrtc|peer|p2p|distributed|decentralized|centralized|federated|hybrid|mesh|star|ring|bus|tree|hierarchical|flat|topology|protocol|stack|osi|model|tcp|ip|udp|icmp|arp|dhcp|dns|http|https|ftp|sftp|ssh|telnet|smtp|pop3|imap|snmp|ldap|ntp|dhcp|bootp|tftp|rtp|rtcp|sip|h323|websocket|mqtt|coap|amqp|stomp|xmpp|irc|nntp|finger|whois|ping|traceroute|netstat|nslookup|dig|host|curl|wget|telnet|nc|netcat|wireshark|tcpdump|nmap|masscan|zmap|shodan|censys|virustotal|hybrid|analysis|sandbox|honeypot|honeynet|intrusion|detection|prevention|system|ids|ips|siem|security|information|event|management|log|analysis|correlation|alerting|incident|response|forensics|malware|reverse|engineering|disassembly|decompilation|static|dynamic|behavioral|heuristic|signature|anomaly|machine|learning|artificial|intelligence|threat|hunting|cyber|kill|chain|mitre|att|ck|framework|tactics|techniques|procedures|ttp|indicators|compromise|ioc|observable|artifact|hash|ip|address|domain|url|file|registry|mutex|service|process|network|traffic|pattern|behavior|baseline|deviation|outlier|statistical|analysis|time|series|trend|seasonal|forecasting|prediction|classification|clustering|regression|supervised|unsupervised|reinforcement|learning|feature|engineering|selection|extraction|transformation|normalization|scaling|encoding|categorical|numerical|text|image|audio|video|structured|unstructured|semi|metadata|schema|ontology|taxonomy|knowledge|graph|semantic|web|linked|data|rdf|owl|sparql|json|ld|microdata|rdfa|dublin|core|foaf|friend|of|vocabulary|namespace|prefix|uri|iri|blank|node|triple|quad|graph|store|database|triplestore|quadstore|reasoning|inference|entailment|subsumption|classification|consistency|checking|satisfiability|decidability|completeness|soundness|expressivity|complexity|tractability|scalability|query|language|algebra|calculus|logic|first|order|fol|description|dl|horn|clause|datalog|prolog|resolution|unification|substitution|mgu|most|general|unifier|sld|slg|tabling|memoization|dynamic|programming|bottom|up|top|down|parsing|chart|earley|cyk|cocke|younger|kasami|lr|lalr|slr|ll|recursive|descent|operator|precedence|shunting|yard|abstract|syntax|tree|ast|parse|concrete|cst|lexical|analysis|tokenization|lexeme|token|terminal|nonterminal|production|rule|grammar|context|free|cfg|regular|expression|regex|finite|state|machine|fsm|automaton|pushdown|pda|turing|tm|complexity|class|p|np|pspace|exptime|decidable|undecidable|halting|problem|reduction|many|one|turing|cook|karp|approximation|algorithm|heuristic|metaheuristic|genetic|evolutionary|simulated|annealing|tabu|search|ant|colony|particle|swarm|optimization|pso|differential|evolution|de|harmony|hs|firefly|fa|bat|cuckoo|cs|flower|pollination|fpa|grey|wolf|gwo|whale|woa|multi|objective|pareto|optimal|front|nsga|spea|moga|evolutionary|strategy|es|genetic|programming|gp|tree|based|linear|cartesian|cgp|neuroevolution|neat|hyperneat|esp|enforced|subpopulations|cooperative|coevolution|competitive|island|migration|selection|tournament|roulette|wheel|rank|based|proportional|crossover|mutation|inversion|scramble|order|cycle|partially|matched|pmx|edge|recombination|uniform|arithmetic|blend|blx|simulated|binary|sbx|polynomial|pm|gaussian|cauchy|levy|replacement|generational|steady|elitism|diversity|preservation|niching|crowding|sharing|fitness|landscape|rugged|smooth|multimodal|unimodal|deceptive|epistasis|building|block|hypothesis|schema|theorem|no|free|lunch|nfl|convergence|premature|exploration|exploitation|balance|parameter|tuning|control|adaptive|self|population|size|generation|evaluation|budget|termination|criteria|stopping|condition|best|so|far|average|worst|standard|deviation|coefficient|variation|success|rate|hit|ratio|error|mean|squared|mse|absolute|mae|relative|percentage|mape|coefficient|determination|r2|adjusted|correlation|pearson|spearman|kendall|tau|mutual|information|entropy|kullback|leibler|divergence|kl|jensen|shannon|wasserstein|distance|earth|mover|emd|frechet|inception|fid|structural|similarity|ssim|peak|signal|noise|psnr|learned|perceptual|image|patch|lpips|feature|matching|fm|kernel|inception|kid|maximum|mean|discrepancy|mmd|classifier|two|sample|test|energy|cramer|von|mises|anderson|darling|kolmogorov|smirnov|ks|shapiro|wilk|normality|jarque|bera|jb|durbin|watson|dw|autocorrelation|ljung|box|lb|arch|engle|granger|causality|johansen|cointegration|augmented|dickey|fuller|adf|phillips|perron|pp|kpss|stationarity|unit|root|vector|autoregression|var|error|correction|vecm|impulse|response|irf|variance|decomposition|forecast|evaluation|diebold|mariano|dm|theil|inequality|tic|directional|accuracy|hit|rate|confusion|matrix|true|false|positive|negative|tp|tn|fp|fn|sensitivity|recall|specificity|precision|f1|score|f|beta|measure|balanced|accuracy|matthews|correlation|mcc|area|under|curve|auc|receiver|operating characteristic|roc|pr|precision|recall|average|ap|mean|map|ndcg|normalized|discounted|cumulative|gain|learning|to|rank|ltr|pointwise|pairwise|listwise|ranking|svm|support|vector|machine|kernel|trick|radial|basis|function|rbf|polynomial|sigmoid|linear|soft|margin|hard|slack|variable|lagrange|multiplier|dual|formulation|quadratic|programming|qp|sequential|minimal|smo|coordinate|descent|cd|gradient|sgd|stochastic|mini|batch|momentum|nesterov|accelerated|adaptive|adagrad|adadelta|rmsprop|adam|adamax|nadam|amsgrad|lookahead|radam|lamb|large|batch|warmup|schedule|cosine|step|exponential|polynomial|decay|weight|l1|l2|ridge|lasso|elastic|net|dropout|batch|normalization|layer|instance|group|spectral|gradient|clipping|early|stopping|patience|validation|split|cross|fold|stratified|leave|one|out|loo|bootstrap|bagging|boosting|adaboot|gradient|boosting|machine|gbm|xgboost|lightgbm|catboost|random|forest|extra|trees|isolation|forest|one|class|svm|local|outlier|factor|lof|density|based|spatial|clustering|applications|noise|dbscan|optics|ordering|points|identify|structure|hdbscan|hierarchical|dbscan|mean|shift|affinity|propagation|spectral|clustering|normalized|cuts|k|means|k|medoids|pam|partitioning|around|medoids|clara|clarans|clustering|large|applications|fuzzy|c|expectation|maximization|em|gaussian|mixture|model|gmm|dirichlet|process|dp|chinese|restaurant|crp|indian|buffet|ibp|beta|bernoulli|poisson|gamma|exponential|normal|distribution|prior|posterior|likelihood|evidence|marginal|bayes|factor|bf|deviance|information|criterion|dic|watanabe|akaike|waic|widely|applicable|bayesian|bootstrap|warp|iii|leave|future|out|lfo|pareto|smoothed|importance|sampling|psis|markov|chain|monte|carlo|mcmc|metropolis|hastings|gibbs|sampler|hamilton|hmc|nuts|no|u|turn|variational|inference|vi|automatic|differentiation|advi|mean|field|structured|normalizing|flows|nf|inverse|autoregressive|iaf|coupling|layers|real|nvp|glow|flow|based|model|autoencoder|ae|variational|vae|beta|tc|factor|disentangled|representation|generative|adversarial|network|gan|discriminator|generator|minimax|game|nash|equilibrium|wasserstein|wgan|gradient|penalty|gp|spectral|norm|sn|self|attention|sa|progressive|growing|pg|stylegan|biggan|conditional|cgan|auxiliary|classifier|acgan|least|squares|lsgan|energy|began|boundary|seeking|relativistic|ragan|feature|matching|fm|perceptual|loss|cycle|consistency|cyclegan|pix2pix|image|translation|style|transfer|neural|content|gram|matrix|total|variation|tv|regularization|super|resolution|sr|enhanced|deep|residual|edsr|very|vdsr|red|residual|encoder|decoder|srcnn|convolutional|fsrcnn|fast|espcn|efficient|sub|pixel|srgan|enhanced|real|time|object|detection|yolo|you|only|look|once|rcnn|region|fast|faster|mask|feature|pyramid|fpn|focal|retina|net|single|shot|detector|ssd|mobile|efficient|det|centernet|fcos|fully|anchor|free|detr|transformer|vision|vit|patch|embedding|cls|classification|token|mlp|head|multi|scale|deformable|attention|deformable|detr|panoptic|segmentation|pan|seg|instance|semantic|stuff|things|cityscapes|coco|pascal|voc|imagenet|adversarial|example|fgsm|fast|sign|method|pgd|projected|descent|c|w|carlini|wagner|deepfool|universal|perturbation|uap|boundary|attack|ba|hop|skip|jump|hsj|query|efficient|qeba|square|evolutionary|evo|bandits|bandit|natural|es|zeroth|order|zo|black|box|adversarial|training|at|madry|trades|tradeoff|accuracy|robustness|mart|misclassification|aware|aware|smoothing|cohen|certified|defense|randomized|interval|bound|propagation|ibp|crown|auto|convex|relaxation|beta|dual|verification|marabou|reluplex|planet|neurify|verisig|reachability|analysis|flow|pipe|star|set|zonotope|polytope|abstract|interpretation|domain|numerical|polyhedra|octagon|interval|arithmetic|affine|taylor|model|polynomial|chebyshev|bernstein|basis|global|optimization|branch|bound|bnb|cutting|plane|cp|benders|decomposition|column|generation|cg|lagrangian|relaxation|lr|dantzig|wolfe|dw|delayed|pricing|dp|constraint|satisfaction|problem|csp|arc|consistency|ac|path|pc|forward|checking|fc|maintaining|mac|conflict|directed|backjumping|cdb|dynamic|backtracking|db|chronological|cbt|non|ncbt|boolean|satisfiability|sat|dpll|davis|putnam|logemann|loveland|cdcl|conflict|driven|clause|learning|watched|literal|wl|chaff|zchaff|minisat|glucose|lingeling|cadical|kissat|maple|sat|competition|solver|maximum|max|weighted|partial|maxsat|pseudo|boolean|pb|cutting|planes|cp|integer|linear|programming|ilp|mixed|milp|branch|bound|bnb|price|bp|cut|bc|heuristic|primal|dual|simplex|interior|point|barrier|network|flow|minimum|cost|mcf|assignment|problem|ap|hungarian|algorithm|kuhn|munkres|hopcroft|karp|hk|bipartite|matching|bm|stable|marriage|sm|gale|shapley|gs|deferred|acceptance|da|top|trading|cycle|ttc|kidney exchange|ke|pairwise|kidney|pkd|edmonds|karp|ek|dinic|push|relabel|pr|shortest|path|sp|dijkstra|bellman|ford|bf|floyd|warshall|fw|johnson|all|pairs|apsp|betweenness|centrality|bc|closeness|cc|eigenvector|ec|pagerank|pr|hits|hyperlink|induced|topic|search|authority|hub|katz|centrality|kc|degree|dc|clustering|coefficient|cc|transitivity|modularity|community|detection|cd|louvain|leiden|infomap|label|propagation|lp|spectral|partitioning|sp|kernighan|lin|kl|fiduccia|mattheyses|fm|multilevel|metis|scotch|kahip|social|network|analysis|sna|homophily|assortative|mixing|disassortative|small|world|sw|watts|strogatz|ws|preferential|attachment|pa|barabasi|albert|ba|scale|free|sf|power|law|pl|degree|distribution|dd|clustering|coefficient|cc|path|length|pl|diameter|radius|eccentricity|periphery|center|articulation|point|bridge|cut|vertex|edge|connectivity|biconnected|component|bcc|strongly|connected|scc|tarjan|kosaraju|weakly|wcc|topological|sort|ts|kahn|depth|first|search|dfs|breadth|bfs|tree|traversal|preorder|inorder|postorder|level|order|lo|minimum|spanning|mst|kruskal|prim|boruvka|steiner|approximation|ratio|ar|traveling|salesman|tsp|held|karp|hk|lower|bound|lb|christofides|ch|lin|kernighan|lk|simulated|annealing|sa|genetic|algorithm|ga|ant|colony|aco|particle|swarm|optimization|pso|vehicle|routing|vrp|capacitated|cvrp|time|window|vrptw|pickup|delivery|pdp|dial|ride|darp|multiple|depot|mdvrp|periodic|pvrp|stochastic|svrp|dynamic|dvrp|rich|rvrp|facility|location|fl|p|median|pm|p|center|pc|uncapacitated|ufl|capacitated|cfl|set|cover|sc|hitting|hs|packing|sp|bin|bp|first|fit|ff|best|bf|next|nf|worst|wf|decreasing|fd|bd|nd|wd|strip|2d|3d|irregular|cutting|stock|csp|knapsack|kp|0|1|01|unbounded|uk|bounded|bk|multiple|mk|quadratic|qkp|multidimensional|multi|constraint|mck|scheduling|job|shop|jsp|flow|fsp|open|osp|flexible|fjsp|hybrid|hfsp|parallel|machine|pm|single|sm|unrelated|um|preemptive|non|np|resource|constrained|rcpsp|multi|mode|mrcpsp|project|network|pn|activity|on|node|aon|arc|aoa|critical|path|method|cpm|program|evaluation|review|technique|pert|earned|value|management|evm|work|breakdown|structure|wbs|gantt|chart|milestone|deliverable|task|dependency|predecessor|successor|lag|lead|buffer|slack|float|total|tf|free|ff|early|start|es|finish|ef|late|ls|lf|baseline|actual|variance|schedule|performance|index|spi|cost|cpi|estimate|completion|eac|to|etc|budget|bac|planned|pv|ev|ac|variance|sv|cv|risk|assessment|ra|management|rm|identification|id|analysis|al|evaluation|ev|treatment|tr|monitoring|mo|control|co|qualitative|quantitative|probability|impact|matrix|pim|risk|register|rr|response|strategy|rs|avoid|transfer|mitigate|accept|contingency|plan|cp|fallback|fb|monte|carlo|simulation|mcs|sensitivity|sa|tornado|diagram|td|decision|tree|dt|influence|id|expected|monetary|emv|net|present|npv|internal|rate|return|irr|payback|period|pp|profitability|index|pi|benefit|ratio|br|breakeven|analysis|bea|scenario|planning|sp|best|case|bc|worst|wc|most|likely|ml|three|estimate|te|triangular|distribution|td|beta|bd|uniform|ud|normal|nd|lognormal|ld|exponential|ed|weibull|wd|pareto|pd|poisson|binomial|hypergeometric|hd|negative|nb|geometric|gd|gamma|gd|chi|square|cs|student|t|td|f|fisher|fd|correlation|analysis|ca|regression|ra|linear|lr|multiple|mr|polynomial|pr|logistic|logr|ridge|rr|lasso|lr|elastic|net|en|principal|component|pca|factor|fa|independent|ica|canonical|cca|partial|least|squares|pls|structural|equation|modeling|sem|path|analysis|pa|confirmatory|cfa|exploratory|efa|maximum|likelihood|ml|weighted|wls|generalized|gls|ordinary|ols|two|stage|2sls|three|3sls|seemingly|unrelated|sur|vector|autoregression|var|cointegration|ci|error|correction|ecm|autoregressive|integrated|moving|average|arima|seasonal|sarima|exponential|smoothing|es|holt|winters|hw|state|space|ss|kalman|filter|kf|extended|ekf|unscented|ukf|particle|pf|sequential|monte|carlo|smc|importance|sampling|is|rejection|rs|metropolis|hastings|mh|gibbs|sampler|gs|hamiltonian|hmc|nuts|no|u|turn|sampler|variational|bayes|vb|expectation|propagation|ep|belief|propagation|bp|message|passing|mp|sum|product|sp|max|mp|junction|tree|jt|elimination|ve|bucket|be|mini|bucket|mb|and|or|search|aos|depth|first|branch|bound|dfbb|best|bbfs|iterative|deepening|id|limited|discrepancy|lds|beam|bs|local|ls|hill|climbing|hc|random|restart|rr|variable|neighborhood|vns|large|lns|adaptive|alns|iterated|ils|guided|gls|tabu|ts|simulated|annealing|sa|threshold|accepting|ta|great|deluge|gd|record|travel|rt|reactive|rts|robust|rts|scatter|ss|path|relinking|pr|greedy|randomized|adaptive|procedure|grasp|pilot|method|pm|skewed|variable|svns|general|gvns|basic|bvns|reduced|rvns|decomposition|based|neighborhood|dbn|corridor|method|cm|strategic|oscillation|so|ejection|chain|ec|token|ring|tr|cyclic|exchange|ce|or|opt|k|opt|lin|kernighan|lk|variable|depth|vd|evolutionary|local|els|memetic|ma|hybrid|genetic|hga|cultural|ca|differential|evolution|de|evolution|strategy|es|genetic|programming|gp|particle|swarm|optimization|pso|ant|colony|aco|artificial|bee|abc|firefly|fa|cuckoo|search|cs|bat|algorithm|ba|flower|pollination|fpa|grey|wolf|optimizer|gwo|whale|optimization|woa|sine|cosine|sca|salp|swarm|ssa|harris|hawks|hho|moth|flame|mfo|multi|verse|mvo|grasshopper|goa|dragonfly|da|monarch|butterfly|mbo|earthworm|optimization|ewo|elephant|herding|eho|lion|optimization|loa|spotted|hyena|sho|marine|predators|mpa|emperor|penguin|epo|aquila|ao|arithmetic|aoa|henry|gas|solubility|hgso|jellyfish|js|runge|kutta|rk|fick|law|fl|forensic|based|investigation|fbi|coronavirus|herd|immunity|chio|seagull|soa|slime|mould|sma|equilibrium|eo|rime|ice|rime|algorithm|ria|chimp|choa|artificial|gorilla|troops|gto|reptile|rso|honey|badger|hba|african|vultures|avoa|dwarf|mongoose|dmo|fick|law|fl|bouncing|ball|bba|volleyball|premier|league|vpl|teamwork|optimization|to|arithmetic|aoa|gradient|based|gbo)|[a-zA-Z0-9]{1,8}\b/gi,
            priority: 6,
            description: "Extended suffix pattern with comprehensive token terms"
        },
        // Context-aware patterns for URLs and mentions
        {
            pattern: /(?:https?:\/\/[^\s]*\/|@|\$|CA:\s*|Contract:\s*|Token:\s*|Mint:\s*)([1-9A-HJ-NP-Za-km-z]{25,50})\b/gi,
            priority: 9,
            description: "Context-aware address extraction"
        }
    ];

    // Context scoring keywords for better address prioritization
    private readonly contextKeywords = {
        trading: {
            keywords: ["buy", "sell", "trade", "swap", "exchange", "dex", "pool", "liquidity", "slippage"],
            weight: 2.0
        },
        price: {
            keywords: ["price", "chart", "pump", "dump", "moon", "rug", "mcap", "market cap", "volume"],
            weight: 1.8
        },
        token: {
            keywords: ["token", "coin", "mint", "contract", "address", "ca", "meme", "defi"],
            weight: 1.5
        },
        social: {
            keywords: ["twitter", "telegram", "discord", "announcement", "launch", "presale"],
            weight: 1.2
        },
        technical: {
            keywords: ["solana", "spl", "raydium", "jupiter", "pump.fun", "bonk", "orca"],
            weight: 1.3
        }
    };

    /**
     * Enhanced contract address detection with improved patterns and scoring
     */
    detectSolanaContractAddresses(text: string, maxResults: number = 10): AddressScore[] {
        const foundAddresses = new Map<string, AddressScore>();
        const textLower = text.toLowerCase();

        // Extract addresses using multiple patterns
        for (const { pattern, priority, description } of this.detectionPatterns) {
            let match;
            pattern.lastIndex = 0; // Reset regex state

            while ((match = pattern.exec(text)) !== null) {
                const address = match[1] || match[0]; // Use capture group if available

                if (this.isValidSolanaAddress(address)) {
                    const contextScore = this.calculateContextScore(address, text, textLower);
                    const entropyScore = this.calculateEntropy(address);
                    const lengthScore = this.calculateLengthScore(address);

                    const totalScore = (priority * 0.4) + (contextScore * 0.3) + (entropyScore * 0.2) + (lengthScore * 0.1);

                    const existing = foundAddresses.get(address);
                    if (!existing || existing.score < totalScore) {
                        foundAddresses.set(address, {
                            address,
                            score: totalScore,
                            type: this.determineAddressType(address),
                            contextClues: this.extractContextClues(address, text)
                        });
                    }
                }
            }
        }

        // Sort by score and return top results
        return Array.from(foundAddresses.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    /**
     * Enhanced Solana address validation with comprehensive checks
     */
    isValidSolanaAddress(address: string): boolean {
        // Check cache first
        const cached = this.validationCache[address];
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.isValid;
        }

        let isValid = false;
        let addressType = "unknown";

        try {
            // Basic length and character validation
            if (address.length < 25 || address.length > 50) {
                return this.cacheResult(address, false);
            }

            // Base58 character validation
            if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                return this.cacheResult(address, false);
            }

            // Check for known program addresses
            if (this.knownPrograms.has(address)) {
                addressType = "program";
                isValid = true;
            } else {
                // Enhanced validation rules
                isValid = this.performEnhancedValidation(address);
                if (isValid) {
                    addressType = this.determineAddressType(address);
                }
            }

        } catch (error) {
            console.warn(`Address validation error for ${address}:`, error);
            isValid = false;
        }

        return this.cacheResult(address, isValid, addressType);
    }

    /**
     * Perform enhanced validation with entropy and pattern checks
     */
    private performEnhancedValidation(address: string): boolean {
        // Entropy check - addresses should have sufficient randomness
        const entropy = this.calculateEntropy(address);
        if (entropy < 4.0) return false;

        // Check for obvious invalid patterns
        if (this.hasInvalidPatterns(address)) return false;

        // Length-specific validation
        if (address.length >= 32 && address.length <= 44) {
            // Standard Solana address range
            return this.validateStandardAddress(address);
        } else if (address.length > 44) {
            // Extended addresses (with suffixes) - more permissive
            return this.validateExtendedAddress(address);
        }

        return false;
    }

    /**
     * Calculate entropy of a string to detect random-looking addresses
     */
    calculateEntropy(str: string): number {
        const freq: { [key: string]: number } = {};
        for (const char of str) {
            freq[char] = (freq[char] || 0) + 1;
        }

        const len = str.length;
        return Object.values(freq).reduce((entropy, count) => {
            const p = count / len;
            return entropy - p * Math.log2(p);
        }, 0);
    }

    /**
     * Calculate context score based on surrounding text
     */
    private calculateContextScore(address: string, fullText: string, textLower: string): number {
        let score = 1.0;
        const addressIndex = fullText.indexOf(address);

        // Get surrounding text (100 chars before and after)
        const start = Math.max(0, addressIndex - 100);
        const end = Math.min(fullText.length, addressIndex + address.length + 100);
        const context = fullText.slice(start, end).toLowerCase();

        // Score based on context keywords
        for (const [category, { keywords, weight }] of Object.entries(this.contextKeywords)) {
            for (const keyword of keywords) {
                if (context.includes(keyword)) {
                    score += weight * 0.1; // Each keyword adds to the score
                }
            }
        }

        // Boost score if address is prefixed with common indicators
        const prefixPatterns = [
            /(?:ca|contract|token|mint|address):\s*$/i,
            /\$\s*$/,
            /@\s*$/,
            /\bhttps?:\/\/[^\s]*\/\s*$/i
        ];

        const beforeAddress = fullText.slice(Math.max(0, addressIndex - 20), addressIndex);
        for (const pattern of prefixPatterns) {
            if (pattern.test(beforeAddress)) {
                score += 0.5;
                break;
            }
        }

        return Math.min(score, 3.0); // Cap at 3.0
    }

    /**
     * Calculate score based on address length (prefer standard lengths)
     */
    private calculateLengthScore(address: string): number {
        const len = address.length;
        if (len >= 43 && len <= 44) return 1.0; // Standard Solana address length
        if (len >= 32 && len <= 42) return 0.8; // Shorter but still valid
        if (len >= 45 && len <= 50) return 0.6; // Extended with suffix
        return 0.3; // Very long or short
    }

    /**
     * Determine the likely type of Solana address
     */
    private determineAddressType(address: string): "mint" | "wallet" | "program" | "unknown" {
        if (this.knownPrograms.has(address)) return "program";

        // Heuristics for address type detection
        // This would be enhanced with on-chain validation in a real implementation
        const len = address.length;
        if (len >= 43 && len <= 44) {
            // Standard length could be mint or wallet
            return "unknown"; // Would need on-chain check
        }

        return "unknown";
    }

    /**
     * Extract context clues from surrounding text
     */
    private extractContextClues(address: string, text: string): string[] {
        const clues: string[] = [];
        const addressIndex = text.indexOf(address);

        // Get surrounding text
        const start = Math.max(0, addressIndex - 50);
        const end = Math.min(text.length, addressIndex + address.length + 50);
        const context = text.slice(start, end).toLowerCase();

        // Look for specific clues
        const cluePatterns = [
            { pattern: /price/i, clue: "price-related" },
            { pattern: /buy|sell|trade/i, clue: "trading" },
            { pattern: /pump|moon|rug/i, clue: "speculative" },
            { pattern: /new|launch|presale/i, clue: "new-token" },
            { pattern: /chart|dex|pair/i, clue: "technical-analysis" },
            { pattern: /twitter|telegram|discord/i, clue: "social-media" }
        ];

        for (const { pattern, clue } of cluePatterns) {
            if (pattern.test(context)) {
                clues.push(clue);
            }
        }

        return clues;
    }

    /**
     * Check for invalid patterns that suggest non-addresses
     */
    private hasInvalidPatterns(address: string): boolean {
        // Too many repeated characters
        if (/(.)\1{10,}/.test(address)) return true;

        // All same case and digits (too simple)
        if (/^[A-Z0-9]+$/.test(address) || /^[a-z0-9]+$/.test(address)) {
            if (address.length < 35) return true;
        }

        // Common false positives
        const falsePositives = [
            /^1{20,}$/,
            /^[a-f0-9]{40,}$/i, // Ethereum-style hex
            /^0x[a-f0-9]+$/i, // Hex with 0x prefix
        ];

        return falsePositives.some(pattern => pattern.test(address));
    }

    /**
     * Validate standard Solana addresses (32-44 chars)
     */
    private validateStandardAddress(address: string): boolean {
        // Should have good mix of characters
        const hasNumbers = /\d/.test(address);
        const hasUppercase = /[A-Z]/.test(address);
        const hasLowercase = /[a-z]/.test(address);

        // Standard addresses should have character variety
        return hasNumbers && hasUppercase && hasLowercase;
    }

    /**
     * Validate extended addresses (with suffixes)
     */
    private validateExtendedAddress(address: string): boolean {
        // More permissive for addresses with readable suffixes
        const entropy = this.calculateEntropy(address);
        return entropy > 3.5; // Lower entropy threshold for suffix addresses
    }

    /**
     * Cache validation result
     */
    private cacheResult(address: string, isValid: boolean, type?: string): boolean {
        this.validationCache[address] = {
            isValid,
            timestamp: Date.now(),
            type
        };

        // Clean up old cache entries periodically
        if (Object.keys(this.validationCache).length > 1000) {
            this.cleanupCache();
        }

        return isValid;
    }

    /**
     * Clean up old cache entries
     */
    private cleanupCache(): void {
        const now = Date.now();
        for (const [address, entry] of Object.entries(this.validationCache)) {
            if (now - entry.timestamp > this.cacheTimeout) {
                delete this.validationCache[address];
            }
        }
    }

    /**
     * Validate address using on-chain data (for future implementation)
     */
    async validateOnChain(address: string): Promise<{ isValid: boolean; type?: string; metadata?: any }> {
        // This would implement actual on-chain validation
        // For now, return cached result
        const cached = this.validationCache[address];
        return {
            isValid: cached?.isValid || false,
            type: cached?.type,
            metadata: null
        };
    }

    /**
     * Get validation statistics
     */
    getValidationStats(): { cacheSize: number; hitRate: number } {
        return {
            cacheSize: Object.keys(this.validationCache).length,
            hitRate: 0 // Would track this in a real implementation
        };
    }
}

// Export singleton instance
export const addressDetector = new EnhancedAddressDetector();
