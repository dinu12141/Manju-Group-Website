import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_cinematic_tv(width=800, height=600, screen_ratio=16/9, tv_size_inch=43, theme='cosmic_nebula'):
    canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # TV frame dimensions
    scale = 0.82 if tv_size_inch == 32 else (0.86 if tv_size_inch == 43 else 0.90)
    tv_w = int(width * scale)
    tv_h = int(tv_w / screen_ratio)
    
    # Position
    tv_x0 = (width - tv_w) // 2
    tv_y0 = int(height * 0.10)
    tv_x1 = tv_x0 + tv_w
    tv_y1 = tv_y0 + tv_h
    
    # Stand legs positioning
    leg_h = int(height * 0.12)
    leg_y0 = tv_y1 - 4
    leg_y1 = leg_y0 + leg_h
    
    # 1. Soft Realistic Ground Shadow
    shadow_w = int(tv_w * 0.96)
    shadow_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_layer)
    sdraw.ellipse(
        [(width - shadow_w) // 2, leg_y1 - 16, (width + shadow_w) // 2, leg_y1 + 16],
        fill=(0, 0, 0, 70)
    )
    for lx in [tv_x0 + int(tv_w * 0.14), tv_x1 - int(tv_w * 0.14)]:
        sdraw.ellipse([lx - 28, leg_y1 - 6, lx + 28, leg_y1 + 6], fill=(0, 0, 0, 130))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(8))
    canvas.paste(shadow_layer, (0, 0), shadow_layer)
    
    # 2. Sleek Metallic Desktop Stand Legs
    leg_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(leg_layer)
    
    left_x = tv_x0 + int(tv_w * 0.14)
    right_x = tv_x1 - int(tv_w * 0.14)
    
    for lx in [left_x, right_x]:
        # Back branch
        ldraw.polygon([(lx, leg_y0), (lx - 22, leg_y1), (lx - 15, leg_y1), (lx + 3, leg_y0)], fill=(50, 55, 62, 255))
        # Front branch
        ldraw.polygon([(lx, leg_y0), (lx + 25, leg_y1), (lx + 32, leg_y1), (lx + 7, leg_y0)], fill=(110, 118, 128, 255))
        # Top metallic bevel highlight
        ldraw.line([(lx + 2, leg_y0), (lx + 27, leg_y1)], fill=(210, 218, 228, 255), width=2)
    
    canvas.paste(leg_layer, (0, 0), leg_layer)
    
    # 3. Outer TV Chassis / Bezel
    bezel_thick = 3
    chassis_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(chassis_layer)
    cdraw.rounded_rectangle([tv_x0, tv_y0, tv_x1, tv_y1], radius=5, fill=(20, 22, 26, 255), outline=(55, 60, 68, 255), width=1)
    # Bottom chin accent bar
    cdraw.rectangle([tv_x0, tv_y1 - 6, tv_x1, tv_y1], fill=(28, 30, 36, 255))
    # Sleek branding LED badge
    cdraw.rectangle([(tv_x0 + tv_x1)//2 - 10, tv_y1 - 4, (tv_x0 + tv_x1)//2 + 10, tv_y1 - 2], fill=(200, 210, 230, 220))
    canvas.paste(chassis_layer, (0, 0), chassis_layer)
    
    # 4. Cinematic Display Screen Content
    scr_x0 = tv_x0 + bezel_thick
    scr_y0 = tv_y0 + bezel_thick
    scr_x1 = tv_x1 - bezel_thick
    scr_y1 = tv_y1 - 6
    scr_w = scr_x1 - scr_x0
    scr_h = scr_y1 - scr_y0
    
    np_screen = np.zeros((scr_h, scr_w, 3), dtype=np.float32)
    yy, xx = np.mgrid[0:scr_h, 0:scr_w]
    
    if theme == 'cosmic_nebula': # 43" 4K TV: Deep Cosmic Violet, Cyan & Radiant Nebula
        cx, cy = scr_w * 0.58, scr_h * 0.42
        r = np.sqrt((xx - cx)**2 + (yy - cy)**2) / (scr_w * 0.5)
        angle = np.arctan2(yy - cy, xx - cx)
        
        # Multilayer nebula colors
        np_screen[:, :, 0] = np.clip(25 + 190 * np.exp(-r*1.4) * (0.6 + 0.4 * np.sin(angle*3 + r*4)), 0, 255)
        np_screen[:, :, 1] = np.clip(15 + 130 * np.exp(-r*1.2) * (0.5 + 0.5 * np.cos(angle*2 - r*3)), 0, 255)
        np_screen[:, :, 2] = np.clip(60 + 195 * np.exp(-r*1.0), 0, 255)
        # Core brightness
        core = np.exp(-r*3.2)
        np_screen[:, :, 0] = np.clip(np_screen[:, :, 0] + 255 * core, 0, 255)
        np_screen[:, :, 1] = np.clip(np_screen[:, :, 1] + 220 * core, 0, 255)
        np_screen[:, :, 2] = np.clip(np_screen[:, :, 2] + 255 * core, 0, 255)
        
    elif theme == 'golden_fire': # 55" 4K TV: Radiant Amber, Solar Flare & Molten Cosmic Energy
        cx, cy = scr_w * 0.50, scr_h * 0.45
        r = np.sqrt((xx - cx)**2 + (yy - cy)**2) / (scr_w * 0.5)
        angle = np.arctan2(yy - cy, xx - cx)
        
        np_screen[:, :, 0] = np.clip(40 + 215 * np.exp(-r*1.3) * (0.7 + 0.3 * np.cos(angle*4 + r*4)), 0, 255)
        np_screen[:, :, 1] = np.clip(18 + 160 * np.exp(-r*1.8) * (0.6 + 0.4 * np.sin(angle*3 - r*2)), 0, 255)
        np_screen[:, :, 2] = np.clip(10 + 60 * np.exp(-r*2.6), 0, 255)
        # Solar core
        core = np.exp(-r*3.0)
        np_screen[:, :, 0] = np.clip(np_screen[:, :, 0] + 255 * core, 0, 255)
        np_screen[:, :, 1] = np.clip(np_screen[:, :, 1] + 240 * core, 0, 255)
        np_screen[:, :, 2] = np.clip(np_screen[:, :, 2] + 180 * core, 0, 255)
        
    else: # 32" HD Smart TV: Aurora Borealis Green & Deep Ocean Blue
        cx, cy = scr_w * 0.52, scr_h * 0.48
        r = np.sqrt((xx - cx)**2 + (yy - cy)**2) / (scr_w * 0.5)
        angle = np.arctan2(yy - cy, xx - cx)
        
        np_screen[:, :, 0] = np.clip(12 + 80 * np.exp(-r*1.5), 0, 255)
        np_screen[:, :, 1] = np.clip(35 + 205 * np.exp(-r*1.2) * (0.6 + 0.4 * np.sin(angle*3)), 0, 255)
        np_screen[:, :, 2] = np.clip(50 + 205 * np.exp(-r*1.0), 0, 255)
        core = np.exp(-r*3.2)
        np_screen[:, :, 0] = np.clip(np_screen[:, :, 0] + 190 * core, 0, 255)
        np_screen[:, :, 1] = np.clip(np_screen[:, :, 1] + 255 * core, 0, 255)
        np_screen[:, :, 2] = np.clip(np_screen[:, :, 2] + 245 * core, 0, 255)

    screen_img = Image.fromarray(np_screen.astype(np.uint8), mode='RGB').convert('RGBA')
    
    # Stars & light particles
    np.random.seed(int(tv_size_inch * 100))
    sdraw = ImageDraw.Draw(screen_img)
    for _ in range(120):
        sx = np.random.randint(0, scr_w)
        sy = np.random.randint(0, scr_h)
        bright = np.random.randint(160, 255)
        sz = 1 if np.random.rand() > 0.1 else 2
        sdraw.ellipse([sx, sy, sx+sz, sy+sz], fill=(bright, bright, bright, 210))
    
    # Diagonal subtle glass reflection
    glass = Image.new('RGBA', (scr_w, scr_h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glass)
    gdraw.polygon([(0, 0), (int(scr_w * 0.42), 0), (int(scr_w * 0.18), scr_h), (0, scr_h)], fill=(255, 255, 255, 16))
    gdraw.polygon([(int(scr_w * 0.48), 0), (int(scr_w * 0.62), 0), (int(scr_w * 0.38), scr_h), (int(scr_w * 0.24), scr_h)], fill=(255, 255, 255, 10))
    screen_img.paste(glass, (0, 0), glass)
    
    canvas.paste(screen_img, (scr_x0, scr_y0), screen_img)
    
    # 5. Top & Left Precision Metallic Light Edges
    b_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(b_layer)
    bdraw.line([(tv_x0, tv_y0), (tv_x1, tv_y0)], fill=(140, 148, 160, 200), width=1)
    bdraw.line([(tv_x0, tv_y0), (tv_x0, tv_y1)], fill=(100, 110, 125, 180), width=1)
    canvas.paste(b_layer, (0, 0), b_layer)
    
    return canvas

def main():
    out_dir = 'client/public'
    
    # 43" 4K Smart TV
    im43 = create_cinematic_tv(800, 600, tv_size_inch=43, theme='cosmic_nebula')
    im43.save(os.path.join(out_dir, 'dew_plus_43_tv.png'), format='PNG')
    print('Generated dew_plus_43_tv.png (Transparent background, cinematic 4K nebula)')
    
    # 55" 4K Smart TV
    im55 = create_cinematic_tv(800, 600, tv_size_inch=55, theme='golden_fire')
    im55.save(os.path.join(out_dir, 'dew_plus_55_tv.png'), format='PNG')
    print('Generated dew_plus_55_tv.png (Transparent background, cinematic solar gold)')
    
    # 32" HD Smart TV
    im32 = create_cinematic_tv(800, 600, tv_size_inch=32, theme='aurora_cyan')
    im32.save(os.path.join(out_dir, 'dew_plus_32_tv.png'), format='PNG')
    print('Generated dew_plus_32_tv.png (Transparent background, cinematic aurora cyan)')

if __name__ == '__main__':
    main()
