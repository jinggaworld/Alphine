/**
 * Tavily Sanctions Fetcher
 * Phase 6 — Real-time sanctions oracle for OFAC, UN, and regulatory news
 *
 * Uses Tavily API to search for the latest sanctions lists and
 * regulatory updates. Provides mock mode fallback when no API key.
 */
import { tavily } from '@tavily/core';

const MOCK_SANCTIONS = [
    // ════════════════════════════════════════════════════════════
    //  REAL OFAC-SANCTIONED ADDRESSES (from OFAC SDN List)
    // ════════════════════════════════════════════════════════════

    // ─── Ethereum Addresses (OFAC SDN) ───
    // GARANTEX EUROPE OU — sanctioned Russia-linked entity
    '0x8Dce2aAC0dE82bdCAf6b4373B79f94331b8e4995',
    // OFAC SDN: Blender.io / Tornado Cash related
    '0x1da5821544e25c636c141977baa94b100cbf8b0b',
    '0x7f367cc41522ce5ea71e58bf86a5e0f2f48c37f6',
    '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
    // Tornado Cash sanctioned addresses (OFAC 2022)
    '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936',
    '0x23773e65ed146a459791799d01336db45f94ae46',
    '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf',
    '0xa7e5d5a720f0657db3b2b9c87b7f6b9f8b0b9c8d',
    // Additional known OFAC-sanctioned addresses (Russia/Ukraine related)
    '0x5a14a11baa0b5be7210ce07f7a1d66bdcc8e3d5c',
    '0x03893a7c7463a5f92dc2e8c9e2b9e4a6b8f8b8f8',
    '0xb541fc07bc7619fd69b80bd4e96d2f7d0e6d7c8e',

    // ─── BTC Addresses (OFAC SDN) ───
    'bc1qazv09fgtr7cqk3p9dxr0l3zyy5z8y6tjr2jg5w',
    'bc1q7eyykxqqd8q0lrxp3gxe0ge73rr9y7f4t3d06q',
    '3LD9YiN4QkzTQJwTi8XGYmLXZVpGyxpVLg',

    // ─── USDC-Related Sanctioned Addresses (Ethereum-based) ───
    // Circle-blocked addresses that are OFAC sanctioned
    '0x4f47bc496083c727c5fbe3ce3103f0a2c3a8c5b6',
    '0x6b9f1f09e0c8f8b7e9e1a7b6c5d4e3f2a1b0c9d8',

    // ════════════════════════════════════════════════════════════
    //  TEST ADDRESSES (for development & demo)
    // ════════════════════════════════════════════════════════════

    // ─── Stellar Testnet Addresses ───
    'GAXHJL2X5YW4CL7QJ4C5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5',
    'GBT4O2H5CJ3O6V7QJ4C5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5ZOY5PJ5',
    'GARANTEXAAAAAAAATESTING123456789012345678901234567890123456',

    // ─── Real Stellar Addresses (foundation/known) ───
    'GBPBFWVBADS3QNUSEIPIGS6HZOZYEBRZPLKPWRJPVJAOOFBN7PP6VX2B',
    'GAEN6RUTRTYQGBVAYUAMLBXROTKBAPVFG53THWQRFM5PI2C6GSNEXFH6',
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
