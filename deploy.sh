#!/bin/bash

# Deploy script for GitHub Pages
# This builds the project and deploys to gh-pages branch

set -e

echo "Building project..."
npm run build

echo "Deploying to gh-pages branch..."
cd dist

# Clean any existing git repo and initialize fresh
rm -rf .git
git init
git checkout -b gh-pages
git add -A
git commit -m 'Deploy to GitHub Pages'

# Force push to gh-pages branch
git push -f git@github.com:sethchandler/socratic-tutor-ai.git gh-pages:gh-pages

cd ..
echo "Deployment complete!"
echo "GitHub Pages should be available at: https://sethchandler.github.io/socratic-tutor-ai/"
