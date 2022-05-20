#!/usr/bin/env sh

# setup artifacts directory
echo 'Setting up artifacts directory'
rm -rf ./dist
mkdir -p ./dist

# copy assets for webpage
echo 'Copying assets for webpage...'
for dir in css fonts icons img js index.html credits.html manifest.webmanifest zoho-domain-verification.html
do
  cp -r ./webpage/$dir ./dist
done

echo 'Build completed!'
