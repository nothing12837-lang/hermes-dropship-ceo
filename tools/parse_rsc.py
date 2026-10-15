import re
import json

with open('tools/qikink_raw_html.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract all RSC chunks
raw_chunks = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', html)
full_rsc = ""
for c in raw_chunks:
    # unescape unicode and quotes
    try:
        decoded = c.encode('utf-8').decode('unicode_escape')
        full_rsc += decoded
    except Exception:
        full_rsc += c

print(f"Total RSC text length: {len(full_rsc)}")

# Search for product title, price, mockups, colors, sizes, specifications
with open('tools/qikink_rsc.txt', 'w', encoding='utf-8') as f:
    f.write(full_rsc)

print("Saved RSC text to tools/qikink_rsc.txt!")

# Look for S3 images in RSC
s3_images = re.findall(r'https://qikink-stores\.s3\.ap-south-1\.amazonaws\.com/[^\s"\'\\<>]+', full_rsc)
unique_s3 = list(dict.fromkeys(s3_images))
print(f"Total unique Qikink S3 images in RSC: {len(unique_s3)}")
for img in unique_s3:
    print(" ", img)
