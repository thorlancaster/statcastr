rm -Rf build
mkdir build
echo "building JS sub-bundles"
cat js/classes/model/basketball/*.js > build/bundle-sports.js
cat js/libs/*.js > build/bundle-libs.js
cat js/classes/*.js > build/bundle-classes.js
cat js/classes/components/*.js > build/bundle-classes-components.js
cat js/classes/model/*.js build/bundle-sports.js > build/bundle-classes-model.js
cat js/classes/synchronizr/*.js > build/bundle-classes-synchronizr.js
cat js/classes/ui/*.js > build/bundle-classes-ui.js
cat js/classes/view/*.js > build/bundle-classes-view.js
cat js/classes/viewdisplay/*.js > build/bundle-classes-viewdisplay.js

echo "building JS bundle"
cd build
cat bundle-libs.js bundle-classes-ui.js bundle-classes-components.js bundle-classes-synchronizr.js bundle-classes-model.js bundle-classes-view.js bundle-classes-viewdisplay.js bundle-classes.js ../js/init.bundle.js > bundle.all.js

echo "building page"
cat ../resources/index.bundle.html > index.html
cat ../css/*.css > bundle.all.css
mkdir js
cat ../js/sw.js > sw.js

echo "copying resources"
cp -r ../resources resources
cp -r ../favicon.ico favicon.ico
cp -r ../favicon.ico favicon.ico

echo "cleaning up"
rm bundle-classes.js
rm bundle-sports.js
rm bundle-libs.js
rm bundle-classes-components.js
rm bundle-classes-model.js
rm bundle-classes-synchronizr.js
rm bundle-classes-ui.js
rm bundle-classes-view.js
rm bundle-classes-viewdisplay.js
