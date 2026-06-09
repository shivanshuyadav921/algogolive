"""
╔══════════════════════════════════════════════════════════════════════════╗
║   LC #3 — Longest Substring Without Repeating Characters                 ║
║   Pattern: SLIDING WINDOW + HASHMAP                                      ║
║   Interactive Visualizer | Tkinter | Play/Pause/Next/Prev/Speed          ║
╚══════════════════════════════════════════════════════════════════════════╝

HOW TO RUN:
  Windows : python visualizer.py
  Linux   : python3 visualizer.py

REQUIRES: Python 3.7+ (Tkinter is built-in)
"""

import tkinter as tk
from tkinter import ttk, font as tkfont
import threading
import time

# ─────────────────────────── COLOUR PALETTE ────────────────────────────
BG        = "#0D1117"
PANEL_BG  = "#161B22"
CARD_BG   = "#1C2128"
ACCENT    = "#58A6FF"
GREEN     = "#3FB950"
ORANGE    = "#FF8C42"
PURPLE    = "#BC8CFF"
RED       = "#FF5959"
YELLOW    = "#FFD700"
TEAL      = "#39D5C3"
TEXT      = "#E6EDF3"
SUBTEXT   = "#8B949E"
DIVIDER   = "#30363D"

WINDOW_L  = "#2D6A4F"   # left pointer bg
WINDOW_R  = "#1D3557"   # right pointer bg
CHAR_DEF  = "#21262D"   # default char box
CHAR_WIN  = "#0D4429"   # inside window
CHAR_DUP  = "#3D1515"   # duplicate found
CHAR_NEW  = "#0D3350"   # new char added
CHAR_BEST = "#1A2E1A"   # best window


# ──────────────────────────── ENGINE ────────────────────────────────────

class SlidingWindowEngine:
    """Records every micro-step of the sliding window algorithm."""

    def __init__(self, s: str):
        self.s     = s
        self.steps = []
        self._run(s)

    def _snap(self, l, r, char_map, best_l, best_r, msg, event="normal"):
        self.steps.append({
            "l"       : l,
            "r"       : r,
            "char_map": dict(char_map),
            "best_l"  : best_l,
            "best_r"  : best_r,
            "msg"     : msg,
            "event"   : event,   # normal | duplicate | expand | shrink | best
            "window"  : self.s[l:r+1] if r >= l else "",
            "length"  : r - l + 1 if r >= l else 0,
        })

    def _run(self, s):
        if not s:
            self._snap(0, -1, {}, 0, -1, "Empty string — answer is 0", "normal")
            return

        char_map = {}   # char → last seen index
        best_l = best_r = 0
        best_len = 0
        l = 0

        self._snap(l, -1, char_map, best_l, best_r,
                   "Initialize: left=0, right=-1, window=empty, map={}", "normal")

        for r in range(len(s)):
            c = s[r]

            # Check duplicate
            if c in char_map and char_map[c] >= l:
                old_l = l
                self._snap(l, r, char_map, best_l, best_r,
                           f"r={r}: s[r]='{c}' already in window! "
                           f"Last seen at index {char_map[c]}. Must shrink left.",
                           "duplicate")
                l = char_map[c] + 1
                self._snap(l, r, char_map, best_l, best_r,
                           f"Shrink: move left from {old_l} → {l} "
                           f"(skip past duplicate '{c}')",
                           "shrink")
            else:
                self._snap(l, r, char_map, best_l, best_r,
                           f"r={r}: s[r]='{c}' is NEW — expand window to [{l},{r}]",
                           "expand")

            # Update map and best
            char_map[c] = r
            win_len = r - l + 1

            if win_len > best_len:
                best_len = win_len
                best_l, best_r = l, r
                self._snap(l, r, char_map, best_l, best_r,
                           f"NEW BEST! window='{s[l:r+1]}' length={best_len}",
                           "best")
            else:
                self._snap(l, r, char_map, best_l, best_r,
                           f"Window='{s[l:r+1]}' len={win_len}  "
                           f"(best stays '{s[best_l:best_r+1]}' len={best_len})",
                           "normal")

        self._snap(l, len(s)-1, char_map, best_l, best_r,
                   f"DONE! Longest substring without repeating chars = "
                   f"'{s[best_l:best_r+1]}' (length={best_len})",
                   "best")


# ───────────────────────── MAIN APP ─────────────────────────────────────

class LCVisualizer(tk.Tk):

    PRESETS = {
        "abcabcbb"  : "abcabcbb",
        "bbbbb"     : "bbbbb",
        "pwwkew"    : "pwwkew",
        "dvdf"      : "dvdf",
        "abcde"     : "abcde",
        "\"\" (empty)": "",
        "aab"       : "aab",
        "tmmzuxt"   : "tmmzuxt",
    }

    def __init__(self):
        super().__init__()
        self.title("🪟 Sliding Window — LC #3 Longest Substring (No Repeats)")
        self.configure(bg=BG)
        self.state("zoomed")

        self.engine       = None
        self.steps        = []
        self.current_step = 0
        self.playing      = False
        self._stop_flag   = threading.Event()
        self._speed_val   = 0.8

        self._fonts()
        self._build_ui()
        self._load("abcabcbb")

    # ── fonts ──────────────────────────────────────────────────────────
    def _fonts(self):
        self.fn_title  = tkfont.Font(family="Segoe UI", size=18, weight="bold")
        self.fn_sub    = tkfont.Font(family="Segoe UI", size=10)
        self.fn_code   = tkfont.Font(family="Consolas",  size=12)
        self.fn_code_s = tkfont.Font(family="Consolas",  size=10)
        self.fn_badge  = tkfont.Font(family="Segoe UI", size=9,  weight="bold")
        self.fn_btn    = tkfont.Font(family="Segoe UI", size=11, weight="bold")
        self.fn_small  = tkfont.Font(family="Segoe UI", size=9)
        self.fn_char   = tkfont.Font(family="Consolas",  size=22, weight="bold")
        self.fn_idx    = tkfont.Font(family="Consolas",  size=9)

    # ── skeleton ───────────────────────────────────────────────────────
    def _build_ui(self):
        # Top bar
        top = tk.Frame(self, bg=PANEL_BG, height=62)
        top.pack(fill="x")
        top.pack_propagate(False)
        tk.Label(top, text="🪟  SLIDING WINDOW — LC #3",
                 bg=PANEL_BG, fg=ACCENT, font=self.fn_title).pack(side="left", padx=20, pady=10)
        tk.Label(top, text="Longest Substring Without Repeating Characters  •  O(n)  •  HashSet",
                 bg=PANEL_BG, fg=SUBTEXT, font=self.fn_sub).pack(side="left", pady=18)

        body = tk.Frame(self, bg=BG)
        body.pack(fill="both", expand=True)

        # Canvas area (left)
        left_col = tk.Frame(body, bg=BG)
        left_col.pack(side="left", fill="both", expand=True, padx=(8, 4), pady=8)
        self._build_canvas(left_col)

        # Info panel (right)
        right_col = tk.Frame(body, bg=PANEL_BG, width=370)
        right_col.pack(side="right", fill="y", padx=(4, 8), pady=8)
        right_col.pack_propagate(False)
        self._build_info(right_col)

        self._build_controls()

    # ── canvas area ────────────────────────────────────────────────────
    def _build_canvas(self, parent):
        # Progress row
        prog_row = tk.Frame(parent, bg=BG)
        prog_row.pack(fill="x")
        tk.Label(prog_row, text="Progress:", bg=BG, fg=SUBTEXT, font=self.fn_small).pack(side="left", padx=4)
        self.prog_var = tk.DoubleVar()
        ttk.Progressbar(prog_row, variable=self.prog_var, maximum=100,
                        length=320, style="TProgressbar").pack(side="left", padx=6)
        self.step_lbl = tk.Label(prog_row, text="0/0", bg=BG, fg=ACCENT, font=self.fn_small)
        self.step_lbl.pack(side="left")

        # Main canvas
        self.canvas = tk.Canvas(parent, bg=BG, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # HashMap canvas below
        separator = tk.Frame(parent, bg=DIVIDER, height=1)
        separator.pack(fill="x", padx=8, pady=4)
        tk.Label(parent, text="HashMap  (char → last index)",
                 bg=BG, fg=ACCENT, font=self.fn_badge).pack(anchor="w", padx=8)
        self.map_canvas = tk.Canvas(parent, bg=CARD_BG, height=60,
                                    highlightthickness=0)
        self.map_canvas.pack(fill="x", padx=8, pady=(2, 6))

    # ── info panel ─────────────────────────────────────────────────────
    def _build_info(self, parent):
        def section(title):
            tk.Label(parent, text=title, bg=PANEL_BG, fg=ACCENT,
                     font=self.fn_badge, anchor="w").pack(fill="x", padx=10, pady=(10, 2))
            tk.Frame(parent, bg=DIVIDER, height=1).pack(fill="x", padx=10, pady=(0, 6))

        section("📋 CURRENT STEP")
        self.msg_var = tk.StringVar(value="Load a string to begin...")
        tk.Label(parent, textvariable=self.msg_var, bg=CARD_BG, fg=TEXT,
                 font=self.fn_code_s, wraplength=340, justify="left",
                 padx=10, pady=10, anchor="w").pack(fill="x", padx=10, pady=(0, 6))

        section("📊 WINDOW STATE")
        win_frame = tk.Frame(parent, bg=CARD_BG)
        win_frame.pack(fill="x", padx=10, pady=(0, 8))
        def stat_row(label, var_ref):
            row = tk.Frame(win_frame, bg=CARD_BG)
            row.pack(fill="x", padx=8, pady=2)
            tk.Label(row, text=label, bg=CARD_BG, fg=SUBTEXT,
                     font=self.fn_small, width=16, anchor="w").pack(side="left")
            lbl = tk.Label(row, text="—", bg=CARD_BG, fg=ACCENT,
                           font=self.fn_code_s)
            lbl.pack(side="left")
            return lbl

        self.lbl_l      = stat_row("Left  (l):", None)
        self.lbl_r      = stat_row("Right (r):", None)
        self.lbl_window = stat_row("Window:", None)
        self.lbl_winlen = stat_row("Win Length:", None)
        self.lbl_best   = stat_row("Best:", None)
        self.lbl_bestlen= stat_row("Best Length:", None)

        section("🎨 LEGEND")
        legends = [
            (GREEN,    "Left pointer  (l)"),
            (ORANGE,   "Right pointer (r)"),
            (TEAL,     "Inside window"),
            (RED,      "Duplicate found"),
            (PURPLE,   "New best window"),
        ]
        leg_f = tk.Frame(parent, bg=PANEL_BG)
        leg_f.pack(fill="x", padx=10, pady=(0, 8))
        for col, label in legends:
            row = tk.Frame(leg_f, bg=PANEL_BG)
            row.pack(fill="x", pady=1)
            tk.Canvas(row, bg=col, width=16, height=16, highlightthickness=0).pack(side="left", padx=(4,8))
            tk.Label(row, text=label, bg=PANEL_BG, fg=TEXT, font=self.fn_small).pack(side="left")

        section("⏱️ COMPLEXITY")
        complexities = [
            ("Time",    "O(n)"),
            ("Space",   "O(min(m,n))"),
            ("m = charset", "26/128/256"),
            ("Pattern", "Sliding Window"),
        ]
        comp_f = tk.Frame(parent, bg=CARD_BG)
        comp_f.pack(fill="x", padx=10, pady=(0, 8))
        for k, v in complexities:
            row = tk.Frame(comp_f, bg=CARD_BG)
            row.pack(fill="x", padx=8, pady=2)
            tk.Label(row, text=k, bg=CARD_BG, fg=SUBTEXT,
                     font=self.fn_small, width=16, anchor="w").pack(side="left")
            tk.Label(row, text=v, bg=CARD_BG, fg=ACCENT,
                     font=tkfont.Font(family="Consolas", size=10, weight="bold")).pack(side="left")

        section("🎛️ PRESETS")
        pre_f = tk.Frame(parent, bg=PANEL_BG)
        pre_f.pack(fill="x", padx=10, pady=(0, 8))
        for name in self.PRESETS:
            tk.Button(pre_f, text=f'"{name}"', font=self.fn_small,
                      bg=CARD_BG, fg=TEXT, relief="flat", cursor="hand2",
                      pady=2, anchor="w",
                      command=lambda n=name: self._load(self.PRESETS[n])
                      ).pack(fill="x", pady=1, padx=2)

        section("✏️ CUSTOM INPUT")
        inp_f = tk.Frame(parent, bg=PANEL_BG)
        inp_f.pack(fill="x", padx=10, pady=(0, 10))
        self.custom_entry = tk.Entry(inp_f, bg=CARD_BG, fg=TEXT,
                                     font=self.fn_code_s, relief="flat",
                                     insertbackground=ACCENT)
        self.custom_entry.insert(0, "type any string...")
        self.custom_entry.pack(fill="x", padx=4, pady=4)
        tk.Button(inp_f, text="▶ Load", font=self.fn_small,
                  bg=ACCENT, fg=BG, relief="flat", cursor="hand2",
                  command=self._load_custom).pack(fill="x", padx=4, pady=2)

    # ── controls bar ────────────────────────────────────────────────────
    def _build_controls(self):
        ctrl = tk.Frame(self, bg=PANEL_BG, height=78)
        ctrl.pack(fill="x", side="bottom")
        ctrl.pack_propagate(False)
        inner = tk.Frame(ctrl, bg=PANEL_BG)
        inner.pack(expand=True, pady=10)

        btn = dict(bg=CARD_BG, fg=TEXT, font=self.fn_btn, relief="flat",
                   cursor="hand2", activebackground=ACCENT,
                   activeforeground=BG, width=10, pady=5)

        tk.Button(inner, text="⏮ Prev",  **btn, command=self._prev).pack(side="left", padx=5)
        play_btn = {**btn, "bg": ACCENT, "fg": BG}
        self.btn_play = tk.Button(inner, text="▶ Play", **play_btn, command=self._toggle_play)
        self.btn_play.pack(side="left", padx=5)
        tk.Button(inner, text="Next ⏭",  **btn, command=self._next).pack(side="left", padx=5)
        tk.Button(inner, text="↺ Reset",  **btn, command=self._reset).pack(side="left", padx=5)

        spd = tk.Frame(inner, bg=PANEL_BG)
        spd.pack(side="left", padx=20)
        tk.Label(spd, text="Speed", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack()
        self._spd_var = tk.DoubleVar(value=0.8)
        ttk.Scale(spd, from_=0.1, to=3.0, variable=self._spd_var,
                  command=self._on_speed, orient="horizontal", length=150).pack()
        sl = tk.Frame(spd, bg=PANEL_BG); sl.pack(fill="x")
        tk.Label(sl, text="Slow", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack(side="left")
        tk.Label(sl, text="Fast", bg=PANEL_BG, fg=SUBTEXT, font=self.fn_small).pack(side="right")

    # ── load ────────────────────────────────────────────────────────────
    def _load(self, s: str):
        self._stop_play()
        self.engine       = SlidingWindowEngine(s)
        self.steps        = self.engine.steps
        self.current_step = 0
        self._render(0)

    def _load_custom(self):
        s = self.custom_entry.get().strip()
        if s in ("type any string...", ""):
            s = ""
        self._load(s)

    def _on_speed(self, val):
        try: self._speed_val = float(val)
        except: pass

    # ── playback ────────────────────────────────────────────────────────
    def _toggle_play(self):
        if self.playing: self._stop_play()
        else:            self._start_play()

    def _start_play(self):
        if not self.steps: return
        if self.current_step >= len(self.steps) - 1:
            self.current_step = 0
        self.playing = True
        self._stop_flag.clear()
        self.btn_play.config(text="⏸ Pause", bg=ORANGE, fg=BG)
        threading.Thread(target=self._loop, daemon=True).start()

    def _stop_play(self):
        self._stop_flag.set()
        self.playing = False
        self.btn_play.config(text="▶ Play", bg=ACCENT, fg=BG)

    def _loop(self):
        while not self._stop_flag.is_set():
            if self.current_step >= len(self.steps) - 1:
                self.after(0, self._stop_play)
                break
            self.current_step += 1
            self.after(0, self._render, self.current_step)
            time.sleep(1.0 / max(self._speed_val, 0.1))

    def _next(self):
        if self.steps and self.current_step < len(self.steps) - 1:
            self.current_step += 1; self._render(self.current_step)

    def _prev(self):
        if self.steps and self.current_step > 0:
            self.current_step -= 1; self._render(self.current_step)

    def _reset(self):
        self._stop_play(); self.current_step = 0
        if self.steps: self._render(0)

    # ── renderer ────────────────────────────────────────────────────────
    def _render(self, idx):
        if not self.steps: return
        step = self.steps[idx]
        s    = self.engine.s
        n    = len(s)

        # Progress
        total = max(len(self.steps) - 1, 1)
        self.prog_var.set(idx / total * 100)
        self.step_lbl.config(text=f"{idx+1}/{len(self.steps)}")

        # Sidebar stats
        l, r = step["l"], step["r"]
        bl, br = step["best_l"], step["best_r"]
        self.msg_var.set(step["msg"])
        self.lbl_l.config(text=str(l))
        self.lbl_r.config(text=str(r) if r >= 0 else "—")
        self.lbl_window.config(text=f'"{step["window"]}"' if step["window"] else '""')
        self.lbl_winlen.config(text=str(step["length"]))
        best_str = s[bl:br+1] if br >= bl else ""
        self.lbl_best.config(text=f'"{best_str}"')
        self.lbl_bestlen.config(text=str(len(best_str)))

        # Canvas
        self.canvas.delete("all")
        W = self.canvas.winfo_width()  or 900
        H = self.canvas.winfo_height() or 300

        if n == 0:
            self.canvas.create_text(W//2, H//2, text="Empty string — answer is 0",
                                    fill=SUBTEXT, font=self.fn_code)
            return

        # Character box dimensions
        BOX = min(int((W - 80) / max(n, 1)), 68)
        BOX = max(BOX, 28)
        total_w = n * BOX
        start_x = (W - total_w) // 2
        box_y   = H // 2 - BOX // 2

        # Best window backdrop
        if br >= bl:
            bx1 = start_x + bl * BOX
            bx2 = start_x + (br + 1) * BOX
            self.canvas.create_rectangle(bx1 - 2, box_y - 28, bx2 + 2,
                                          box_y + BOX + 28,
                                          fill="#1A1A2E", outline=PURPLE, width=2, dash=(4, 3))
            self.canvas.create_text((bx1 + bx2) // 2, box_y - 38,
                                    text=f"Best: \"{best_str}\" (len={len(best_str)})",
                                    fill=PURPLE, font=self.fn_badge)

        event = step["event"]

        for i in range(n):
            x1 = start_x + i * BOX
            x2 = x1 + BOX
            y1 = box_y
            y2 = box_y + BOX

            # Determine box colour
            if i == r and event == "duplicate":
                colour = "#5C1A1A"
                outline = RED
                ow = 3
            elif i == r:
                colour = "#0D3D56"
                outline = ACCENT
                ow = 3
            elif l <= i <= r:
                colour = "#0D3D2A"
                outline = GREEN
                ow = 2
            elif bl <= i <= br:
                colour = "#1A1A2E"
                outline = PURPLE
                ow = 1
            else:
                colour = CHAR_DEF
                outline = DIVIDER
                ow = 1

            self.canvas.create_rectangle(x1+2, y1+2, x2-2, y2-2,
                                         fill=colour, outline=outline, width=ow)
            char = s[i] if i < n else ""
            self.canvas.create_text((x1+x2)//2, (y1+y2)//2,
                                    text=char, fill=TEXT, font=self.fn_char)
            # Index
            self.canvas.create_text((x1+x2)//2, y2+14,
                                    text=str(i), fill=SUBTEXT, font=self.fn_idx)

        # Left pointer arrow
        if l < n:
            lx = start_x + l * BOX + BOX // 2
            self.canvas.create_polygon(lx-8, box_y-6, lx+8, box_y-6, lx, box_y+4,
                                       fill=GREEN, outline="")
            self.canvas.create_text(lx, box_y-18, text=f"l={l}", fill=GREEN, font=self.fn_badge)

        # Right pointer arrow
        if 0 <= r < n:
            rx = start_x + r * BOX + BOX // 2
            self.canvas.create_polygon(rx-8, box_y+BOX+6, rx+8, box_y+BOX+6, rx, box_y+BOX-4,
                                       fill=ORANGE, outline="")
            self.canvas.create_text(rx, box_y+BOX+20, text=f"r={r}", fill=ORANGE, font=self.fn_badge)

        # Event label
        event_colours = {
            "expand"   : (TEAL,   "▶ EXPAND"),
            "shrink"   : (RED,    "◀ SHRINK"),
            "duplicate": (RED,    "⚠ DUPLICATE"),
            "best"     : (PURPLE, "⭐ NEW BEST"),
            "normal"   : (SUBTEXT,"● UPDATE"),
        }
        ecol, elabel = event_colours.get(event, (SUBTEXT, ""))
        self.canvas.create_text(W//2, box_y - 60,
                                text=elabel, fill=ecol,
                                font=tkfont.Font(family="Segoe UI", size=14, weight="bold"))

        # Draw HashMap
        self._draw_map(step["char_map"], l, r)

    def _draw_map(self, char_map, l, r):
        self.map_canvas.delete("all")
        if not char_map:
            self.map_canvas.create_text(10, 30, text="{ }", fill=SUBTEXT,
                                        font=self.fn_code, anchor="w")
            return
        W   = self.map_canvas.winfo_width() or 700
        bw  = max(min(W // max(len(char_map), 1) - 4, 80), 30)
        x   = 8
        for ch, idx in sorted(char_map.items()):
            in_win = (idx >= l)
            col  = GREEN if in_win else DIVIDER
            outline = ACCENT if in_win else DIVIDER
            self.map_canvas.create_rectangle(x, 4, x+bw, 52,
                                             fill=CARD_BG, outline=outline, width=1+(1 if in_win else 0))
            self.map_canvas.create_text(x+bw//2, 20, text=f"'{ch}'",
                                        fill=YELLOW if in_win else SUBTEXT,
                                        font=self.fn_code_s)
            self.map_canvas.create_text(x+bw//2, 38, text=str(idx),
                                        fill=ACCENT if in_win else SUBTEXT,
                                        font=self.fn_idx)
            x += bw + 4


# ───────────────────────── ENTRY POINT ──────────────────────────────────

if __name__ == "__main__":
    style = ttk.Style()
    try: style.theme_use("clam")
    except: pass
    style.configure("TProgressbar", troughcolor=CARD_BG, background=ACCENT, thickness=6)

    app = LCVisualizer()
    app.mainloop()
