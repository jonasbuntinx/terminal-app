#!/usr/bin/env node

const yargs = require( "yargs" );
const fs = require('fs');
const rssparser = require('rss-parser');
const xml2js = require('xml2js');

const options = yargs
  .option( "i", { alias: "input", describe: "Your input", type: "string", demandOption: true } )
  .option( "c", { alias: "cut", describe: "Trim each title and body if the length exceeds x characters", type: "number" } )
  .option( "r", { alias: "replace", describe: "Replace the specified words", type: "array" } )
  .option( "o", { alias: "output", describe: "Your output", type: "string" } )
  .argv;

const convert = (feed) => {

  if(options.cut) {
    feed.items = feed.items.map((item) => {
      if(item.title){
        item.title = item.title.substring(0, options.cut);
      }
      if(item.body){
        item.body = item.body.substring(0, options.cut);
      }
      return item;
    });
  }

  if(options.replace && options.replace.length >= 2) {
    feed.items = feed.items.map((item) => {
      if(item.title){
        item.title = item.title.replace(options.replace[0], options.replace[1]);
      }
      if(item.body){
        item.body = item.body.replace(options.replace[0], options.replace[1]);
      }
      return item;
    });
  }

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(feed);

  if(options.output) {
    fs.writeFileSync(options.output, xml);
  } else {
    console.log(xml);
  }
}

const isURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)')
  return !!pattern.test(str);
}

const parser = new rssparser();

if(isURL(options.input)) { 
  parser.parseURL(options.input).then(convert);
}
else {
  const xml = fs.readFileSync(options.input, 'utf8');
  parser.parseString(xml).then(convert);
}