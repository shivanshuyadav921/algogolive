"""
╔══════════════════════════════════════════════════════════════════════╗
║          MERGE SORT - INTERACTIVE DSA VISUALIZER                     ║
║          Built with Tkinter | Animated Step-by-Step                  ║
║          Controls: Play/Pause | Next | Prev | Speed Slider           ║
╚══════════════════════════════════════════════════════════════════════╝

HOW TO RUN:
  Windows : python visualizer.py
  Linux   : python3 visualizer.py

REQUIREMENTS: Python 3.7+ (Tkinter is bundled with Python)
"""

import tkinter as tk
from tkinter import ttk, font as tkfont
import time
import threading
import copy
import math

# ─────────────────────────── COLOUR PALETTE ────────────────────────────
BG          = "#0D1117"   # background
PANEL_BG    = "#161B22"   # side panel
CARD_BG     = "#1C2128"   # card bg
ACCENT      = "#58A6FF"   # primary blue
GREEN       = "#3FB950"   # active / merge
ORANGE      = "#FF8C42"   # pivot / comparison
PURPLE      = "#BC8CFF"   # sorted
RED         = "#FF5959"   # swap
YELLOW      = "#FFD700"   # pointers
TEXT        = "#E6EDF3"   # normal text
SUBTEXT     = "#8B949E"   # secondary text
DIVIDER     = "#30363D"   # borders

BAR_DEFAULT = ACCENT
BAR_ACTIVE  = ORANGE
BAR_MERGE   = GREEN
BAR_SORTED  = PURPLE
BAR_COMPARE = RED


# ───────────────────────── MERGE SORT ENGINE ───────────────────────────

class MergeSortEngine:
    """Captures every micro-step of Merge Sort for replay."""

    def __init__(self, arr):
        self.original = arr[:]
        self.steps    = []
        self._run(arr[:], 0, len(arr) - 1, 0)

    # ── helpers ──────────────────────────────────────────────────────
    def _snap(self, arr, highlights, msg, level=0, left_range=None, right_range=None,
              merge_i=None, merge_j=None, sorted_range=None):
        """Record one visualisation frame."""
        self.steps.append({
            "arr"         : arr[:],
            "highlights"  : highlights,        # {index: colour_key}
            "message"     : msg,
            "level"       : level,
            "left_range"  : left_range,
            "right_range" : right_range,
            "merge_i"     : merge_i,
            "merge_j"     : merge_j,
            "sorted_range": sorted_range or [],
        })

    # ── recursive merge sort ──────────────────────────────────────────
    def _run(self, arr, l, r, depth):
        if l >= r:
            self._snap(arr, {l: "sorted"}, f"Base case: single element arr[{l}]={arr[l]}",
                       level=depth, sorted_range=[l])
            return

        mid = (l + r) // 2
        highlights = {i: "active" for i in range(l, r + 1)}
        self._snap(arr, highlights,
                   f"DIVIDE  ▸  arr[{l}..{r}]  →  left[{l}..{mid}]  right[{mid+1}..{r}]",
                   level=depth, left_range=(l, mid), right_range=(mid + 1, r))

        self._run(arr, l, mid, depth + 1)
        self._run(arr, mid + 1, r, depth + 1)
        self._merge(arr, l, mid, r, depth)

    def _merge(self, arr, l, mid, r, depth):
        left  = arr[l:mid + 1]
        right = arr[mid + 1:r + 1]
        i = j = 0
        k = l

        self._snap(arr, {x: "active" for x in range(l, r + 1)},
                   f"MERGE  ▸  left={left}  right={right}",
                   level=depth, left_range=(l, mid), right_range=(mid + 1, r))

        while i < len(left) and j < len(right):
            li = l + i
            rj = mid + 1 + j
            hl = {x: "active" for x in range(l, r + 1)}
            hl[li] = "compare"
            hl[rj] = "compare"
            self._snap(arr, hl,
                       f"Compare  left[{i}]={left[i]}  vs  right[{j}]={right[j]}",
                       level=depth, merge_i=li, merge_j=rj,
                       left_range=(l, mid), right_range=(mid + 1, r))

            if left[i] <= right[j]:
                arr[k] = left[i]
                hl2 = {x: "active" for x in range(l, r + 1)}
                hl2[k] = "merge"
                self._snap(arr, hl2,
                           f"Place left[{i}]={left[i]}  at  pos {k}  ✓ smaller/equal",
                           level=depth, left_range=(l, mid), right_range=(mid + 1, r))
                i += 1
            else:
                arr[k] = right[j]
                hl2 = {x: "active" for x in range(l, r + 1)}
                hl2[k] = "merge"
                self._snap(arr, hl2,
                           f"Place right[{j}]={right[j]}  at  pos {k}  ✓ smaller",
                           level=depth, left_range=(l, mid), right_range=(mid + 1, r))
                j += 1
            k += 1

        while i < len(left):
            arr[k] = left[i]
            hl = {x: "active" for x in range(l, r + 1)}
            hl[k] = "merge"
            self._snap(arr, hl,
                       f"Copy remaining left[{i}]={left[i]}  to  pos {k}",
                       level=depth, left_range=(l, mid), right_range=(mid + 1, r))
            i += 1; k += 1

        while j < len(right):
            arr[k] = right[j]
            hl = {x: "active" for x in range(l, r + 1)}
            hl[k] = "merge"
            self._snap(arr, hl,
                       f"Copy remaining right[{j}]={right[j]}  to  pos {k}",
                       level=depth, left_range=(l, mid), right_range=(mid + 1, r))
            j += 1; k += 1

        self._snap(arr, {x: "sorted" for x in range(l, r + 1)},
                   f"MERGED  ▸  arr[{l}..{r}] = {arr[l:r+1]}  ✓ sorted!",
                   level=depth, sorted_range=list(range(l, r + 1)))


# ─────────────────────────── MAIN APPLICATION ──────────────────────────

class MergeSortVisualizer(tk.Tk):

    ARRAY_PRESETS = {
        "Default (8)": [38, 27, 43, 3, 9, 82, 10, 1],
        "Small (5)"  : [5, 2, 8, 1, 9],
        "Sorted"     : [1, 2, 3, 4, 5, 6, 7, 8],
        "Reverse"    : [8, 7, 6, 5, 4, 3, 2, 1],
        "Duplicates" : [4, 2, 4, 1, 3, 2, 4, 3],
        "Single"     : [42],
    }

    def __init__(self):
        super().__init__()
        self.title("🔀 Merge Sort – DSA Interactive Visualizer")
        self.configure(bg=BG)
        self.state("zoomed")

        # State
        self.engine       = None
        self.steps        = []
        self.current_step = 0
        self.playing      = False
        self.play_thread  = None
        self._stop_flag   = threading.Event()
        self._speed_val   = 0.6   # plain float — safe to read from any thread

        self._load_fonts()
        self._build_ui()
        self._load_preset("Default (8)")

    # ── fonts ─────────────────────────────────────────────────────────
    def _load_fonts(self):
        self.fn_title  = tkfont.Font(family="Segoe UI", size=20, weight="bold")
        self.fn_sub    = tkfont.Font(family="Segoe UI", size=11)
        self.fn_code   = tkfont.Font(family="Consolas",  size=11)
        self.fn_badge  = tkfont.Font(family="Segoe UI", size=9,  weight="bold")
        self.fn_bar    = tkfont.Font(family="Segoe UI", size=9)
        self.fn_btn    = tkfont.Font(family="Segoe UI", size=11, weight="bold")
        self.fn_small  = tkfont.Font(family="Segoe UI", size=9)

    # ── UI skeleton ────────────────────────────────────────────────────
    def _build_ui(self):
        # ─ top bar ────────────────────────────────────────────────────
        top = tk.Frame(self, bg=PANEL_BG, height=64)
        top.pack(fill="x", side="top")
        top.pack_propagate(False)
        tk.Label(top, text="⚡ MERGE SORT VISUALIZER",
                 bg=PANEL_BG, fg=ACCENT, font=self.fn_title).pack(side="left", padx=20, pady=12)
        tk.Label(top, text="Divide & Conquer  •  O(n log n)  •  Stable",
                 bg=PANEL_BG, fg=SUBTEXT, font=self.fn_sub).pack(side="left", padx=4, pady=20)

        # ─ main area ──────────────────────────────────────────────────
        body = tk.Frame(self, bg=BG)
        body.pack(fill="both", expand=True)

        # LEFT – canvas
        self.canvas_frame = tk.Frame(body, bg=BG)
        self.canvas_frame.pack(side="left", fill="both", expand=True, padx=(10, 4), pady=10)
        self._build_canvas_area()

        # RIGHT – info panel
        right = tk.Frame(body, bg=PANEL_BG, width=360)
        right.pack(side="right", fill="y", padx=(4, 10), pady=10)
        right.pack_propagate(False)
        self._build_info_panel(right)

        # BOTTOM – controls
        self._build_controls()

    # ── canvas area ───────────────────────────────────────────────────
    def _build_canvas_area(self):
        # Step progress bar
        pbar_f = tk.Frame(self.canvas_frame, bg=BG)
        pbar_f.pack(fill="x", pady=(0, 4))
        tk.Label(pbar_f, text="Step Progress", bg=BG, fg=SUBTEXT, font=self.fn_small).pack(side="left", padx=4)
        self.progress_var = tk.DoubleVar(value=0)
        self.progress_bar = ttk.Progressbar(pbar_f, variable=self.progress_var,
                                            maximum=100, length=300, style="TProgressbar")
        self.progress_bar.pack(side="left", padx=8, pady=2)
        self.step_label = tk.Label(pbar_f, text="0 / 0", bg=BG, fg=ACCENT, font=self.fn_small)
        self.step_label.pack(side="left", padx=4)

        # Main bar canvas
        self.canvas = tk.Canvas(self.canvas_frame, bg=BG, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # Depth ruler
        self.depth_label = tk.Label(self.canvas_frame,
                                    text="Recursion Depth: 0", bg=BG, fg=SUBTEXT, font=self.fn_small)
        self.depth_label.pack(pady=2)

    # ── info panel ────────────────────────────────────────────────────
    def _build_info_panel(self, parent):
        self._section(parent, "📋 CURRENT STEP")
        self.msg_var = tk.StringVar(value="Load an array to begin...")
        msg_lbl = tk.Label(parent, textvariable=self.msg_var, bg=CARD_BG, fg=TEXT,
                           font=self.fn_code, wraplength=330, justify="left",
                           padx=12, pady=10, anchor="w", relief="flat")
        msg_lbl.pack(fill="x", padx=10, pady=(0, 10))

        self._section(parent, "📊 ARRAY STATE")
        self.arr_var = tk.StringVar(value="[]")
        tk.Label(parent, textvariable=self.arr_var, bg=CARD_BG, fg=GREEN,
                 font=self.fn_code, wraplength=330, justify="left",
                 padx=12, pady=8).pack(fill="x", padx=10, pady=(0, 10))

        self._section(parent, "🎨 LEGEND")
        legends = [
            (BAR_DEFAULT, "Default element"),
            (BAR_ACTIVE,  "Active subarray"),
            (BAR_COMPARE, "Being compared"),
            (BAR_MERGE,   "Placed / merged"),
            (BAR_SORTED,  "Fully sorted"),
        ]
        leg_frame = tk.Frame(parent, bg=PANEL_BG)
        leg_frame.pack(fill="x", padx=10, pady=(0, 10))
        for colour, label in legends:
            row = tk.Frame(leg_frame, bg=PANEL_BG)
            row.pack(fill="x", pady=2)
            tk.Canvas(row, bg=colour, width=16, height=16,
                      highlightthickness=0).pack(side="left", padx=(4, 8))
            tk.Label(row, text=label, bg=PANEL_BG, fg=TEXT, font=self.fn_small).pack(side="left")

        self._section(parent, "⏱️ COMPLEXITY")
        complexities = [
            ("Best Case",    "O(n log n)"),
            ("Average Case", "O(n log n)"),
            ("Worst Case",   "O(n log n)"),
            ("Space",        "O(n)"),
            ("Stable?",      "✓ Yes"),
        ]
        comp_frame = tk.Frame(parent, bg=CARD_BG)
        comp_frame.pack(fill="x", padx=10, pady=(0, 10))
        for k, v in complexities:
            row = tk.Frame(comp_frame, bg=CARD_BG)
            row.pack(fill="x", padx=8, pady=2)
            tk.Label(row, text=k, bg=CARD_BG, fg=SUBTEXT, font=self.fn_small,
                     width=14, anchor="w").pack(side="left")
            tk.Label(row, text=v, bg=CARD_BG, fg=ACCENT,
                     font=tkfont.Font(family="Consolas", size=10, weight="bold")).pack(side="left")

        self._section(parent, "🎯 PRESET ARRAYS")
        preset_frame = tk.Frame(parent, bg=PANEL_BG)
        preset_frame.pack(fill="x", padx=10, pady=(0, 10))
        for name in self.ARRAY_PRESETS:
            btn = tk.Button(preset_frame, text=name, font=self.fn_small,
                            bg=CARD_BG, fg=TEXT, relief="flat",
                            activebackground=ACCENT, activeforeground=BG,
                            cursor="hand2", pady=3,
                            command=lambda n=name: self._load_preset(n))
            btn.pack(fill="x", pady=1, padx=2)

        self._section(parent, "✏️ CUSTOM ARRAY")
        inp_frame = tk.Frame(parent, bg=PANEL_BG)
        inp_frame.pack(fill="x", padx=10, pady=(0, 12))
        self.custom_entry = tk.Entry(inp_frame, bg=CARD_BG, fg=TEXT,
                                     font=self.fn_code, relief="flat",
                                     insertbackground=ACCENT)
        self.custom_entry.insert(0, "e.g. 5,3,8,1,9")
        self.custom_entry.pack(fill="x", padx=4, pady=4)
        tk.Button(inp_frame, text="▶ Load Custom", font=self.fn_small,
                  bg=ACCENT, fg=BG, relief="flat", cursor="hand2",
                  command=self._load_custom).pack(fill="x", padx=4, pady=2)

    def _section(self, parent, title):
        tk.Label(parent, text=title, bg=PANEL_BG, fg=ACCENT,
                 font=self.fn_badge, anchor="w").pack(fill="x", padx=10, pady=(10, 2))
        tk.Frame(parent, bg=DIVIDER, height=1).pack(fill="x", padx=10, pady=(0, 6))

    # ── controls ──────────────────────────────────────────────────────
    def _build_controls(self):
        ctrl = tk.Frame(self, bg=PANEL_BG, height=80)
        ctrl.pack(fill="x", side="bottom")
        ctrl.pack_propagate(False)

        inner = tk.Frame(ctrl, bg=PANEL_BG)
        inner.pack(expand=True, pady=10)

        btn_cfg = dict(bg=CARD_BG, fg=TEXT, font=self.fn_btn,
                       relief="flat", cursor="hand2",
                       activebackground=ACCENT, activeforeground=BG,
                       width=10, pady=6)

        self.btn_prev = tk.Button(inner, text="⏮  Prev", **btn_cfg, command=self._prev_step)
        self.btn_prev.pack(side="left", padx=6)

        play_cfg = {**btn_cfg, "bg": ACCENT, "fg": BG}   # override bg/fg for play button
        self.btn_play = tk.Button(inner, text="▶  Play", **play_cfg, command=self._toggle_play)
        self.btn_play.pack(side="left", padx=6)

        self.btn_next = tk.Button(inner, text="Next  ⏭", **btn_cfg, command=self._next_step)
        self.btn_next.pack(side="left", padx=6)

        self.btn_reset = tk.Button(inner, text="↺  Reset", **btn_cfg, command=self._reset)
        self.btn_reset.pack(side="left", padx=6)

        # Speed slider — uses plain command= callback so the play thread
        # only ever reads self._speed_val (a normal float, not a Tkinter var)
        spd_frame = tk.Frame(inner, bg=PANEL_BG)
        spd_frame.pack(side="left", padx=20)
        tk.Label(spd_frame, text="Speed", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack()
        self._spd_slider_var = tk.DoubleVar(value=0.6)   # only used by the widget
        spd_slider = ttk.Scale(spd_frame, from_=0.1, to=2.0,
                               variable=self._spd_slider_var,
                               command=self._on_speed_change,
                               orient="horizontal", length=160)
        spd_slider.pack()
        speed_labels = tk.Frame(spd_frame, bg=PANEL_BG)
        speed_labels.pack(fill="x")
        tk.Label(speed_labels, text="Slow", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack(side="left")
        tk.Label(speed_labels, text="Fast", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack(side="right")

    # ── speed callback (main thread only) ──────────────────────────────
    def _on_speed_change(self, val):
        """Keep the thread-safe float in sync with the slider widget."""
        try:
            self._speed_val = float(val)
        except (ValueError, TypeError):
            pass

    # ── load & parse ──────────────────────────────────────────────────
    def _load_preset(self, name):
        self._stop_play()
        arr = self.ARRAY_PRESETS[name][:]
        self._init_engine(arr)

    def _load_custom(self):
        self._stop_play()
        raw = self.custom_entry.get().replace(" ", "")
        try:
            arr = [int(x) for x in raw.split(",") if x]
            if not arr:
                raise ValueError
            if len(arr) > 20:
                arr = arr[:20]
            self._init_engine(arr)
        except ValueError:
            self.msg_var.set("⚠ Invalid input! Use comma-separated integers.\nExample: 5,3,8,1,9")

    def _init_engine(self, arr):
        self.engine       = MergeSortEngine(arr)
        self.steps        = self.engine.steps
        self.current_step = 0
        self._render_step(0)

    # ── play / pause ──────────────────────────────────────────────────
    def _toggle_play(self):
        if self.playing:
            self._stop_play()
        else:
            self._start_play()

    def _start_play(self):
        if not self.steps or self.current_step >= len(self.steps) - 1:
            self.current_step = 0
        self.playing    = True
        self._stop_flag.clear()
        self.btn_play.config(text="⏸  Pause", bg=ORANGE, fg=BG)
        self.play_thread = threading.Thread(target=self._play_loop, daemon=True)
        self.play_thread.start()

    def _stop_play(self):
        self._stop_flag.set()
        self.playing = False
        self.btn_play.config(text="▶  Play", bg=ACCENT, fg=BG)

    def _play_loop(self):
        while not self._stop_flag.is_set():
            if self.current_step >= len(self.steps) - 1:
                self.after(0, self._stop_play)   # stop from main thread
                break
            self.current_step += 1
            self.after(0, self._render_step, self.current_step)
            # Read plain Python float — thread-safe, no Tkinter calls
            delay = 1.0 / max(self._speed_val, 0.1)
            time.sleep(delay)

    def _next_step(self):
        if not self.steps: return
        if self.current_step < len(self.steps) - 1:
            self.current_step += 1
            self._render_step(self.current_step)

    def _prev_step(self):
        if not self.steps: return
        if self.current_step > 0:
            self.current_step -= 1
            self._render_step(self.current_step)

    def _reset(self):
        self._stop_play()
        self.current_step = 0
        if self.steps:
            self._render_step(0)

    # ── renderer ──────────────────────────────────────────────────────
    def _render_step(self, idx):
        if not self.steps: return
        step = self.steps[idx]
        arr  = step["arr"]
        n    = len(arr)

        # Progress
        pct = (idx / max(len(self.steps) - 1, 1)) * 100
        self.progress_var.set(pct)
        self.step_label.config(text=f"{idx + 1} / {len(self.steps)}")
        self.depth_label.config(text=f"Recursion Depth: {step['level']}")

        # Side panel
        self.msg_var.set(step["message"])
        self.arr_var.set(str(arr))

        # Canvas
        self.canvas.delete("all")
        W = self.canvas.winfo_width()  or 900
        H = self.canvas.winfo_height() or 500

        if n == 0: return

        pad_x   = 60
        pad_top = 50
        pad_bot = 60
        usable_w = W - 2 * pad_x
        usable_h = H - pad_top - pad_bot

        bar_w   = usable_w / n
        max_val = max(arr) if arr else 1
        scale   = usable_h / (max_val * 1.1)

        highlights   = step["highlights"]
        sorted_range = set(step.get("sorted_range", []))
        colour_map   = {
            "default" : BAR_DEFAULT,
            "active"  : BAR_ACTIVE,
            "compare" : BAR_COMPARE,
            "merge"   : BAR_MERGE,
            "sorted"  : BAR_SORTED,
        }

        # Draw left/right range brackets
        lr = step.get("left_range")
        rr = step.get("right_range")
        if lr:
            lx1 = pad_x + lr[0] * bar_w + 2
            lx2 = pad_x + (lr[1] + 1) * bar_w - 2
            self.canvas.create_rectangle(lx1, pad_top - 18, lx2, pad_top - 6,
                                         fill="", outline=ACCENT, width=1, dash=(3, 3))
            self.canvas.create_text((lx1 + lx2) / 2, pad_top - 28,
                                    text="LEFT", fill=ACCENT, font=self.fn_small)
        if rr:
            rx1 = pad_x + rr[0] * bar_w + 2
            rx2 = pad_x + (rr[1] + 1) * bar_w - 2
            self.canvas.create_rectangle(rx1, pad_top - 18, rx2, pad_top - 6,
                                         fill="", outline=GREEN, width=1, dash=(3, 3))
            self.canvas.create_text((rx1 + rx2) / 2, pad_top - 28,
                                    text="RIGHT", fill=GREEN, font=self.fn_small)

        for i in range(n):
            x1 = pad_x + i * bar_w + 2
            x2 = pad_x + (i + 1) * bar_w - 2
            bh = max(int(arr[i] * scale), 4)
            y1 = H - pad_bot - bh
            y2 = H - pad_bot

            colour_key = highlights.get(i, "default")
            if i in sorted_range and colour_key == "sorted":
                colour_key = "sorted"
            colour = colour_map.get(colour_key, BAR_DEFAULT)

            # Shadow / glow
            if colour_key in ("compare", "merge", "sorted"):
                self.canvas.create_rectangle(x1 - 2, y1 - 2, x2 + 2, y2,
                                             fill=colour, outline="", stipple="gray25")

            # Bar
            radius = 4
            self._draw_rounded_rect(x1, y1, x2, y2, radius, colour)

            # Value text (only if bar wide enough)
            if bar_w > 22:
                self.canvas.create_text((x1 + x2) / 2, y1 - 10,
                                        text=str(arr[i]), fill=TEXT, font=self.fn_bar)

            # Index
            self.canvas.create_text((x1 + x2) / 2, H - pad_bot + 16,
                                    text=str(i), fill=SUBTEXT, font=self.fn_small)

            # Pointer arrows for compare pointers
            mi = step.get("merge_i")
            mj = step.get("merge_j")
            if mi == i:
                cx = (x1 + x2) / 2
                self.canvas.create_text(cx, y1 - 24, text="i", fill=YELLOW, font=self.fn_badge)
            if mj == i:
                cx = (x1 + x2) / 2
                self.canvas.create_text(cx, y1 - 24, text="j", fill=YELLOW, font=self.fn_badge)

        # Step message overlay at top of canvas
        self.canvas.create_text(W // 2, H - 18,
                                 text=step["message"][:90], fill=SUBTEXT,
                                 font=self.fn_small, width=W - 100)

    def _draw_rounded_rect(self, x1, y1, x2, y2, r, fill):
        """Draw a rectangle with rounded top corners."""
        r = min(r, (x2 - x1) // 2, (y2 - y1) // 2)
        self.canvas.create_polygon(
            x1 + r, y1,
            x2 - r, y1,
            x2,     y1 + r,
            x2,     y2,
            x1,     y2,
            x1,     y1 + r,
            smooth=False, fill=fill, outline=""
        )
        # top arc
        self.canvas.create_arc(x1, y1, x1 + 2 * r, y1 + 2 * r,
                                start=90, extent=90, fill=fill, outline="")
        self.canvas.create_arc(x2 - 2 * r, y1, x2, y1 + 2 * r,
                                start=0, extent=90, fill=fill, outline="")


# ─────────────────────────── ENTRY POINT ───────────────────────────────

if __name__ == "__main__":
    # Style tweaks
    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass
    style.configure("TProgressbar",
                    troughcolor=CARD_BG,
                    background=ACCENT,
                    thickness=6)

    app = MergeSortVisualizer()
    app.mainloop()
