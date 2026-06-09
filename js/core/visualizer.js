/* ═══════════════════════════════════════════════════════
   Visualizer Engine — Canvas rendering + playback control
   Renders arrays, trees, graphs, tables, stacks, queues, strings, grids
   ═══════════════════════════════════════════════════════ */

/** Color palette for visualization states */
export const COLORS = {
    default:    '#6366f1',
    active:     '#06b6d4',
    comparing:  '#f59e0b',
    swapping:   '#ef4444',
    sorted:     '#10b981',
    pivot:      '#ec4899',
    visited:    '#8b5cf6',
    path:       '#22d3ee',
    current:    '#06b6d4',
    found:      '#10b981',
    notfound:   '#ef4444',
    highlight:  '#f59e0b',
    bg:         '#0e0e1c',
    text:       '#e8ecf4',
    textDim:    '#8b93a8',
    line:       'rgba(255,255,255,0.12)',
    gridLine:   'rgba(255,255,255,0.06)',
    fill:       'rgba(99,102,241,0.15)',
};

export class Visualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.steps = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1.0; // multiplier
        this.playTimer = null;
        this.plugin = null;
        this.dpr = window.devicePixelRatio || 1;

        // DOM references
        this.elements = {};

        // Callbacks
        this.onStepChange = null;
    }

    /** Initialize with canvas and DOM elements */
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /** High-DPI canvas resize */
    resizeCanvas() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const w = parent.clientWidth;
        const h = parent.clientHeight || 420;
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.scale(this.dpr, this.dpr);
        this.width = w;
        this.height = h;
        if (this.steps.length > 0) this.render();
    }

    /** Load steps from a plugin */
    loadSteps(steps, plugin) {
        this.steps = steps || [];
        this.plugin = plugin;
        this.currentIndex = 0;
        this.pause();
        this.render();
        this.notifyStepChange();
    }

    /** Get current step */
    getCurrentStep() {
        return this.steps[this.currentIndex] || null;
    }

    // ─── Playback Controls ─────────────────────────

    play() {
        if (this.steps.length === 0) return;
        if (this.currentIndex >= this.steps.length - 1) {
            this.currentIndex = 0;
        }
        this.isPlaying = true;
        this.scheduleNext();
        this.notifyStepChange();
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.playTimer);
        this.notifyStepChange();
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    nextStep() {
        if (this.currentIndex < this.steps.length - 1) {
            this.currentIndex++;
            this.render();
            this.notifyStepChange();
        } else {
            this.pause();
        }
    }

    prevStep() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
            this.notifyStepChange();
        }
    }

    restart() {
        this.pause();
        this.currentIndex = 0;
        this.render();
        this.notifyStepChange();
    }

    goToEnd() {
        this.pause();
        this.currentIndex = this.steps.length - 1;
        this.render();
        this.notifyStepChange();
    }

    setSpeed(value) {
        // value 1-10, mapped to 0.25x - 4x
        const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0];
        this.speed = speeds[Math.min(value - 1, speeds.length - 1)] || 1.0;
    }

    getSpeedLabel() {
        return this.speed + 'x';
    }

    scheduleNext() {
        if (!this.isPlaying) return;
        const baseDelay = 800; // ms at 1x speed
        const delay = baseDelay / this.speed;
        this.playTimer = setTimeout(() => {
            if (this.currentIndex < this.steps.length - 1) {
                this.currentIndex++;
                this.render();
                this.notifyStepChange();
                this.scheduleNext();
            } else {
                this.pause();
            }
        }, delay);
    }

    notifyStepChange() {
        if (this.onStepChange) {
            this.onStepChange(this.currentIndex, this.steps.length, this.isPlaying);
        }
    }

    // ─── Main Render ───────────────────────────────

    render() {
        if (!this.ctx) return;
        const step = this.getCurrentStep();
        if (!step) {
            this.clearCanvas();
            this.drawCenteredText('Select an algorithm to begin visualization.', 16, COLORS.textDim);
            return;
        }

        this.clearCanvas();

        // If plugin provides a custom renderer, use it
        if (this.plugin && this.plugin.render) {
            this.plugin.render(this.ctx, step, this.width, this.height);
            return;
        }

        // Otherwise dispatch by step type
        switch (step.type) {
            case 'array': this.renderArray(step); break;
            case 'tree': this.renderTree(step); break;
            case 'graph': this.renderGraph(step); break;
            case 'table': this.renderTable(step); break;
            case 'stack': this.renderStack(step); break;
            case 'queue': this.renderQueue(step); break;
            case 'string': this.renderString(step); break;
            case 'grid': this.renderGrid(step); break;
            case 'linkedlist': this.renderLinkedList(step); break;
            case 'hashtable': this.renderHashTable(step); break;
            default: this.renderArray(step); break;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCenteredText(text, size, color) {
        this.ctx.fillStyle = color || COLORS.text;
        this.ctx.font = `500 ${size}px Inter, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.width / 2, this.height / 2);
    }

    getColor(state) {
        return COLORS[state] || COLORS.default;
    }

    // ─── Array / Bar Chart Renderer ────────────────

    renderArray(step) {
        const ctx = this.ctx;
        const values = step.data.values || step.data.array || [];
        const highlights = step.highlights || {};
        const pointers = step.data.pointers || {};
        const n = values.length;
        if (n === 0) return;

        const padding = { top: 50, bottom: 80, left: 60, right: 60 };
        const areaW = this.width - padding.left - padding.right;
        const areaH = this.height - padding.top - padding.bottom;
        const gap = Math.max(2, Math.min(6, areaW / n * 0.15));
        const barW = Math.max(8, (areaW - gap * (n - 1)) / n);
        const maxVal = Math.max(...values.map(Math.abs), 1);

        for (let i = 0; i < n; i++) {
            const x = padding.left + i * (barW + gap);
            const barH = (Math.abs(values[i]) / maxVal) * areaH;
            const y = padding.top + areaH - barH;

            // Bar color
            const state = highlights[i] || 'default';
            const color = this.getColor(state);

            // Draw bar with rounded top
            ctx.fillStyle = color;
            ctx.beginPath();
            const r = Math.min(4, barW / 4);
            ctx.moveTo(x, y + barH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, y + barH);
            ctx.closePath();
            ctx.fill();

            // Glow effect for active/comparing/swapping
            if (state !== 'default' && state !== 'sorted') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Value label on top of bar
            ctx.fillStyle = COLORS.text;
            ctx.font = `600 ${Math.min(13, barW * 0.6)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(values[i], x + barW / 2, y - 6);

            // Index label below bar
            ctx.fillStyle = COLORS.textDim;
            ctx.font = `400 ${Math.min(11, barW * 0.5)}px Inter, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText(i, x + barW / 2, padding.top + areaH + 8);
        }

        // Draw pointers (arrows below the array)
        const pointerY = padding.top + areaH + 28;
        const pointerColors = { i: '#06b6d4', j: '#f59e0b', left: '#10b981', right: '#ef4444', mid: '#ec4899', lo: '#10b981', hi: '#ef4444', k: '#8b5cf6', low: '#10b981', high: '#ef4444', start: '#10b981', end: '#ef4444' };
        for (const [name, idx] of Object.entries(pointers)) {
            if (idx < 0 || idx >= n) continue;
            const x = padding.left + idx * (barW + gap) + barW / 2;
            ctx.fillStyle = pointerColors[name] || '#a78bfa';
            ctx.font = `700 12px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            // Arrow
            ctx.beginPath();
            ctx.moveTo(x, pointerY - 6);
            ctx.lineTo(x - 5, pointerY);
            ctx.lineTo(x + 5, pointerY);
            ctx.closePath();
            ctx.fill();
            ctx.fillText(name, x, pointerY + 2);
        }
    }

    // ─── Tree Renderer ─────────────────────────────

    renderTree(step) {
        const ctx = this.ctx;
        const nodes = step.data.nodes || [];
        const highlights = step.highlights || {};
        const visitOrder = step.data.visitOrder || [];
        if (nodes.length === 0) return;

        // Compute tree layout
        const layout = this.computeTreeLayout(nodes);
        const nodeRadius = 22;
        const padding = 40;

        // Scale layout to canvas
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const n of layout) {
            minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
            minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
        }
        const scaleX = (this.width - padding * 2 - nodeRadius * 2) / Math.max(maxX - minX, 1);
        const scaleY = (this.height - padding * 2 - nodeRadius * 2) / Math.max(maxY - minY, 1);
        const scale = Math.min(scaleX, scaleY, 60);

        const offsetX = this.width / 2 - ((minX + maxX) / 2) * scale;
        const offsetY = padding + nodeRadius;

        const posMap = new Map();
        for (const n of layout) {
            posMap.set(n.id, {
                x: n.x * scale + offsetX,
                y: n.y * scale + offsetY
            });
        }

        // Draw edges
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        for (const n of nodes) {
            const parentPos = posMap.get(n.id);
            if (!parentPos) continue;
            if (n.left != null) {
                const childPos = posMap.get(n.left);
                if (childPos) {
                    const edgeState = highlights[`e_${n.id}_${n.left}`];
                    ctx.strokeStyle = edgeState ? this.getColor(edgeState) : COLORS.line;
                    ctx.beginPath();
                    ctx.moveTo(parentPos.x, parentPos.y);
                    ctx.lineTo(childPos.x, childPos.y);
                    ctx.stroke();
                }
            }
            if (n.right != null) {
                const childPos = posMap.get(n.right);
                if (childPos) {
                    const edgeState = highlights[`e_${n.id}_${n.right}`];
                    ctx.strokeStyle = edgeState ? this.getColor(edgeState) : COLORS.line;
                    ctx.beginPath();
                    ctx.moveTo(parentPos.x, parentPos.y);
                    ctx.lineTo(childPos.x, childPos.y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const n of nodes) {
            const pos = posMap.get(n.id);
            if (!pos) continue;
            const state = highlights[n.id] || 'default';
            const color = this.getColor(state);

            // Circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = state !== 'default' ? color : COLORS.bg;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Glow
            if (state === 'active' || state === 'current') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Value
            ctx.fillStyle = state !== 'default' ? '#fff' : COLORS.text;
            ctx.font = '600 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.value, pos.x, pos.y);
        }

        // Draw visit order
        if (visitOrder.length > 0) {
            ctx.fillStyle = COLORS.textDim;
            ctx.font = '500 12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Visit order: ' + visitOrder.join(' → '), 20, this.height - 20);
        }
    }

    computeTreeLayout(nodes) {
        if (nodes.length === 0) return [];
        const nodeMap = new Map();
        for (const n of nodes) nodeMap.set(n.id, n);

        // Find root (node not referenced as child)
        const children = new Set();
        for (const n of nodes) {
            if (n.left != null) children.add(n.left);
            if (n.right != null) children.add(n.right);
        }
        let root = nodes.find(n => !children.has(n.id));
        if (!root) root = nodes[0];

        const layout = [];
        let xCounter = 0;

        const inorder = (id, depth) => {
            const node = nodeMap.get(id);
            if (!node) return;
            if (node.left != null) inorder(node.left, depth + 1);
            layout.push({ id: node.id, value: node.value, x: xCounter++, y: depth });
            if (node.right != null) inorder(node.right, depth + 1);
        };

        inorder(root.id, 0);
        return layout;
    }

    // ─── Graph Renderer ────────────────────────────

    renderGraph(step) {
        const ctx = this.ctx;
        const nodes = step.data.nodes || [];
        const edges = step.data.edges || [];
        const highlights = step.highlights || {};
        if (nodes.length === 0) return;

        const padding = 60;
        const nodeRadius = 24;

        // Position nodes in a circle if no positions given
        const positions = new Map();
        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = Math.min(this.width, this.height) / 2 - padding - nodeRadius;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.x != null && node.y != null) {
                positions.set(node.id, { x: node.x, y: node.y });
            } else {
                const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
                positions.set(node.id, {
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle)
                });
            }
        }

        // Draw edges
        for (const edge of edges) {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) continue;

            const edgeKey = `e_${edge.from}_${edge.to}`;
            const state = highlights[edgeKey] || null;

            ctx.strokeStyle = state ? this.getColor(state) : COLORS.line;
            ctx.lineWidth = state ? 3 : 1.5;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            // Arrow for directed graphs
            if (edge.directed) {
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const tipX = to.x - nodeRadius * Math.cos(angle);
                const tipY = to.y - nodeRadius * Math.sin(angle);
                ctx.fillStyle = state ? this.getColor(state) : COLORS.line;
                ctx.beginPath();
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - 10 * Math.cos(angle - 0.4), tipY - 10 * Math.sin(angle - 0.4));
                ctx.lineTo(tipX - 10 * Math.cos(angle + 0.4), tipY - 10 * Math.sin(angle + 0.4));
                ctx.closePath();
                ctx.fill();
            }

            // Weight label
            if (edge.weight != null) {
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                ctx.fillStyle = COLORS.textDim;
                ctx.font = '600 11px JetBrains Mono, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Offset label slightly
                const nx = -(to.y - from.y);
                const ny = to.x - from.x;
                const len = Math.sqrt(nx * nx + ny * ny) || 1;
                ctx.fillText(edge.weight, mx + (nx / len) * 14, my + (ny / len) * 14);
            }
        }

        // Draw nodes
        for (const node of nodes) {
            const pos = positions.get(node.id);
            if (!pos) continue;
            const state = highlights[node.id] || 'default';
            const color = this.getColor(state);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = state !== 'default' ? color : COLORS.bg;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            if (state === 'active' || state === 'current' || state === 'visited') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = state !== 'default' ? '#fff' : COLORS.text;
            ctx.font = '700 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label != null ? node.label : node.id, pos.x, pos.y);

            // Distance label
            if (node.dist != null) {
                ctx.fillStyle = COLORS.textDim;
                ctx.font = '500 10px JetBrains Mono, monospace';
                ctx.fillText('d=' + (node.dist === Infinity ? '∞' : node.dist), pos.x, pos.y + nodeRadius + 14);
            }
        }
    }

    // ─── DP Table Renderer ─────────────────────────

    renderTable(step) {
        const ctx = this.ctx;
        const grid = step.data.grid || [];
        const rowLabels = step.data.rowLabels || [];
        const colLabels = step.data.colLabels || [];
        const highlights = step.highlights || {};
        if (grid.length === 0) return;

        const rows = grid.length;
        const cols = grid[0].length;
        const padding = 60;
        const labelW = 40;
        const labelH = 30;

        const cellW = Math.min(50, (this.width - padding * 2 - labelW) / cols);
        const cellH = Math.min(40, (this.height - padding * 2 - labelH) / rows);

        const startX = (this.width - (cols * cellW + labelW)) / 2 + labelW;
        const startY = (this.height - (rows * cellH + labelH)) / 2 + labelH;

        // Column labels
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '600 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let c = 0; c < cols; c++) {
            const label = colLabels[c] != null ? colLabels[c] : c;
            ctx.fillText(label, startX + c * cellW + cellW / 2, startY - 6);
        }

        // Row labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < rows; r++) {
            const label = rowLabels[r] != null ? rowLabels[r] : r;
            ctx.fillText(label, startX - 10, startY + r * cellH + cellH / 2);
        }

        // Cells
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + c * cellW;
                const y = startY + r * cellH;
                const key = `${r},${c}`;
                const state = highlights[key] || null;

                // Cell background
                ctx.fillStyle = state ? this.getColor(state) : COLORS.bg;
                if (state) {
                    ctx.globalAlpha = state === 'sorted' || state === 'found' ? 0.3 : 0.5;
                    ctx.fillRect(x, y, cellW, cellH);
                    ctx.globalAlpha = 1;
                }

                // Cell border
                ctx.strokeStyle = state ? this.getColor(state) : COLORS.gridLine;
                ctx.lineWidth = state ? 2 : 1;
                ctx.strokeRect(x, y, cellW, cellH);

                // Value
                const val = grid[r][c];
                if (val != null) {
                    ctx.fillStyle = state ? this.getColor(state) : COLORS.text;
                    ctx.font = `${state ? '700' : '500'} 12px JetBrains Mono, monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val === Infinity ? '∞' : val, x + cellW / 2, y + cellH / 2);
                }
            }
        }
    }

    // ─── Stack Renderer ────────────────────────────

    renderStack(step) {
        const ctx = this.ctx;
        const items = step.data.items || [];
        const highlights = step.highlights || {};
        const maxH = 12;
        const blockW = 80;
        const blockH = 36;
        const gap = 4;

        const startX = this.width / 2 - blockW / 2;
        const startY = this.height - 60;

        // Base
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX - 10, startY + 5);
        ctx.lineTo(startX + blockW + 10, startY + 5);
        ctx.stroke();

        // Label
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '500 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STACK (top ↑)', this.width / 2, startY + 24);

        // Blocks
        for (let i = 0; i < items.length; i++) {
            const y = startY - (i + 1) * (blockH + gap);
            const state = highlights[i] || (i === items.length - 1 ? 'active' : 'default');
            const color = this.getColor(state);

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(startX, y, blockW, blockH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, y, blockW, blockH);

            ctx.fillStyle = COLORS.text;
            ctx.font = '600 14px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(items[i], startX + blockW / 2, y + blockH / 2);

            // Top label
            if (i === items.length - 1) {
                ctx.fillStyle = COLORS.active;
                ctx.font = '700 11px Inter, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('← TOP', startX + blockW + 12, y + blockH / 2);
            }
        }
    }

    // ─── Queue Renderer ────────────────────────────

    renderQueue(step) {
        const ctx = this.ctx;
        const items = step.data.items || [];
        const highlights = step.highlights || {};
        const blockW = 56;
        const blockH = 50;
        const gap = 6;

        const totalW = items.length * (blockW + gap) - gap;
        const startX = (this.width - totalW) / 2;
        const startY = this.height / 2 - blockH / 2;

        // Label
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '500 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QUEUE (front → back)', this.width / 2, startY - 30);

        // Front/Back arrows
        if (items.length > 0) {
            ctx.fillStyle = COLORS.success;
            ctx.font = '700 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('FRONT', startX + blockW / 2, startY + blockH + 20);
            ctx.fillStyle = COLORS.warning;
            ctx.fillText('BACK', startX + totalW - blockW / 2, startY + blockH + 20);
        }

        for (let i = 0; i < items.length; i++) {
            const x = startX + i * (blockW + gap);
            const state = highlights[i] || 'default';
            const color = this.getColor(state);

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, startY, blockW, blockH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, startY, blockW, blockH);

            ctx.fillStyle = COLORS.text;
            ctx.font = '600 14px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(items[i], x + blockW / 2, startY + blockH / 2);
        }
    }

    // ─── String / Character Box Renderer ───────────

    renderString(step) {
        const ctx = this.ctx;
        const text = step.data.text || '';
        const pattern = step.data.pattern || '';
        const highlights = step.highlights || {};
        const textPos = step.data.textPos || 0;
        const charW = Math.min(36, (this.width - 120) / Math.max(text.length, 1));
        const charH = 40;

        // Text row
        const textStartX = (this.width - text.length * charW) / 2;
        const textY = this.height / 2 - 40;

        ctx.fillStyle = COLORS.textDim;
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Text:', textStartX - 50, textY + charH / 2);

        for (let i = 0; i < text.length; i++) {
            const x = textStartX + i * charW;
            const state = highlights[`t${i}`] || 'default';
            const color = this.getColor(state);

            ctx.fillStyle = state !== 'default' ? color : COLORS.bg;
            ctx.globalAlpha = state !== 'default' ? 0.3 : 1;
            ctx.fillRect(x, textY, charW - 2, charH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = state !== 'default' ? color : COLORS.gridLine;
            ctx.lineWidth = state !== 'default' ? 2 : 1;
            ctx.strokeRect(x, textY, charW - 2, charH);

            ctx.fillStyle = COLORS.text;
            ctx.font = '600 15px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text[i], x + (charW - 2) / 2, textY + charH / 2);

            // Index
            ctx.fillStyle = COLORS.textDim;
            ctx.font = '400 10px JetBrains Mono, monospace';
            ctx.fillText(i, x + (charW - 2) / 2, textY - 10);
        }

        // Pattern row
        if (pattern) {
            const patternY = textY + charH + 20;
            const patStartX = textStartX + textPos * charW;

            ctx.fillStyle = COLORS.textDim;
            ctx.font = '600 13px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Pattern:', textStartX - 70, patternY + charH / 2);

            for (let i = 0; i < pattern.length; i++) {
                const x = patStartX + i * charW;
                const state = highlights[`p${i}`] || 'default';
                const color = this.getColor(state);

                ctx.fillStyle = state !== 'default' ? color : 'rgba(99,102,241,0.1)';
                ctx.globalAlpha = state !== 'default' ? 0.3 : 1;
                ctx.fillRect(x, patternY, charW - 2, charH);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = state !== 'default' ? color : 'rgba(99,102,241,0.3)';
                ctx.lineWidth = state !== 'default' ? 2 : 1;
                ctx.strokeRect(x, patternY, charW - 2, charH);

                ctx.fillStyle = COLORS.text;
                ctx.font = '600 15px JetBrains Mono, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pattern[i], x + (charW - 2) / 2, patternY + charH / 2);
            }
        }
    }

    // ─── Grid Renderer (N-Queens, Sudoku) ──────────

    renderGrid(step) {
        const ctx = this.ctx;
        const grid = step.data.grid || [];
        const highlights = step.highlights || {};
        const size = step.data.size || grid.length;
        if (size === 0) return;

        const padding = 50;
        const cellSize = Math.min(50, (Math.min(this.width, this.height) - padding * 2) / size);
        const startX = (this.width - size * cellSize) / 2;
        const startY = (this.height - size * cellSize) / 2;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const x = startX + c * cellSize;
                const y = startY + r * cellSize;
                const key = `${r},${c}`;
                const state = highlights[key] || null;

                // Checkerboard
                const isLight = (r + c) % 2 === 0;
                ctx.fillStyle = isLight ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15)';
                ctx.fillRect(x, y, cellSize, cellSize);

                // Highlight
                if (state) {
                    ctx.fillStyle = this.getColor(state);
                    ctx.globalAlpha = 0.25;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.globalAlpha = 1;
                }

                ctx.strokeStyle = COLORS.gridLine;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Content
                const val = grid[r] && grid[r][c];
                if (val != null && val !== 0 && val !== '') {
                    ctx.fillStyle = state ? this.getColor(state) : COLORS.text;
                    ctx.font = `700 ${cellSize * 0.45}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val === 'Q' ? '♛' : val, x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
    }

    // ─── Linked List Renderer ──────────────────────

    renderLinkedList(step) {
        const ctx = this.ctx;
        const nodes = step.data.nodes || [];
        const highlights = step.highlights || {};
        const nodeW = 60;
        const nodeH = 36;
        const gap = 40;
        const totalW = nodes.length * (nodeW + gap) - gap;
        const startX = (this.width - totalW) / 2;
        const y = this.height / 2 - nodeH / 2;

        for (let i = 0; i < nodes.length; i++) {
            const x = startX + i * (nodeW + gap);
            const state = highlights[i] || 'default';
            const color = this.getColor(state);

            // Node box
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.15;
            ctx.fillRect(x, y, nodeW, nodeH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, nodeW, nodeH);

            // Value
            ctx.fillStyle = COLORS.text;
            ctx.font = '600 14px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(nodes[i], x + nodeW / 2, y + nodeH / 2);

            // Arrow to next
            if (i < nodes.length - 1) {
                const arrowStartX = x + nodeW;
                const arrowEndX = x + nodeW + gap;
                const arrowY = y + nodeH / 2;
                ctx.strokeStyle = COLORS.line;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(arrowStartX + 4, arrowY);
                ctx.lineTo(arrowEndX - 4, arrowY);
                ctx.stroke();
                // Arrowhead
                ctx.fillStyle = COLORS.line;
                ctx.beginPath();
                ctx.moveTo(arrowEndX - 4, arrowY);
                ctx.lineTo(arrowEndX - 12, arrowY - 5);
                ctx.lineTo(arrowEndX - 12, arrowY + 5);
                ctx.closePath();
                ctx.fill();
            } else {
                // NULL pointer
                ctx.fillStyle = COLORS.textDim;
                ctx.font = '500 11px Inter, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('NULL', x + nodeW + 10, y + nodeH / 2);
            }
        }

        // Head label
        if (nodes.length > 0) {
            ctx.fillStyle = COLORS.active;
            ctx.font = '700 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HEAD', startX + nodeW / 2, y - 14);
        }
    }

    // ─── Hash Table Renderer ───────────────────────

    renderHashTable(step) {
        const ctx = this.ctx;
        const buckets = step.data.buckets || [];
        const highlights = step.highlights || {};
        const bucketH = 36;
        const bucketW = 60;
        const gap = 6;
        const chainW = 50;

        const startX = 80;
        const startY = (this.height - buckets.length * (bucketH + gap)) / 2;

        ctx.fillStyle = COLORS.textDim;
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HASH TABLE', this.width / 2, startY - 20);

        for (let i = 0; i < buckets.length; i++) {
            const y = startY + i * (bucketH + gap);
            const state = highlights[`b${i}`] || 'default';
            const color = this.getColor(state);

            // Bucket index
            ctx.fillStyle = COLORS.textDim;
            ctx.font = '500 11px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(`[${i}]`, startX - 8, y + bucketH / 2);

            // Bucket box
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.15;
            ctx.fillRect(startX, y, bucketW, bucketH);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, y, bucketW, bucketH);

            // Chain items
            const chain = buckets[i] || [];
            for (let j = 0; j < chain.length; j++) {
                const cx = startX + bucketW + 20 + j * (chainW + 20);
                const itemState = highlights[`${i},${j}`] || 'default';
                const itemColor = this.getColor(itemState);

                // Arrow
                ctx.strokeStyle = COLORS.line;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - 20, y + bucketH / 2);
                ctx.lineTo(cx - 4, y + bucketH / 2);
                ctx.stroke();

                // Item box
                ctx.fillStyle = itemColor;
                ctx.globalAlpha = 0.15;
                ctx.fillRect(cx, y, chainW, bucketH);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = itemColor;
                ctx.strokeRect(cx, y, chainW, bucketH);

                ctx.fillStyle = COLORS.text;
                ctx.font = '500 12px JetBrains Mono, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(chain[j], cx + chainW / 2, y + bucketH / 2);
            }

            // Empty bucket label
            if (chain.length === 0) {
                ctx.fillStyle = COLORS.textDim;
                ctx.font = '400 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('empty', startX + bucketW / 2, y + bucketH / 2);
            }
        }
    }
}

export const visualizer = new Visualizer();
