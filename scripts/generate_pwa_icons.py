import struct
import zlib
import os
import math

def write_png(filename, width, height, is_maskable=False):
    # Generates a PNG with Marsil navy #0B2A4A background, orange #F28C28 stylized M
    bg_r, bg_g, bg_b = 11, 42, 74      # #0B2A4A
    orange_r, orange_g, orange_b = 242, 140, 40  # #F28C28
    white_r, white_g, white_b = 255, 255, 255
    border_r, border_g, border_b = 242, 140, 40

    raw_data = bytearray()
    
    # Safe radius and dimensions
    corner_radius = width * 0.22 if not is_maskable else 0
    center_x = width / 2.0
    center_y = height * 0.44
    scale = width / 512.0

    # Marsil M points scaled
    m_half_w = 110.0 * scale
    m_top = center_y - 70.0 * scale
    m_bot = center_y + 80.0 * scale
    m_thickness = 40.0 * scale

    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            # Check rounded corner for non-maskable
            r, g, b = bg_r, bg_g, bg_b

            if not is_maskable:
                # Rounded corners
                dx = max(0, abs(x - center_x) - (center_x - corner_radius))
                dy = max(0, abs(y - height / 2.0) - (height / 2.0 - corner_radius))
                dist = math.sqrt(dx * dx + dy * dy)
                if dist > corner_radius:
                    # Outside icon boundary - transparent or dark
                    raw_data.extend([0, 0, 0, 0])
                    continue

            # Draw outer subtle border
            if not is_maskable:
                inset = 16 * scale
                if (abs(x - center_x) > center_x - inset - 2 and abs(x - center_x) < center_x - inset + 2) or \
                   (abs(y - height/2.0) > height/2.0 - inset - 2 and abs(y - height/2.0) < height/2.0 - inset + 2):
                    r = int(bg_r * 0.6 + border_r * 0.4)
                    g = int(bg_g * 0.6 + border_g * 0.4)
                    b = int(bg_b * 0.6 + border_b * 0.4)

            # Draw letter "M"
            nx = (x - center_x) / scale
            ny = (y - center_y) / scale

            is_m = False
            # Left pillar
            if -110 <= nx <= -70 and -70 <= ny <= 90:
                is_m = True
            # Right pillar
            elif 70 <= nx <= 110 and -70 <= ny <= 90:
                is_m = True
            # Left diagonal
            elif -80 <= nx <= 0 and abs(ny - (nx * 1.0 + 10)) <= 25:
                is_m = True
            # Right diagonal
            elif 0 <= nx <= 80 and abs(ny - (-nx * 1.0 + 10)) <= 25:
                is_m = True

            # Node dots
            if (nx + 90)**2 + (ny + 70)**2 <= 14**2:
                raw_data.extend([white_r, white_g, white_b, 255])
                continue
            elif (nx - 90)**2 + (ny + 70)**2 <= 14**2:
                raw_data.extend([white_r, white_g, white_b, 255])
                continue
            elif nx**2 + (ny + 10)**2 <= 12**2:
                raw_data.extend([white_r, white_g, white_b, 255])
                continue

            if is_m:
                r, g, b = orange_r, orange_g, orange_b

            # Horizontal bar at bottom: "MARSIL" bar
            bar_y = height * 0.76
            bar_h = 24.0 * scale
            bar_w = 180.0 * scale
            if abs(x - center_x) <= bar_w / 2.0 and abs(y - bar_y) <= bar_h / 2.0:
                r = int(bg_r * 0.4 + orange_r * 0.6)
                g = int(bg_g * 0.4 + orange_g * 0.6)
                b = int(bg_b * 0.4 + orange_b * 0.6)

            raw_data.extend([r, g, b, 255])

    def chunk(chunk_type, data):
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png += chunk(b'IHDR', ihdr_data)
    # IDAT
    compressed = zlib.compress(bytes(raw_data), 9)
    png += chunk(b'IDAT', compressed)
    # IEND
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

os.makedirs('public', exist_ok=True)
write_png('public/pwa-192x192.png', 192, 192, is_maskable=False)
write_png('public/pwa-512x512.png', 512, 512, is_maskable=False)
write_png('public/pwa-maskable-512x512.png', 512, 512, is_maskable=True)
write_png('public/apple-touch-icon.png', 180, 180, is_maskable=False)
