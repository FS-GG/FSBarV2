import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, lstatSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ownPolicyRoot=dirname(fileURLToPath(import.meta.url));
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const fail=message=>{throw new Error(message)};
const need=(value,message)=>{if(!value)fail(message)};
const read=path=>readFileSync(path);
const safeRelative=path=>!isAbsolute(path)&&path!==""&&!path.split(/[\\/]/).includes("..");
const environmentKeys=["PATH","HOME","LANG","LC_ALL","TMPDIR","DOTNET_ROOT","DOTNET_ROLL_FORWARD","DOTNET_EnableDiagnostics","DOTNET_GENERATE_ASPNET_CERTIFICATE","DOTNET_CLI_HOME","DOTNET_CLI_TELEMETRY_OPTOUT","DOTNET_SKIP_FIRST_TIME_EXPERIENCE","DOTNET_NOLOGO","DOTNET_PROCESSOR_COUNT","NUGET_PACKAGES","NUGET_HTTP_CACHE_PATH","MSBUILDDISABLENODEREUSE"];
function regular(path){const s=lstatSync(path);need(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1,"regular single-link compiler input/output required");return s}
function beneath(root,path){
 need(safeRelative(path),"closed relative member path");let parent=root;need(lstatSync(parent).isDirectory()&&!lstatSync(parent).isSymbolicLink(),"member root symlink/type");for(const part of path.split("/").slice(0,-1)){parent=join(parent,part);const s=lstatSync(parent);need(s.isDirectory()&&!s.isSymbolicLink(),"member ancestor symlink/type")}return join(root,path);
}
function rows(root){
 const out=[];
 function visit(path){for(const name of readdirSync(path).sort()){const full=join(path,name),s=lstatSync(full);need(!s.isSymbolicLink(),"temporary graph symlink");if(s.isDirectory())visit(full);else{regular(full);out.push({path:relative(root,full).replaceAll("\\","/"),bytes:s.size,sha256:hash(read(full))});need(out.length<=20000,"temporary graph leaf bound")}}}
 visit(root);need(out.reduce((n,x)=>n+x.bytes,0)<=1073741824,"temporary graph byte bound");return out;
}
function freshCapture(path){
 need(isAbsolute(path),"capture-dir must be absolute");path=resolve(path);need(!existsSync(path),"capture-dir must be fresh");let parent=dirname(path);
 while(true){const s=lstatSync(parent);need(s.isDirectory()&&!s.isSymbolicLink(),"capture ancestor symlink/type");if(parent===dirname(parent))break;parent=dirname(parent)}
 mkdirSync(path,{mode:0o700});return path;
}
export function evaluatedInputs(raw,cwd){
 // Fable5.18 Main.fs prints metadata followed by OtherOptions and SourceFiles.
 // Preserve the raw log as authority; parsed receipts do not invent pre-compile observations.
 const text=raw.toString("utf8"),start=text.indexOf("F# PROJECT: ");need(start>=0&&text.indexOf("F# PROJECT: ",start+1)<0,"one verbose compiler project graph required");
 const block=text.slice(start),lines=block.split(/\r?\n/);need(lines.length>=6&&lines[1].startsWith("FABLE LIBRARY: ")&&lines[2].startsWith("TARGET FRAMEWORK: ")&&lines[3].startsWith("OUTPUT TYPE: ")&&lines[4]==="","typed Fable verbose graph header");
 const entries=[];for(let i=5;i<lines.length&&lines[i].startsWith("    ");i++)entries.push(lines[i].slice(4));
 const sources=entries.filter(x=>!x.startsWith("-")&&/\.fsi?$/.test(x));const references=entries.filter(x=>x.startsWith("-r:")).map(x=>x.slice(3));need(sources.length>0&&references.length>0,"nonempty actual source/reference graph");
 need(entries.every(x=>x.startsWith("-")||/\.fsi?$/.test(x)),"untyped verbose compiler graph row");
 const pin=(path,role)=>{const absolute=resolve(cwd,path);const s=regular(absolute);return{role,compilerPath:path,absolutePath:absolute,bytes:s.size,sha256:hash(read(absolute)),observation:"after compiler; parent must join pre/post frozen input census"}};
 return{project:lines[0].slice(12),fableLibrary:lines[1].slice(15),targetFramework:lines[2].slice(18),outputType:lines[3].slice(13),options:entries.filter(x=>x.startsWith("-")),sources:sources.map(x=>pin(x,"source")),references:references.map(x=>pin(x,"reference")),rawSHA256:hash(raw),headerCharacterOffset:start};
}
export function buildStockSelection({captureDir=null,policyRoot=ownPolicyRoot,environment=process.env}={},run=spawnSync){
 const proofRoot=dirname(policyRoot),repoRoot=resolve(proofRoot,"../.."),outputRoot=join(policyRoot,"generated"),capture=captureDir?freshCapture(captureDir):null;
 const temporary= capture?join(capture,"fable-output"):mkdtempSync(join(tmpdir(),"stock-selection-fable-"));
 if(capture)mkdirSync(temporary,{mode:0o700});
 const save=(name,value)=>{if(capture)writeFileSync(join(capture,name),Buffer.isBuffer(value)?value:`${JSON.stringify(value,null,2)}\n`,{mode:0o600,flag:"wx"})};
 const childEnv=capture?Object.fromEntries(environmentKeys.filter(k=>environment[k]!==undefined).map(k=>[k,environment[k]])):environment;
 if(capture){mkdirSync(join(capture,"tmp"),{mode:0o700});childEnv.TMPDIR=join(capture,"tmp")}
 const descriptorPath=join(outputRoot,"stock-selection-policy.json"),originalDescriptor=existsSync(descriptorPath)?{sha256:hash(read(descriptorPath)),bytes:read(descriptorPath).length}:null;
 const phases=[];let outcome={schema:"fsbar.stock-selection-build-capture/v1",state:"FAILED",captureComplete:false,publishedNewDescriptor:false,originalDescriptor,temporaryRetained:Boolean(capture)},failure=null;
 function invoke(name,argv){
  const started=new Date().toISOString(),result=run("dotnet",argv,{cwd:repoRoot,env:childEnv,maxBuffer:33554432,timeout:120000,encoding:null});
  const stdout=Buffer.from(result.stdout??""),stderr=Buffer.from(result.stderr??"");save(`${name}.stdout.raw`,stdout);save(`${name}.stderr.raw`,stderr);
  const receipt={name,executable:"dotnet",argv,cwd:repoRoot,environment:childEnv,startedUTC:started,finishedUTC:new Date().toISOString(),actualChildPID:result.pid??null,status:result.status,signal:result.signal??null,error:result.error?{code:result.error.code??null,message:result.error.message}:null,stdout:{bytes:stdout.length,sha256:hash(stdout)},stderr:{bytes:stderr.length,sha256:hash(stderr)}};phases.push(receipt);save(`${name}.json`,receipt);
  need(!result.error&&result.status===0&&!result.signal,`${name} failed; raw streams retained in capture-dir`);need(stdout.length<=33554432&&stderr.length<=33554432,"child output bound");return{stdout,stderr};
 }
 try{
  const tools=JSON.parse(read(join(repoRoot,".config/dotnet-tools.json"))),version=tools.tools.fable.version;need(version==="5.18.0",`expected pinned Fable 5.18.0, found ${version}`);
  const inputPaths=["Policy/Directory.Build.props","Policy/StockSelection.fs","Policy/StockSelection.fsproj","Policy/StockSelection.packages.lock.json","Policy/build-stock-selection.mjs","package.json","package-lock.json"];
  const authored=()=>inputPaths.map(path=>{const absolute=join(proofRoot,path);regular(absolute);return{path:`tests/Broker.NativeProof/${path}`,sha256:hash(read(absolute))}});const before=authored();save("authored-before.json",before);
  invoke("restore",["restore",join(policyRoot,"StockSelection.fsproj"),"--locked-mode"]);
  const result=invoke("fable",["fable",join(policyRoot,"StockSelection.fsproj"),"--outDir",temporary,"--noCache","--noRestore",...(capture?["--verbose"]:[])]);
  if(capture)save("evaluated-inputs.json",evaluatedInputs(result.stdout,repoRoot));
  const compiledPath=join(temporary,"StockSelection.js"),libraryRoot=join(proofRoot,"node_modules/@fable-org/fable-library-js");regular(compiledPath);const original=read(compiledPath);let compiled=original.toString("utf8");
  const imports=[...compiled.matchAll(/\.\/fable_modules\/fable-library-js\.5\.18\.0\/([^"']+)/g)].map(match=>match[1]);need(imports.length>0,"generated policy did not declare its Fable runtime imports");const importedModules=[];
  for(const imported of new Set(imports)){need(safeRelative(imported),"runtime import traversal/absolute path");const copiedPath=beneath(temporary,`fable_modules/fable-library-js.5.18.0/${imported}`),installedPath=beneath(libraryRoot,imported);regular(copiedPath);regular(installedPath);const copied=read(copiedPath),installed=read(installedPath);need(copied.equals(installed),`Fable runtime import differs from pinned npm package: ${imported}`);importedModules.push({path:imported,temporaryPath:copiedPath,installedPath,bytes:copied.length,sha256:hash(copied)})}
  const inputs=authored();need(JSON.stringify(inputs)===JSON.stringify(before),"authored compiler input drift");save("authored-after.json",inputs);if(capture)save("temporary-graph.json",rows(temporary));
  compiled=`${compiled.replaceAll("./fable_modules/fable-library-js.5.18.0/","@fable-org/fable-library-js/").trimEnd()}\n`;const generatedBytes=Buffer.from(compiled),generatedPath=join(outputRoot,"StockSelection.js");
  save("rewrite-correspondence.json",{schema:"fsbar.stock-selection-import-rewrite/v1",original:{path:compiledPath,sha256:hash(original)},rewritten:{path:generatedPath,sha256:hash(generatedBytes)},transform:"literal Fable library prefix replacement, trimEnd, one final LF",imports,importedModules});
  if(existsSync(outputRoot))need(lstatSync(outputRoot).isDirectory()&&!lstatSync(outputRoot).isSymbolicLink(),"generated output directory type/symlink");else mkdirSync(outputRoot,{recursive:true});for(const path of [generatedPath,descriptorPath])if(existsSync(path))regular(path);
  const descriptor={schema:"fsbar.stock-selection-policy-artifact/v1",compiler:{tool:"fable",version},runtime:{package:"@fable-org/fable-library-js",version:"2.8.0"},inputs,output:{path:relative(repoRoot,generatedPath).replaceAll("\\","/"),sha256:hash(generatedBytes)}};
  writeFileSync(generatedPath,generatedBytes);writeFileSync(descriptorPath,`${JSON.stringify(descriptor,null,2)}\n`);
  outcome={...outcome,state:"COMPLETED",captureComplete:Boolean(capture),publishedNewDescriptor:true,descriptorSHA256:hash(read(descriptorPath)),output:descriptor.output};return descriptor;
 }catch(error){failure=error;throw error}
 finally{
  if(capture){try{save("retained-graph.json",rows(temporary))}catch(error){outcome={...outcome,state:"FAILED",captureComplete:false,graphCustodyFailure:error.message};if(!failure)throw error}finally{save("result.json",{...outcome,failure:failure?.message??null,phases:phases.map(x=>x.name),qualificationBoundary:"Source correctness only until original compiler/tools/packages/input census and actual parent admission are independently accepted"})}}
  else rmSync(temporary,{recursive:true,force:true});
 }
}
export function cli(args){need(args.length===0||(args.length===2&&args[0]==="--capture-dir"),"usage: build-stock-selection.mjs [--capture-dir <fresh-absolute-directory>]");return buildStockSelection({captureDir:args[1]??null})}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const descriptor=cli(process.argv.slice(2));process.stdout.write(`stock-selection-policy-generated ${descriptor.output.sha256}\n`)}catch(error){process.stderr.write(`${error.message}\n`);process.exitCode=1}
}
