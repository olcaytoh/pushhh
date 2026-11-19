import zlib, struct, math

class Canvas:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        self.pixels = bytearray(w * h * 4) # RGBA

    def fill_rect(self, x0, y0, w, h, r, g, b, a=255):
        x1 = max(0, min(self.w, int(x0)))
        x2 = max(0, min(self.w, int(x0 + w)))
        y1 = max(0, min(self.h, int(y0)))
        y2 = max(0, min(self.h, int(y0 + h)))
        for y in range(y1, y2):
            for x in range(x1, x2):
                idx = (y * self.w + x) * 4
                self.pixels[idx] = r
                self.pixels[idx+1] = g
                self.pixels[idx+2] = b
                self.pixels[idx+3] = a

    def fill_circle(self, cx, cy, radius, r, g, b, a=255):
        x1 = max(0, int(cx - radius - 1))
        x2 = min(self.w, int(cx + radius + 2))
        y1 = max(0, int(cy - radius - 1))
        y2 = min(self.h, int(cy + radius + 2))
        r2 = radius * radius
        for y in range(y1, y2):
            for x in range(x1, x2):
                dx = x - cx + 0.5
                dy = y - cy + 0.5
                d2 = dx * dx + dy * dy
                if d2 <= r2:
                    idx = (y * self.w + x) * 4
                    self.pixels[idx] = r
                    self.pixels[idx+1] = g
                    self.pixels[idx+2] = b
                    self.pixels[idx+3] = a

    def save_png(self, path):
        raw = bytearray()
        for y in range(self.h):
            raw.append(0) # filter type none
            start = y * self.w * 4
            raw.extend(self.pixels[start:start + self.w * 4])
        compressed = zlib.compress(bytes(raw), level=9)
        ihdr = struct.pack('>IIBBBBB', self.w, self.h, 8, 6, 0, 0, 0)
        def chunk(tag, data):
            return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
        with open(path, 'wb') as f:
            f.write(png)

c = Canvas(100, 100)
c.fill_rect(10, 10, 80, 80, 255, 0, 0)
c.fill_circle(50, 50, 25, 255, 255, 0)
c.save_png('test_out.png')
print('Done!')
