/**
 * Tavily Sanctions Fetcher
 * Phase 6 — Real-time sanctions oracle for OFAC, UN, and regulatory news
 *
 * Uses Tavily API to search for the latest sanctions lists and
 * regulatory updates. Provides mock mode fallback when no API key.
 */
import { tavily } from '@tavily/core';

const MOCK_SANCTIONS = [
    // Real OFAC-sanctioned Ethereum addresses (from OFAC SDN list)
    '0x1da5821544e25c636c141977baa94b100cbf8b0b',
    '0x7f367cc41522ce5ea71e58bf86a5e0f2f48c37f6',
    '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
    // Mock Stellar addresses for testing
    'GAXHJL2X5YW4CL7QJ4C5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5',
    'GBT4O2H5CJ3O6V7QJ4C5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5',
];

export class TavilySanctionsFetcher {
    constructor(apiKey) {
        if (!apiKey) {
            console.warn('⚠️  No TAVILY_API_KEY provided — using mock sanctions list');
            this.mockMode = true;
        } else {
            this.client = tavily({ apiKey });
            this.mockMode = false;
        }
    }

    /**
     * Fetch latest sanctions data from multiple sources
     */
    async fetchLatestSanctions() {
        if (this.mockMode) {
            return this._mockSanctions();
        }

        const results = await Promise.allSettled([
            this.fetchOFACSanctions(),
            this.fetchUNSanctions(),
            this.fetchSanctionsNews(),
        ]);

        return {
            ofac: results[0].status === 'fulfilled' ? results[0].value : { entries: [], error: results[0].reason?.message },
            un: results[1].status === 'fulfilled' ? results[1].value : { entries: [], error: results[1].reason?.message },
            news: results[2].status === 'fulfilled' ? results[2].value : { articles: [], error: results[2].reason?.message },
            fetchedAt: new Date().toISOString(),
        };
    }

    async fetchOFACSanctions() {
        const response = await this.client.search(
            'OFAC SDN sanctions list cryptocurrency wallet addresses 2026',
            {
                searchDepth: 'advanced',
                maxResults: 10,
                includeAnswer: true,
                includeRawContent: true,
            }
        );

        const entries = this._extractAddresses(response);

        return {
            source: 'OFAC',
            entries,
            lastUpdated: new Date().toISOString(),
        };
    }

    async fetchUNSanctions() {
        const response = await this.client.search(
            'United Nations security council sanctions list consolidated cryptocurrency',
            {
                searchDepth: 'basic',
                maxResults: 5,
                includeAnswer: true,
            }
        );

        const entries = this._extractAddresses(response);

        return {
            source: 'UN',
            entries,
            lastUpdated: new Date().toISOString(),
        };
    }

    async fetchSanctionsNews() {
        const response = await this.client.search(
            'cryptocurrency sanctions regulatory update OFAC 2026',
            {
                searchDepth: 'advanced',
                maxResults: 5,
                includeAnswer: true,
                includeRawContent: true,
            }
        );

        return {
            source: 'News',
            articles: response.results?.map(r => ({
                title: r.title,
                url: r.url,
                content: r.content?.slice(0, 500),
                publishedDate: r.publishedDate,
            })) || [],
        };
    }

    _extractAddresses(response) {
        const entries = new Set();

        if (!response?.results) return [];

        for (const result of response.results) {
            const content = result.content || '';
            // Match Ethereum addresses
            const ethAddrs = content.match(/0x[a-fA-F0-9]{40}/g) || [];
            // Match Stellar addresses
            const stellarAddrs = content.match(/G[A-Z0-9]{55}/g) || [];

            for (const addr of [...ethAddrs, ...stellarAddrs]) {
                entries.add(addr.toLowerCase());
            }
        }

        return Array.from(entries);
    }

    _mockSanctions() {
        return {
            ofac: {
                source: 'OFAC (mock)',
                entries: MOCK_SANCTIONS,
                lastUpdated: new Date().toISOString(),
            },
            un: {
                source: 'UN (mock)',
                entries: [],
                lastUpdated: new Date().toISOString(),
            },
            news: {
                source: 'News (mock)',
                articles: [{
                    title: '[Mock] OFAC Updates Sanctions List for Cryptocurrency',
                    url: 'https://example.com/sanctions-update',
                    content: 'The Office of Foreign Assets Control has updated its sanctions list...',
                    publishedDate: new Date().toISOString(),
                }],
            },
            fetchedAt: new Date().toISOString(),
        };
    }

    getMockSanctions() {
        return MOCK_SANCTIONS;
    }
}
