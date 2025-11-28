#!/bin/bash

cd /Users/mohamedazher/Halsimplify/islamqa/res/ios

echo "🎨 Generating all iOS icon sizes from Icon-1024.png..."
echo ""

# Generate all required sizes
magick Icon-1024.png -resize 20x20 Icon-20.png
magick Icon-1024.png -resize 29x29 Icon-29.png
magick Icon-1024.png -resize 40x40 Icon-40.png
magick Icon-1024.png -resize 48x48 Icon-48.png
magick Icon-1024.png -resize 50x50 Icon-50.png
magick Icon-1024.png -resize 55x55 Icon-55.png
magick Icon-1024.png -resize 57x57 Icon-57.png
magick Icon-1024.png -resize 58x58 Icon-58.png
magick Icon-1024.png -resize 60x60 Icon-60.png
magick Icon-1024.png -resize 72x72 Icon-72.png
magick Icon-1024.png -resize 76x76 Icon-76.png
magick Icon-1024.png -resize 80x80 Icon-80.png
magick Icon-1024.png -resize 87x87 Icon-87.png
magick Icon-1024.png -resize 88x88 Icon-88.png
magick Icon-1024.png -resize 100x100 Icon-100.png
magick Icon-1024.png -resize 114x114 Icon-114.png
magick Icon-1024.png -resize 120x120 Icon-120.png
magick Icon-1024.png -resize 128x128 Icon-128.png
magick Icon-1024.png -resize 144x144 Icon-144.png
magick Icon-1024.png -resize 152x152 Icon-152.png
magick Icon-1024.png -resize 167x167 Icon-167.png
magick Icon-1024.png -resize 172x172 Icon-172.png
magick Icon-1024.png -resize 180x180 Icon-180.png
magick Icon-1024.png -resize 196x196 Icon-196.png
magick Icon-1024.png -resize 256x256 Icon-256.png
magick Icon-1024.png -resize 512x512 Icon-512.png
magick Icon-1024.png -resize 16x16 Icon-16.png
magick Icon-1024.png -resize 32x32 Icon-32.png
magick Icon-1024.png -resize 64x64 Icon-64.png
magick Icon-1024.png -resize 57x57 Icon.png

echo ""
echo "✅ All iOS icons regenerated!"
echo ""
echo "Icons created:"
ls -1 Icon*.png | wc -l

echo ""
echo "Next step: Run the deployment command"
