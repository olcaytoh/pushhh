import os
import re

img_exts = ('.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mp3')
public_files = {}
for root, dirs, files in os.walk('public'):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), 'public').replace('\\', '/')
        public_files['/' + rel] = os.path.getsize(os.path.join(root, f))
        public_files[rel] = os.path.getsize(os.path.join(root, f))

# Find references in src and index.html
src_refs = set()
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for f in files:
        if f.endswith(('.tsx', '.ts', '.css', '.html')):
            with open(os.path.join(root, f), 'r', errors='ignore') as fp:
                content = fp.read()
                for match in re.findall(r'[\'\"`]/?([a-zA-Z0-9_\-\./]+\.(?:png|jpg|jpeg|webp|mp4|mp3|svg))[\'\"`]', content):
                    src_refs.add(match)

print(f"Total src refs found: {len(src_refs)}")
ref_sizes = []
for ref in sorted(src_refs):
    key = '/' + ref.lstrip('/')
    size = public_files.get(key) or public_files.get(ref.lstrip('/'))
    ref_sizes.append((size or 0, ref))

ref_sizes.sort(reverse=True)
total_size = sum(s for s, r in ref_sizes)
print(f"Total referenced size: {total_size / (1024*1024):.2f} MB")
print("Top 40 largest referenced assets:")
for s, r in ref_sizes[:40]:
    print(f"{s/1024:8.1f} KB : {r}")
