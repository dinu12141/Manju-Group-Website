import os
from PIL import Image, ImageDraw

LOGO_PATH = "client/public/manju-logo.png"
RES_DIR = "android/app/src/main/res"

if not os.path.exists(LOGO_PATH):
    raise FileNotFoundError(f"Logo not found at {LOGO_PATH}")

base_img = Image.open(LOGO_PATH).convert("RGBA")

# Mipmap standard launcher icon sizes
LAUNCHER_SIZES = {
    "mipmap-mdpi": (48, 48),
    "mipmap-hdpi": (72, 72),
    "mipmap-xhdpi": (96, 96),
    "mipmap-xxhdpi": (144, 144),
    "mipmap-xxxhdpi": (192, 192),
}

# Adaptive foreground icon sizes (108dp viewport, centered at 66%)
FOREGROUND_SIZES = {
    "mipmap-mdpi": (108, 108),
    "mipmap-hdpi": (162, 162),
    "mipmap-xhdpi": (216, 216),
    "mipmap-xxhdpi": (324, 324),
    "mipmap-xxxhdpi": (432, 432),
}

def make_round_icon(img):
    """Create a circular mask for round icons"""
    size = img.size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    
    round_img = Image.new("RGBA", size, (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def make_foreground_icon(img, fg_size):
    """Create adaptive foreground with padding"""
    fg = Image.new("RGBA", fg_size, (0, 0, 0, 0))
    # Logo should occupy roughly 70% of the foreground area
    logo_w = int(fg_size[0] * 0.72)
    logo_h = int(fg_size[1] * 0.72)
    scaled_logo = img.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    
    offset_x = (fg_size[0] - logo_w) // 2
    offset_y = (fg_size[1] - logo_h) // 2
    fg.paste(scaled_logo, (offset_x, offset_y), mask=scaled_logo)
    return fg

# Generate standard launcher and round icons
for folder, size in LAUNCHER_SIZES.items():
    target_dir = os.path.join(RES_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    # 1. ic_launcher.png (Full logo scaled)
    launcher = base_img.resize(size, Image.Resampling.LANCZOS)
    launcher.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    
    # 2. ic_launcher_round.png
    round_launcher = make_round_icon(launcher)
    round_launcher.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
    print(f"Generated launcher icons for {folder}: {size}")

# Generate adaptive foreground icons
for folder, size in FOREGROUND_SIZES.items():
    target_dir = os.path.join(RES_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    fg_img = make_foreground_icon(base_img, size)
    fg_img.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"Generated foreground icon for {folder}: {size}")

# Generate Google Play Store 512x512 icon
playstore_icon = base_img.resize((512, 512), Image.Resampling.LANCZOS)
playstore_icon.save("android/app/src/main/ic_launcher-playstore.png", "PNG")
playstore_icon.save("client/public/app-icon-512.png", "PNG")
print("Generated 512x512 Play Store icon!")

print("All Android app icons generated successfully!")
