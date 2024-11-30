import os
from PIL import Image
import numpy as np
import torchvision.transforms.functional as torchvision_F

def get_1d_bounds(arr):
    nz = np.flatnonzero(arr)
    return nz[0], nz[-1]

def get_bbox_from_mask(mask, thr=0.5):
    masks_for_box = (mask > thr).astype(np.float32)
    assert masks_for_box.sum() > 0, "Empty mask!"
    x0, x1 = get_1d_bounds(masks_for_box.sum(axis=-2))
    y0, y1 = get_1d_bounds(masks_for_box.sum(axis=-1))
    return x0, y0, x1, y1

def foreground_crop(image_rgba, crop_ratio=1.3, newsize=None, no_crop=False):
    # Ensure the image is in RGBA mode
    assert image_rgba.mode == "RGBA", "Image must be in RGBA mode!"
    if not no_crop:
        mask_np = np.array(image_rgba)[:, :, -1]
        mask_np = (mask_np >= 1).astype(np.float32)
        x1, y1, x2, y2 = get_bbox_from_mask(mask_np, thr=0.5)
        h, w = y2 - y1, x2 - x1
        yc, xc = (y1 + y2) / 2, (x1 + x2) / 2
        scale = max(h, w) * crop_ratio
        image = torchvision_F.crop(
            image_rgba,
            top=int(yc - scale / 2),
            left=int(xc - scale / 2),
            height=int(scale),
            width=int(scale),
        )
    else:
        image = image_rgba
    # Resize if needed
    if newsize is not None:
        image = image.resize(newsize)
    return image

def process_image(image_path):
    # Open the image in RGBA mode
    image_rgba = Image.open(image_path).convert('RGBA')
    # Perform the center crop using the alpha channel as a mask
    cropped_image = foreground_crop(image_rgba)
    # Convert the cropped image to a NumPy array
    cropped_np = np.array(cropped_image)
    # Extract the alpha channel and normalize it to [0, 1]
    alpha = cropped_np[:, :, 3] / 255.0
    # Create a white background
    white_bg = np.ones_like(cropped_np[:, :, :3], dtype=np.float32) * 255
    # Composite the image over the white background using the alpha channel
    final_np = (cropped_np[:, :, :3] * alpha[:, :, None] + white_bg * (1 - alpha[:, :, None])).astype(np.uint8)
    # Convert back to a PIL Image in RGB mode
    final_image = Image.fromarray(final_np, mode='RGB')
    final_image.save(image_path)
    print(f"Processed {image_path}")

if __name__ == '__main__':
    # List all PNG files in the current directory
    png_files = [f for f in os.listdir('examples') if f.lower().endswith('.png')]
    for image_file in png_files:
        process_image(os.path.join('examples', image_file))