#!/usr/bin/env node

const shelljs = require('shelljs');

const IMAGE_DIRS = [
  'img',
  'agenda/img',
  'calendar/img'
];


function run() {
  cleanUp();
  babelJs();
  copyImages();
}

function cleanUp() {
  shelljs.rm('-r', 'lib');
  shelljs.mkdir('-p', 'lib');
}

function copyImages() {
  const srcDir = './src/';
  const tgtDir = './lib/';

  IMAGE_DIRS.forEach(path => {
    shelljs.exec(`cp -r ${srcDir}${path} ${tgtDir}${path}`);
  });
}

function babelJs() {
  shelljs.exec('npx babel src -d lib');
}

run();

