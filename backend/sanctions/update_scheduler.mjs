/**
 * Sanctions Update Scheduler
 * Phase 6 — Auto-updates sanctions Merkle tree at regular intervals
 *
 * Fetches latest sanctions data from Tavily every N minutes
 * and rebuilds the Merkle tree.
 */
export class SanctionsUpdateScheduler {
    /**
     * @param {Object} fetcher - TavilySanctionsFetcher instance
     * @param {Object} tree - MerkleTree instance
     * @param {number} intervalMinutes - Update interval in minutes (default: 30)
     */
    constructor(fetcher, tree, intervalMinutes = 30) {
        this.fetcher = fetcher;
        this.tree = tree;
        this.interval = intervalMinutes * 60 * 1000;
        this.timer = null;
        this.lastUpdate = null;
        this.updateCount = 0;
        this.lastError = null;
    }

    /**
     * Start the scheduler
     */
    start() {
        console.log(`🔄 Sanctions update scheduler started (every ${this.interval / 60000} min)`);
        this._update().catch(err => console.error('Initial update failed:', err.message));
        this.timer = setInterval(() => {
            this._update().catch(err => console.error('Scheduled update failed:', err.message));
        }, this.interval);
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('⏹️  Sanctions update scheduler stopped');
    }

    /**
     * Force an immediate update
     */
    async forceUpdate() {
        return this._update();
    }

    async _update() {
        try {
            console.log(`[${new Date().toISOString()}] Fetching sanctions data...`);
            const data = await this.fetcher.fetchLatestSanctions();

            // Always include mock addresses as baseline (ensures demo addresses work)
            const mockBaseline = this.fetcher.getMockSanctions() || [];

            const tavilyAddresses = [
                ...(data.ofac?.entries || []),
                ...(data.un?.entries || []),
            ];

            // Merge: mock baseline + any real addresses found by Tavily
            const allAddresses = [...mockBaseline, ...tavilyAddresses];

            // Rebuild the tree
            this.tree.clear();
            this.tree.addAddresses(allAddresses);
            this.tree.build();

            this.lastUpdate = new Date();
            this.updateCount++;
            this.lastError = null;

            const totalMock = mockBaseline.length;
            const totalReal = tavilyAddresses.length;
            console.log(`✅ Sanctions tree updated: ${this.tree.size} entries (${totalMock} baseline + ${totalReal} Tavily), root: ${this.tree.getRootHex()?.slice(0, 16)}...`);
        } catch (error) {
            this.lastError = error.message;
            console.error('❌ Sanctions update failed:', error.message);
        }
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            running: this.timer !== null,
            intervalMinutes: this.interval / 60000,
            lastUpdate: this.lastUpdate?.toISOString() || null,
            updateCount: this.updateCount,
            lastError: this.lastError,
            treeSize: this.tree.size,
            merkleRoot: this.tree.getRootHex(),
        };
    }
}
