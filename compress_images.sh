#!/bin/bash

# סקריפט לדחיסת תמונות לאתר JOY MEDIA
# ממיר PNG ל-JPEG ומקטין רזולוציה

echo "🎨 מתחיל דחיסת תמונות..."

# פונקציה לדחיסת תמונה אחת
compress_image() {
    local input="$1"
    local output="$2"
    local max_width=1920
    local quality=85
    
    # בדיקה אם הקובץ קיים
    if [ ! -f "$input" ]; then
        echo "⚠️  קובץ לא נמצא: $input"
        return 1
    fi
    
    # קבלת מימדים
    width=$(sips -g pixelWidth "$input" 2>/dev/null | tail -1 | awk '{print $2}')
    height=$(sips -g pixelHeight "$input" 2>/dev/null | tail -1 | awk '{print $2}')
    
    if [ -z "$width" ] || [ -z "$height" ]; then
        echo "⚠️  לא הצלחתי לקרוא מימדים: $input"
        return 1
    fi
    
    # חישוב מימדים חדשים (שומר יחס גובה-רוחב)
    if [ "$width" -gt "$max_width" ]; then
        # חישוב יחס גובה-רוחב
        new_height=$((height * max_width / width))
        echo "📐 מקטין מ-${width}x${height} ל-${max_width}x${new_height}"
    else
        max_width=$width
        new_height=$height
        echo "✅ גודל תקין: ${width}x${height}"
    fi
    
    # המרה ל-JPEG עם דחיסה
    sips -s format jpeg \
         -s formatOptions ${quality} \
         --resampleHeightWidthMax $new_height $max_width \
         "$input" \
         --out "$output" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        original_size=$(ls -lh "$input" | awk '{print $5}')
        new_size=$(ls -lh "$output" | awk '{print $5}')
        echo "✅ $input → $output ($original_size → $new_size)"
        return 0
    else
        echo "❌ שגיאה בדחיסת: $input"
        return 1
    fi
}

# דחיסת תמונות סטילס
echo ""
echo "📸 דחיסת תמונות סטילס..."
count=0
shopt -s nullglob
for img in "סטילס2"/*.{png,PNG,jpg,JPG,jpeg,JPEG}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        output="סטילס2_compressed/${name}.jpg"
        compress_image "$img" "$output"
        count=$((count + 1))
    fi
done
shopt -u nullglob
echo "✅ סיימתי $count תמונות סטילס"

# דחיסת תמונות חתונות
echo ""
echo "💒 דחיסת תמונות חתונות..."
count=0
shopt -s nullglob
for img in "חתונות2"/*.{png,PNG,jpg,JPG,jpeg,JPEG}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        # החלפת רווחים ב-_
        name=$(echo "$name" | sed 's/ /_/g')
        output="חתונות2_compressed/${name}.jpg"
        compress_image "$img" "$output"
        count=$((count + 1))
    fi
done
shopt -u nullglob
echo "✅ סיימתי $count תמונות חתונות"

# דחיסת תמונות המלצות (אלה כבר JPG, רק נדחוס)
echo ""
echo "⭐ דחיסת תמונות המלצות..."
count=0
shopt -s nullglob
for img in "המלצות "/*.{jpg,JPG,jpeg,JPEG,png,PNG}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        output="המלצות_compressed/${name}.jpg"
        compress_image "$img" "$output"
        count=$((count + 1))
    fi
done
shopt -u nullglob
echo "✅ סיימתי $count תמונות המלצות"

echo ""
echo "🎉 סיימתי! כל התמונות נדחסו בהצלחה!"
echo "📁 התיקיות החדשות:"
echo "   - סטילס2_compressed"
echo "   - חתונות2_compressed"
echo "   - המלצות_compressed"

