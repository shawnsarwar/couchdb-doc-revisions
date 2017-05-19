
import {jsonlint as jsl} from "../node_modules/jsonlint/lib/jsonlint.js";
import jdd from 'exports-loader?jdd!../node_modules/jdd/jdd.js';
import * as fs from "fs";
import * as file from "file";
import * as path from "path";

var jsonPath = path.join('..', "test", "f1.json");
var doc1 = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
jsonPath = path.join('..', "test", "f2.json");
var doc2 = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

//console.log(doc1, doc2);

var config1 = jdd.createConfig();
var config2 = jdd.createConfig();
jdd.formatAndDecorate(config1, doc1);
jdd.formatAndDecorate(config2, doc2);
config1.currentPath = [];
config2.currentPath = [];

jdd.diffVal(doc1, config1, doc2, config2);
jdd.processDiffs();
console.log(jdd.diffs);



//console.log();
