import os
from PIL import Image

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public")

def compress_image(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        return
    
    orig_size = os.path.getsize(filepath)
    try:
        with Image.open(filepath) as img:
            # Resize if dimensions are unnecessarily huge (> 1200px wide for product cards)
            max_dimension = 1200
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            if ext == ".png":
                # For RGBA PNGs: quantize with transparency if suitable or optimize
                if img.mode in ("RGBA", "LA"):
                    # Use pngquant-like adaptive quantization for icons/logos with high colors
                    img.save(filepath, "PNG", optimize=True, compress_level=9)
                else:
                    img = img.convert("RGB")
                    img.save(filepath, "PNG", optimize=True, compress_level=9)
            elif ext in [".jpg", ".jpeg"]:
                img = img.convert("RGB")
                img.save(filepath, "JPEG", quality=80, optimize=True, progressive=True)
                
        new_size = os.path.getsize(filepath)
        saved = orig_size - new_size
        pct = (saved / orig_size) * 100 if orig_size > 0 else 0
        if saved > 0:
            print(f"Compressed {os.path.basename(filepath)}: {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({pct:.1f}% saved)")
        else:
            print(f"Kept {os.path.basename(filepath)}: already optimal ({new_size/1024:.1f}KB)")
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
