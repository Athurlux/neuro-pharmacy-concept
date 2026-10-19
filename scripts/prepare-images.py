"""Copy and derive the website's images from the untouched asset pack in assets-src/pack.

Run with `npm run images` (Python 3 + Pillow). Outputs are committed, so the build never
depends on Python. Nothing is upscaled beyond its source width.
"""
import shutil
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
pack = root / 'assets-src' / 'pack'
public = root / 'public'
images = public / 'images'
for folder in (images, public / 'brand', public / 'states', public / 'samples', public / 'social'):
    folder.mkdir(parents=True, exist_ok=True)

SCENES = ['home-hero-desktop', 'delivery-hero-desktop', 'delivery-handover', 'collection-counter',
          'category-personal-care', 'pharmacist-conversation']
PRODUCTS = ['lotion', 'handwash', 'soap', 'toothbrush', 'toothpaste', 'thermometer', 'first-aid-pouch', 'tissues']

# Supplied sizes are used as they are: the 768px web file and the full master.
for name in SCENES + [f'product-{p}' for p in PRODUCTS]:
    with Image.open(pack / 'images' / 'master' / f'{name}.webp') as master:
        width = master.width
    shutil.copy(pack / 'images' / 'web' / f'{name}.webp', images / f'{name}-768.webp')
    shutil.copy(pack / 'images' / 'master' / f'{name}.webp', images / f'{name}-{width}.webp')
    print(f'{name}: 768 + {width}')


def crop(source, name, box, widths, quality=80):
    with Image.open(pack / 'images' / 'master' / f'{source}.webp') as master:
        image = master.convert('RGB').crop(box)
        for width in widths:
            width = min(width, image.width)
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(images / f'{name}-{width}.webp', 'WEBP', quality=quality, method=6)
        print(f'{name}: {image.width}x{image.height} -> {widths}')


# Phones: the home portrait becomes a 2:1 band around the pharmacist, so
# the headline, actions and quick enquiry stay on the first screen.
crop('home-hero-mobile', 'home-hero-mobile', (0, 380, 1024, 892), [480, 800, 1024])
# The delivery portrait becomes a square keeping the helmet, the marked box and the motorbike.
crop('delivery-hero-mobile', 'delivery-hero-mobile', (0, 130, 1024, 1154), [480, 800, 1024])

for svg in ['logo-concept-teal', 'logo-concept-ivory', 'monogram-concept']:
    shutil.copy(pack / 'branding' / f'{svg}.svg', public / 'brand' / f'{svg}.svg')
shutil.copy(pack / 'branding' / 'favicon.svg', public / 'favicon.svg')
shutil.copy(pack / 'branding' / 'favicon-192.png', public / 'favicon-192.png')
with Image.open(pack / 'branding' / 'favicon-192.png') as icon:
    icon.convert('RGB').resize((180, 180), Image.Resampling.LANCZOS).save(public / 'apple-touch-icon.png')
for state in ['empty-basket', 'no-results', 'demo-complete']:
    shutil.copy(pack / 'states' / f'{state}.svg', public / 'states' / f'{state}.svg')
shutil.copy(pack / 'samples' / 'prescription-process-demo.svg', public / 'samples' / 'prescription-process-demo.svg')
for social in ['social-home-1200x630', 'social-delivery-1200x630']:
    shutil.copy(pack / 'social' / f'{social}.jpg', public / 'social' / f'{social}.jpg')
print('brand, states, sample and social files copied')
