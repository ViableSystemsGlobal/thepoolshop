#!/bin/bash

# Find all TypeScript files that import MainLayout
files=$(grep -r "import.*MainLayout" src/app --include="*.tsx" -l)

for file in $files; do
    echo "Fixing $file..."
    
    # Remove the MainLayout import
    sed -i '' '/import.*MainLayout.*from.*main-layout/d' "$file"
    
    # Replace <MainLayout> with <>
    sed -i '' 's/<MainLayout>/<>/g' "$file"
    
    # Replace </MainLayout> with </>
    sed -i '' 's/<\/MainLayout>/<\/>/g' "$file"
    
    echo "Fixed $file"
done

echo "All files fixed!"
