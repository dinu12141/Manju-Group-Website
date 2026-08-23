import os
from PIL import Image

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public")

# Filename (relative to PUBLIC_DIR, forward slashes) -> max longest-side px.
# Anything not listed falls back to DEFAULT_MAX.
SIZE_OVERRIDES = {
    "favicon.png": 256,
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
    "app-icon-512.png": 512,
    "manju-logo.png": 400,
    "manju-logo-circle.png": 400,
    "manju-logo-transparent.png": 400,
    "manju-group-logo.png": 400,
    "manju-emblem-blue-transparent.png": 400,
    "manju-emblem-white-transparent.png": 400,
    "banner_ebike_cinematic.jpg": 1280,
    "banner_smarttv_cinematic.jpg": 1280,
}

DEFAULT_MAX = 700  # product photos, ad creatives, etc. — actual max on-page display is ~550px, this covers 2x retina

SKIP_EXACT_DIMENSION_SHRINK = {"favicon-16x16.png", "favicon-32x32.png"}

# Flat-color logos/icons/emblems compress well with palette quantization.
# Photographic product renders (with shadows/gradients) must NOT be quantized
# or they band visibly — those keep full RGBA/RGB.
QUANTIZE_OK = {
    "manju-logo.png",
    "manju-logo-circle.png",
    "manju-logo-transparent.png",
    "manju-group-logo.png",
    "manju-emblem-blue-transparent.png",
    "manju-emblem-white-transparent.png",
    "favicon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "app-icon-512.png",
}


def compress_image(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        return

    rel = os.path.relpath(filepath, PUBLIC_DIR).replace("\\", "/")
    max_dimension = SIZE_OVERRIDES.get(rel, DEFAULT_MAX)

    orig_size = os.path.getsize(filepath)
    try:
        with Image.open(filepath) as img:
            if rel not in SKIP_EXACT_DIMENSION_SHRINK and max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            if ext == ".png":
                has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
                if has_alpha:
                    img = img.convert("RGBA")
                    if rel in QUANTIZE_OK:
                        img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
                    img.save(filepath, "PNG", optimize=True, compress_level=9)
                else:
                    img = img.convert("RGB")
                    img.save(filepath, "PNG", optimize=True, compress_level=9)
            elif ext in [".jpg", ".jpeg"]:
                img = img.convert("RGB")
                img.save(filepath, "JPEG", quality=78, optimize=True, progressive=True)

        new_size = os.path.getsize(filepath)
        saved = orig_size - new_size
        pct = (saved / orig_size) * 100 if orig_size > 0 else 0
        if saved > 0:
            print(f"Compressed {rel}: {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({pct:.1f}% saved)")
        else:
            print(f"Kept {rel}: already optimal ({new_size/1024:.1f}KB)")
    except Exception as e:
        print(f"Error compressing {filepath}: {e}")


def main():
    print(f"Scanning {PUBLIC_DIR}...")
    for root, dirs, files in os.walk(PUBLIC_DIR):
        for file in files:
            filepath = os.path.join(root, file)
            compress_image(filepath)


if __name__ == "__main__":
    main()
