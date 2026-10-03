#!/usr/bin/env python3
"""Generate Zmovie PWA icons (192, 512, apple-touch-icon, favicon)."""

import struct
import zlib
import os

OUT_DIR = "/home/z/my-project/public"

def make_png(width, height, pixels):
    """Make a PNG file from RGBA pixel data (row-major)."""
    sig = b'\x89PNG\r\n\x1a\n'

    def chunk(name, data):
        c = name + data
        return (
            struct.pack('>I', len(data)) +
            c +
            struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)
        )

    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    raw = b''
    for y in range(height):
        raw += b'\x00'
        raw += bytes(pixels[y * width * 4 : (y + 1) * width * 4])
    idat = chunk(b'IDAT', zlib.compress(raw, 9))
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend


def make_zmovie_icon(size, transparent_bg=False, bg_color=(20, 12, 8)):
    """Generate a Zmovie icon at given size."""
    pixels = bytearray(size * size * 4)

    if transparent_bg:
        bg = (0, 0, 0, 0)
    else:
        bg = (bg_color[0], bg_color[1], bg_color[2], 255)

    for i in range(size * size):
        pixels[i * 4 + 0] = bg[0]
        pixels[i * 4 + 1] = bg[1]
        pixels[i * 4 + 2] = bg[2]
        pixels[i * 4 + 3] = bg[3]

    stroke_w = max(size // 8, 4)
    margin = size // 6
    red = (229, 9, 20, 255)

    # Top horizontal stroke
    for y in range(margin, margin + stroke_w):
        for x in range(margin, size - margin):
            idx = (y * size + x) * 4
            pixels[idx:idx + 4] = bytes(red)

    # Diagonal stroke (top-right to bottom-left)
    x1 = size - margin - stroke_w
    y1 = margin + stroke_w
    x2 = margin
    y2 = size - margin - stroke_w
    dx = x2 - x1
    dy = y2 - y1
    steps = max(abs(dx), abs(dy))
    if steps > 0:
        for s in range(steps + 1):
            t = s / steps
            cx = int(x1 + t * dx)
            cy = int(y1 + t * dy)
            for ty in range(-stroke_w // 2, stroke_w // 2 + 1):
                for tx in range(-stroke_w // 2, stroke_w // 2 + 1):
                    px = cx + tx
                    py = cy + ty
                    if 0 <= px < size and 0 <= py < size:
                        idx = (py * size + px) * 4
                        pixels[idx:idx + 4] = bytes(red)

    # Bottom horizontal stroke
    for y in range(size - margin - stroke_w, size - margin):
        for x in range(margin, size - margin):
            idx = (y * size + x) * 4
            pixels[idx:idx + 4] = bytes(red)

    return make_png(size, size, pixels)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(f"{OUT_DIR}/icons", exist_ok=True)

    for name, size in [
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("maskable-512.png", 512),
        ("apple-touch-icon.png", 180),
    ]:
        png = make_zmovie_icon(size)
        with open(f"{OUT_DIR}/icons/{name}", "wb") as f:
            f.write(png)
        print(f"Created icons/{name}")

    # 32x32 favicon
    png = make_zmovie_icon(32)
    with open(f"{OUT_DIR}/favicon-32.png", "wb") as f:
        f.write(png)
    print("Created favicon-32.png")


if __name__ == "__main__":
    main()
