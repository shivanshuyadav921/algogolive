/* ═══════════════════════════════════════════════════════
   Plugin Registry — Central algorithm plugin manager
   ═══════════════════════════════════════════════════════ */

class PluginRegistry {
    constructor() {
        this.plugins = new Map();
        this.categories = new Map();
    }

    /** Register a plugin conforming to the standard interface */
    register(plugin) {
        if (!plugin.id || !plugin.name || !plugin.category) {
            console.warn('Plugin missing required fields (id, name, category):', plugin);
            return;
        }
        this.plugins.set(plugin.id, plugin);

        if (!this.categories.has(plugin.category)) {
            this.categories.set(plugin.category, {
                name: plugin.categoryLabel || plugin.category,
                icon: plugin.categoryIcon || '📦',
                plugins: []
            });
        }
        this.categories.get(plugin.category).plugins.push(plugin.id);
    }

    /** Get plugin by exact ID */
    get(id) {
        return this.plugins.get(id) || null;
    }

    /** Fuzzy search by name, aliases, or ID — returns best match */
    find(query) {
        if (!query) return null;
        const q = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        if (!q) return null;

        // 1. Exact ID match
        if (this.plugins.has(q)) return this.plugins.get(q);

        let bestMatch = null;
        let bestScore = 0;

        for (const plugin of this.plugins.values()) {
            let score = 0;
            const name = plugin.name.toLowerCase();
            const id = plugin.id.toLowerCase().replace(/_/g, ' ');

            // Exact name match
            if (name === q) { score = 100; }
            // Name starts with query
            else if (name.startsWith(q)) { score = 80; }
            // Name contains query
            else if (name.includes(q)) { score = 60; }
            // ID match
            else if (id === q || id.replace(/ /g, '') === q.replace(/ /g, '')) { score = 90; }
            else if (id.includes(q)) { score = 55; }

            // Check aliases
            if (plugin.aliases) {
                for (const alias of plugin.aliases) {
                    const a = alias.toLowerCase();
                    if (a === q) { score = Math.max(score, 95); break; }
                    if (a.startsWith(q) || q.startsWith(a)) { score = Math.max(score, 70); }
                    if (a.includes(q) || q.includes(a)) { score = Math.max(score, 50); }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = plugin;
            }
        }

        return bestScore >= 40 ? bestMatch : null;
    }

    /** Search plugins — returns array of {plugin, score} */
    search(query) {
        if (!query) return [];
        const q = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        const results = [];

        for (const plugin of this.plugins.values()) {
            let score = 0;
            const name = plugin.name.toLowerCase();
            const id = plugin.id.toLowerCase().replace(/_/g, ' ');

            if (name === q) score = 100;
            else if (name.startsWith(q)) score = 80;
            else if (name.includes(q)) score = 60;
            else if (id.includes(q)) score = 55;

            if (plugin.aliases) {
                for (const alias of plugin.aliases) {
                    const a = alias.toLowerCase();
                    if (a === q) { score = Math.max(score, 95); break; }
                    if (a.includes(q) || q.includes(a)) score = Math.max(score, 50);
                }
            }

            // Category match
            if (plugin.category.toLowerCase().includes(q)) {
                score = Math.max(score, 30);
            }

            if (score > 0) results.push({ plugin, score });
        }

        return results.sort((a, b) => b.score - a.score);
    }

    /** Get all plugins as array */
    getAll() {
        return Array.from(this.plugins.values());
    }

    /** Get plugins by category */
    getByCategory(category) {
        const cat = this.categories.get(category);
        if (!cat) return [];
        return cat.plugins.map(id => this.plugins.get(id)).filter(Boolean);
    }

    /** Get all categories with metadata */
    getCategories() {
        const result = [];
        for (const [key, value] of this.categories.entries()) {
            result.push({
                id: key,
                name: value.name,
                icon: value.icon,
                count: value.plugins.length
            });
        }
        return result;
    }
}

export const registry = new PluginRegistry();
