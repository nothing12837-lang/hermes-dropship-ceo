import re

path = r"c:\Users\ajay kumar\Downloads\harmess agemnt\storefront\src\lib\data\products.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace RareEmber in titles, stories, and details
content = content.replace("RareEmber Heavyweight", "Rare Ember Heavyweight")
content = content.replace("RareEmber Minimalist", "Rare Ember Minimalist")
content = content.replace("RareEmber Artisan", "Rare Ember Artisan")
content = content.replace("RareEmber Double-Wall", "Rare Ember Double-Wall")
content = content.replace("RareEmber Extended", "Rare Ember Extended")
content = content.replace("RareEmber Frosted", "Rare Ember Frosted")
content = content.replace("RareEmber daily uniform", "Rare Ember daily uniform")
content = content.replace("Branded RareEmber Neck Tag", "Branded Rare Ember Neck Tag")
content = content.replace("tonal RareEmber insignia", "tonal Rare Ember insignia")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ products.ts updated with 'Rare Ember' display name!")
