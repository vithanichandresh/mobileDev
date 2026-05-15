import os
import glob

base_dir = "/Users/dashstack/StudioProjects/dashstack/Chandresh_website"
apps_dir = os.path.join(base_dir, "apps")
index_file = os.path.join(base_dir, "index.html")

# 1. Update index.html to point to apps/
app_pages = [
    "symcheck.html", "health_gauge.html", "dfx5.html", "123family.html", 
    "ultra-messenger.html", "2i2i.html", "dashwoop.html", "urban-swift.html", 
    "amyal.html", "festigo.html", "crick-admin.html", "crick-box.html", 
    "ds-dice.html", "we-do-solar.html", "aura-mind.html", "orte.html", 
    "navadiya_owners.html", "antee.html", "lotus.html"
]

with open(index_file, "r") as f:
    content = f.read()

for app in app_pages:
    # replace exactly href="app.html" with href="apps/app.html"
    content = content.replace(f'href="{app}"', f'href="apps/{app}"')

with open(index_file, "w") as f:
    f.write(content)

# 2. Update all html files in apps/ to use ../ for assets
app_files = glob.glob(os.path.join(apps_dir, "*.html"))
for app_file in app_files:
    with open(app_file, "r") as f:
        app_content = f.read()
    
    # replace ./css to ../css
    app_content = app_content.replace('./css/', '../css/')
    app_content = app_content.replace('./js/', '../js/')
    app_content = app_content.replace('./images/', '../images/')
    app_content = app_content.replace('href="/"', 'href="../index.html"')
    app_content = app_content.replace('href="index.html"', 'href="../index.html"')
    
    with open(app_file, "w") as f:
        f.write(app_content)

print("Paths updated successfully.")
