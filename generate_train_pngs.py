import zlib, struct, math, os, shutil

class SupersampledCanvas:
    def __init__(self, target_w, target_h, scale=2):
        self.tw = target_w
        self.th = target_h
        self.scale = scale
        self.w = target_w * scale
        self.h = target_h * scale
        self.pixels = bytearray(self.w * self.h * 4) # RGBA

    def blend_pixel(self, x, y, r, g, b, a):
        if not (0 <= x < self.w and 0 <= y < self.h):
            return
        idx = (y * self.w + x) * 4
        if a >= 255:
            self.pixels[idx] = r
            self.pixels[idx+1] = g
            self.pixels[idx+2] = b
            self.pixels[idx+3] = 255
        else:
            dst_a = self.pixels[idx+3] / 255.0
            src_a = a / 255.0
            out_a = src_a + dst_a * (1.0 - src_a)
            if out_a > 0:
                self.pixels[idx] = int((r * src_a + self.pixels[idx] * dst_a * (1.0 - src_a)) / out_a)
                self.pixels[idx+1] = int((g * src_a + self.pixels[idx+1] * dst_a * (1.0 - src_a)) / out_a)
                self.pixels[idx+2] = int((b * src_a + self.pixels[idx+2] * dst_a * (1.0 - src_a)) / out_a)
                self.pixels[idx+3] = int(out_a * 255)

    def fill_rect(self, x0, y0, w, h, color):
        r, g, b, a = color
        x0 *= self.scale
        y0 *= self.scale
        w *= self.scale
        h *= self.scale
        x1 = max(0, min(self.w, int(x0)))
        x2 = max(0, min(self.w, int(x0 + w)))
        y1 = max(0, min(self.h, int(y0)))
        y2 = max(0, min(self.h, int(y0 + h)))
        for y in range(y1, y2):
            for x in range(x1, x2):
                self.blend_pixel(x, y, r, g, b, a)

    def fill_rounded_rect(self, x0, y0, w, h, radius, color):
        r, g, b, a = color
        x0 *= self.scale
        y0 *= self.scale
        w *= self.scale
        h *= self.scale
        radius *= self.scale
        x1 = max(0, min(self.w, int(x0)))
        x2 = max(0, min(self.w, int(x0 + w)))
        y1 = max(0, min(self.h, int(y0)))
        y2 = max(0, min(self.h, int(y0 + h)))
        
        rad2 = radius * radius
        for y in range(y1, y2):
            for x in range(x1, x2):
                # Check 4 corners
                in_corner = False
                if x < x0 + radius and y < y0 + radius:
                    dx, dy = (x0 + radius) - x, (y0 + radius) - y
                    in_corner = (dx*dx + dy*dy > rad2)
                elif x > x0 + w - radius and y < y0 + radius:
                    dx, dy = x - (x0 + w - radius), (y0 + radius) - y
                    in_corner = (dx*dx + dy*dy > rad2)
                elif x < x0 + radius and y > y0 + h - radius:
                    dx, dy = (x0 + radius) - x, y - (y0 + h - radius)
                    in_corner = (dx*dx + dy*dy > rad2)
                elif x > x0 + w - radius and y > y0 + h - radius:
                    dx, dy = x - (x0 + w - radius), y - (y0 + h - radius)
                    in_corner = (dx*dx + dy*dy > rad2)
                
                if not in_corner:
                    self.blend_pixel(x, y, r, g, b, a)

    def fill_circle(self, cx, cy, radius, color):
        r, g, b, a = color
        cx *= self.scale
        cy *= self.scale
        radius *= self.scale
        x1 = max(0, int(cx - radius - 1))
        x2 = min(self.w, int(cx + radius + 2))
        y1 = max(0, int(cy - radius - 1))
        y2 = min(self.h, int(cy + radius + 2))
        r2 = radius * radius
        for y in range(y1, y2):
            for x in range(x1, x2):
                dx = x - cx + 0.5
                dy = y - cy + 0.5
                if dx*dx + dy*dy <= r2:
                    self.blend_pixel(x, y, r, g, b, a)

    def fill_polygon(self, points, color):
        r, g, b, a = color
        pts = [(p[0] * self.scale, p[1] * self.scale) for p in points]
        min_x = max(0, int(min(p[0] for p in pts)))
        max_x = min(self.w, int(max(p[0] for p in pts)) + 1)
        min_y = max(0, int(min(p[1] for p in pts)))
        max_y = min(self.h, int(max(p[1] for p in pts)) + 1)
        n = len(pts)

        for y in range(min_y, max_y):
            py = y + 0.5
            # Find intersections with polygon edges
            intersections = []
            for i in range(n):
                p1 = pts[i]
                p2 = pts[(i + 1) % n]
                if (p1[1] <= py < p2[1]) or (p2[1] <= py < p1[1]):
                    if abs(p2[1] - p1[1]) > 1e-6:
                        t = (py - p1[1]) / (p2[1] - p1[1])
                        intersections.append(p1[0] + t * (p2[0] - p1[0]))
            intersections.sort()
            for j in range(0, len(intersections), 2):
                if j + 1 < len(intersections):
                    ix1 = max(min_x, int(intersections[j]))
                    ix2 = min(max_x, int(intersections[j + 1]) + 1)
                    for x in range(ix1, ix2):
                        self.blend_pixel(x, y, r, g, b, a)

    def get_downsampled_png_bytes(self):
        # Downsample scale x scale box filter to target_w x target_h
        raw = bytearray()
        s2 = self.scale * self.scale
        for ty in range(self.th):
            raw.append(0) # filter type none
            sy0 = ty * self.scale
            for tx in range(self.tw):
                sx0 = tx * self.scale
                sr = sg = sb = sa = 0
                for dy in range(self.scale):
                    row_start = (sy0 + dy) * self.w * 4
                    for dx in range(self.scale):
                        idx = row_start + (sx0 + dx) * 4
                        sr += self.pixels[idx]
                        sg += self.pixels[idx+1]
                        sb += self.pixels[idx+2]
                        sa += self.pixels[idx+3]
                raw.append(sr // s2)
                raw.append(sg // s2)
                raw.append(sb // s2)
                raw.append(sa // s2)

        compressed = zlib.compress(bytes(raw), level=9)
        ihdr = struct.pack('>IIBBBBB', self.tw, self.th, 8, 6, 0, 0, 0)
        def chunk(tag, data):
            return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    return (int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16), alpha)

# Colors matching user uploaded images exactly
C_TIE = hex_to_rgba('#8c533c')          # Brown sleeper
C_RAIL = hex_to_rgba('#60656a')         # Grey steel rail
C_CHASSIS = hex_to_rgba('#3d4246')      # Dark charcoal undercarriage
C_COUPLER = hex_to_rgba('#43484c')      # Coupler pin
C_WHEEL_OUTER = hex_to_rgba('#cf1b6a')  # Magenta wheel rim
C_WHEEL_INNER = hex_to_rgba('#ffd100')  # Yellow wheel disc
C_WHEEL_HUB = hex_to_rgba('#ffffff')    # White center hub

# Locomotive specific
C_LOKO_COW = hex_to_rgba('#e95e38')     # Orange cowcatcher & cap
C_LOKO_CHIMNEY = hex_to_rgba('#e05338') # Coral red chimney
C_LOKO_BOILER = hex_to_rgba('#ffd100')  # Canary yellow boiler
C_LOKO_CABIN = hex_to_rgba('#2792d4')   # Blue cabin & deck
C_LOKO_ROOF = hex_to_rgba('#e97638')    # Orange roof
C_LOKO_WINDOW = hex_to_rgba('#bce8f5')  # Light blue window
C_LOKO_GLARE = hex_to_rgba('#dcf3fa')   # Glare on window

# Wagon specific
C_VAGO_BODY = hex_to_rgba('#48b8c8')    # Turquoise/cyan hopper body
C_VAGO_RIM = hex_to_rgba('#ffd100')     # Yellow top rim
C_VAGO_WOOD = hex_to_rgba('#8c533c')    # Brown wooden plank bed

def render_loko_png():
    # 320x220 canvas
    c = SupersampledCanvas(320, 220, scale=3)

    # 1. Tracks (brown ties + grey rail)
    for x in [15, 65, 115, 165, 215, 265]:
        c.fill_rounded_rect(x, 196, 34, 10, 2, C_TIE)
    c.fill_rounded_rect(10, 190, 300, 6, 2, C_RAIL)

    # 2. Coupler on rear (right)
    c.fill_rounded_rect(296, 148, 22, 6, 2, C_COUPLER)

    # 3. Front Cowcatcher (left)
    c.fill_polygon([(38, 186), (85, 134), (85, 186)], C_LOKO_COW)

    # 4. Chimney
    c.fill_polygon([(90, 88), (95, 48), (123, 48), (128, 88)], C_LOKO_CHIMNEY)
    c.fill_rounded_rect(91, 40, 36, 10, 3, C_LOKO_CHIMNEY)
    c.fill_circle(109, 41, 10, hex_to_rgba('#c74127'))

    # 5. Boiler cap (nose on front of boiler)
    c.fill_polygon([(65, 90), (85, 90), (85, 136), (65, 136)], C_LOKO_COW)
    c.fill_circle(85, 113, 23, C_LOKO_COW)

    # 6. Yellow Boiler Body
    c.fill_rounded_rect(83, 88, 118, 48, 2, C_LOKO_BOILER)
    # Bottom orange trim
    c.fill_rect(83, 132, 118, 5, C_LOKO_COW)

    # 7. Blue Cabin
    c.fill_rounded_rect(198, 58, 98, 80, 3, C_LOKO_CABIN)

    # 8. Orange Cabin Roof
    c.fill_rounded_rect(192, 46, 110, 14, 5, C_LOKO_ROOF)

    # 9. Cabin Window
    c.fill_polygon([(212, 68), (284, 68), (284, 98), (220, 98)], C_LOKO_WINDOW)
    c.fill_polygon([(230, 68), (245, 68), (235, 98), (220, 98)], C_LOKO_GLARE)

    # 10. Blue lower chassis deck
    c.fill_rounded_rect(83, 136, 215, 18, 2, C_LOKO_CABIN)

    # 11. Dark charcoal undercarriage
    c.fill_rounded_rect(85, 154, 210, 24, 4, C_CHASSIS)

    # 12. Three large wheels
    for cx in [122, 188, 254]:
        c.fill_circle(cx, 166, 28, C_WHEEL_OUTER)
        c.fill_circle(cx, 166, 20, C_WHEEL_INNER)
        c.fill_circle(cx, 166, 7, C_WHEEL_HUB)

    return c.get_downsampled_png_bytes()

def render_vago_png():
    # 240x220 canvas
    c = SupersampledCanvas(240, 220, scale=3)

    # 1. Tracks
    for x in [15, 65, 115, 165]:
        c.fill_rounded_rect(x, 196, 34, 10, 2, C_TIE)
    c.fill_rounded_rect(5, 190, 230, 6, 2, C_RAIL)

    # 2. Couplers left and right
    c.fill_rounded_rect(0, 146, 26, 6, 2, C_COUPLER)
    c.fill_rounded_rect(214, 146, 26, 6, 2, C_COUPLER)

    # 3. Turquoise / cyan hopper container
    c.fill_polygon([(24, 48), (216, 48), (206, 140), (34, 140)], C_VAGO_BODY)

    # 4. Yellow top rim
    c.fill_rounded_rect(18, 38, 204, 14, 4, C_VAGO_RIM)

    # 5. Wooden base plank
    c.fill_rounded_rect(22, 140, 196, 14, 2, C_VAGO_WOOD)

    # 6. Dark charcoal undercarriage
    c.fill_rounded_rect(42, 154, 156, 24, 4, C_CHASSIS)

    # 7. Two wheels
    for cx in [80, 160]:
        c.fill_circle(cx, 166, 28, C_WHEEL_OUTER)
        c.fill_circle(cx, 166, 20, C_WHEEL_INNER)
        c.fill_circle(cx, 166, 7, C_WHEEL_HUB)

    return c.get_downsampled_png_bytes()

os.makedirs('public', exist_ok=True)

with open('public/loko.png', 'wb') as f:
    f.write(render_loko_png())

with open('public/vago.png', 'wb') as f:
    f.write(render_vago_png())

if os.path.exists('dist'):
    shutil.copy('public/loko.png', 'dist/loko.png')
    shutil.copy('public/vago.png', 'dist/vago.png')

print(f"loko.png generated: {os.path.getsize('public/loko.png')} bytes")
print(f"vago.png generated: {os.path.getsize('public/vago.png')} bytes")
