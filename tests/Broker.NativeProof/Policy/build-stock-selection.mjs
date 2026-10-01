import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const policyRoot=dirname(fileURLToPath(import.meta.url)), proofRoot=dirname(policyRoot), repoRoot=resolve(proofRoot,"../.."), temporary=mkdtempSync(join(tmpdir(),"stock-selection-fable-")), outputRoot=join(policyRoot,"generated"), hash=bytes=>createHash("sha256").update(bytes).digest("hex"), read=path=>readFileSync(path), relativeToRepo=path=>path.slice(repoRoot.length+1).replaceAll("\\","/");

try{
  const tools=JSON.parse(readFileSync(join(repoRoot,".config/dotnet-tools.json"),"utf8")),fableVersion=tools.tools.fable.version;
  if(fableVersion!=="5.18.0")throw new Error(`expected pinned Fable 5.18.0, found ${fableVersion}`);
  const restore=spawnSync("dotnet",["restore",join(policyRoot,"StockSelection.fsproj"),"--locked-mode"],{cwd:repoRoot,encoding:"utf8"});
  if(restore.status!==0)throw new Error(`locked policy restore failed\n${restore.stdout}${restore.stderr}`);
  const result=spawnSync("dotnet",["fable",join(policyRoot,"StockSelection.fsproj"),"--outDir",temporary,"--noCache","--noRestore"],{cwd:repoRoot,encoding:"utf8"});
  if(result.status!==0)throw new Error(`Fable compilation failed\n${result.stdout}${result.stderr}`);
  const compiledPath=join(temporary,"StockSelection.js"),libraryRoot=join(proofRoot,"node_modules/@fable-org/fable-library-js");
  let compiled=readFileSync(compiledPath,"utf8");
  const imports=[...compiled.matchAll(/\.\/fable_modules\/fable-library-js\.5\.18\.0\/([^"']+)/g)].map(match=>match[1]);
  if(imports.length===0)throw new Error("generated policy did not declare its Fable runtime imports");
  for(const imported of new Set(imports)){
    const copied=read(join(temporary,"fable_modules/fable-library-js.5.18.0",imported)),installed=read(join(libraryRoot,imported));
    if(!copied.equals(installed))throw new Error(`Fable runtime import differs from pinned npm package: ${imported}`);
  }
  compiled=`${compiled.replaceAll("./fable_modules/fable-library-js.5.18.0/","@fable-org/fable-library-js/").trimEnd()}\n`;
  mkdirSync(outputRoot,{recursive:true});
  const generatedPath=join(outputRoot,"StockSelection.js"),generatedBytes=Buffer.from(compiled);
  writeFileSync(generatedPath,generatedBytes);
  const inputs=["Policy/Directory.Build.props","Policy/StockSelection.fs","Policy/StockSelection.fsproj","Policy/StockSelection.packages.lock.json","Policy/build-stock-selection.mjs","package.json","package-lock.json"].map(path=>{const absolute=join(proofRoot,path);return{path:`tests/Broker.NativeProof/${path}`,sha256:hash(read(absolute))}});
  const descriptor={schema:"fsbar.stock-selection-policy-artifact/v1",compiler:{tool:"fable",version:fableVersion},runtime:{package:"@fable-org/fable-library-js",version:"2.8.0"},inputs,output:{path:relativeToRepo(generatedPath),sha256:hash(generatedBytes)}};
  writeFileSync(join(outputRoot,"stock-selection-policy.json"),`${JSON.stringify(descriptor,null,2)}\n`);
  process.stdout.write(`stock-selection-policy-generated ${descriptor.output.sha256}\n`);
}finally{
  rmSync(temporary,{recursive:true,force:true});
}
