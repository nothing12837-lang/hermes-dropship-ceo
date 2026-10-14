import os
import glob
import re

def main():
    src_dir = 'src'
    files = glob.glob(src_dir + '/**/*.ts', recursive=True) + glob.glob(src_dir + '/**/*.tsx', recursive=True)
    
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        
        # Replace 3-7 and 3–7 with 7-14
        new_content = re.sub(r'3-7\s*days', '7-14 days', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'3–7\s*days', '7-14 days', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'3-7\s*day', '7-14 day', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'3–7\s*day', '7-14 day', new_content, flags=re.IGNORECASE)
        
        # Replace Express with Standard
        new_content = re.sub(r'express US shipping', 'standard shipping', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'Express US Shipping', 'Standard Shipping', new_content)
        new_content = re.sub(r'express shipping', 'standard shipping', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'Express shipping', 'Standard shipping', new_content)
        
        # Free express
        new_content = re.sub(r'FREE express', 'FREE standard', new_content)
        new_content = re.sub(r'Free express', 'Free standard', new_content)
        new_content = re.sub(r'FREE Express', 'FREE Standard', new_content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filepath}')

if __name__ == '__main__':
    main()
