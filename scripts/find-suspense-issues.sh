#!/bin/bash

# Script to find pages that use useSearchParams without Suspense

echo "🔍 Searching for pages that use useSearchParams()..."
echo ""

# Find all tsx files in src/app that use useSearchParams
FILES=$(grep -rl "useSearchParams()" src/app --include="*.tsx")

echo "Files using useSearchParams():"
echo "$FILES"
echo ""

echo "-----------------------------------"
echo "Checking for Suspense boundaries..."
echo ""

for file in $FILES; do
  # Check if the file has Suspense import
  if grep -q "import.*Suspense" "$file"; then
    echo "✅ $file - Has Suspense import"
  else
    echo "⚠️  $file - Missing Suspense import"
  fi
done

echo ""
echo "Done! Make sure all files with useSearchParams() have Suspense boundaries."

