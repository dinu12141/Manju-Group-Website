import os
from PIL import Image

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public")

# Filename (relative to PUBLIC_DIR, forward slashes) -> max longest-side px.
# Actual max on-page display width across the site tops out around 550px;
# these caps give ~1.3-2x headroom for retina without shipping full-res source art.
SIZE_OVERRIDES = {
    "manju-logo.png": 400,
    "manju-logo-circle.png": 400,
    "manju-logo-transparent.png": 400,
    "manju-group-logo.png": 400,
    "manju-emblem-blue-transparent.png": 400,
    "manju-emblem-white-transparent.png": 400,
    "banner_ebike_cinematic.jpg": 1280,
    "banner_smarttv_cinematic.jpg": 1280,
}

DEFAULT_MAX = 700  # product photos, ad creatives

# Icons that must stay PNG (favicons / app icons referenced by exact filename
# in index.html, manifest.json, and OS/browser chrome — cannot become .webp).
KEEP_AS_PNG = {
    "favicon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "app-icon-512.png",
}


def convert_image(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        return

    rel = os.path.relpath(filepath, PUBLIC_DIR).replace("\\", "/")
    orig_size = os.path.getsize(filepath)

    if rel in KEEP_AS_PNG:
        try:
            with Image.open(filepath) as img:
                img.save(filepath, "PNG", optimize=True, compress_level=9)
            new_size = os.path.getsize(filepath)
            print(f"Optimized (kept PNG) {rel}: {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB")
        except Exception as e:
            print(f"Error optimizing {filepath}: {e}")
        return

    max_dimension = SIZE_OVERRIDES.get(rel, DEFAULT_MAX)
    webp_path = os.path.splitext(filepath)[0] + ".webp"

    try:
        with Image.open(filepath) as img:
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
            if has_alpha:
                img = img.convert("RGBA")
                img.save(webp_path, "WEBP", quality=82, method=6)
            else:
                img = img.convert("RGB")
                img.save(webp_path, "WEBP", quality=80, method=6)

        new_size = os.path.getsize(webp_path)
        os.remove(filepath)
        saved = orig_size - new_size
        pct = (saved / orig_size) * 100 if orig_size > 0 else 0
        print(f"Converted {rel} -> {os.path.basename(webp_path)}: {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({pct:.1f}% saved)")
    except Exception as e:
        print(f"Error converting {filepath}: {e}")


def main():
    print(f"Scanning {PUBLIC_DIR}...")
    for root, dirs, files in os.walk(PUBLIC_DIR):
        for file in files:
            filepath = os.path.join(root, file)
            convert_image(filepath)


if __name__ == "__main__":
    main()
