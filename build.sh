#!/usr/bin/env sh

__BASE_DIR="$(dirname $0)"

__ARTIFACTS_DIR="${__BASE_DIR}/dist"
__WEBPAGE_DIR="${__BASE_DIR}/webpage"

function clean_artifacts() {
  # clean artifacts directory
  echo 'Cleaning up existing artifacts'
  rm -rf "${__ARTIFACTS_DIR}"
}

function setup_artifacts() {
  # setup artifacts directory
  echo 'Setting up artifacts directory'
  mkdir -p "${__ARTIFACTS_DIR}"
}

function copy_to_artifacts() {
  dir="$1"
  cp -r "${__WEBPAGE_DIR}/$dir" "${__ARTIFACTS_DIR}/"
}

function copy_website_srcs() {
  # copy assets for webpage
  echo 'Copying assets for webpage...'
  for dir in css fonts icons img js index.html credits.html manifest.webmanifest zoho-domain-verification.html
  do
    copy_to_artifacts $dir
  done
}

function minify_gallery_photos() {
  # minify website gallery images
  echo 'Minifying gallery photos...'
  __MINIFIED_DESIGN_PHOTOS_DIR="${__ARTIFACTS_DIR}/img/design-photos/minified"
  mkdir -p "${__MINIFIED_DESIGN_PHOTOS_DIR}"
  for img in "${__WEBPAGE_DIR}/img/design-photos/"*
  do
    target_name="$(basename "$img")"
    convert "$img" -resize 267x "${__MINIFIED_DESIGN_PHOTOS_DIR}/$target_name"
  done
}

function main() {
  clean_artifacts
  if [ "$1" = "clean" ]
  then
    echo 'Successfully cleaned project'
    exit 0
  fi

  setup_artifacts
  copy_website_srcs
  minify_gallery_photos
}

main $@
echo 'Build completed!'
