"""SOURCE placement plan only. Never emits a canonical successful closure/receipt."""
import pathlib, time
from qualify_prearm import exact, need, held_bytes, parse, sha
MANAGED=('apphost','managedDll','depsJson','runtimeConfigJson','fsharpCore')
PROVENANCE=('pdb','sourceLink','buildReceipt','helperManifest','policySourceManifest','productSourceManifest','productRoleGraph','lockedBuildInputs','toolchainReceipt')
RUNTIME=('hostfxr','hostpolicy','coreLib','coreClr','jit')
def prepare(original_pin,candidate,new_root,deadline):
 exact(candidate,['productCommit','productTree','highbarCommit'],'candidate')
 import re
 need(all(type(v)is str and re.fullmatch('[0-9a-f]{40}',v)for v in candidate.values()),'candidate-identity')
 root=pathlib.Path(new_root);need(root.is_absolute()and not root.exists(),'fresh-placement-root')
 original=parse(held_bytes(original_pin,1024*1024,deadline));exact(original,['schema','custodyRoot','managedRoot','provenanceRoot','runtimeRoots','searchLayout','managed','provenance','runtime','runtimeRoles','source','custody'],'original-closure')
 need({x['role']for x in original['managed']}==set(MANAGED)and len(original['managed'])==5 and {x['role']for x in original['provenance']}==set(PROVENANCE)and len(original['provenance'])==9 and set(original['runtimeRoles'])==set(RUNTIME),'nineteen-canonical-roles')
 need(original['schema']=='fsbar.barc-runtime-evidence-policy-closure/v3','original-closure-schema');source=original['source'];obstructions=['fresh-final-policy-build-not-executed','fresh-final-placement-not-executed','root-selected-SDK-physical-inventory-unavailable']
 if source['productCommit']!=candidate['productCommit']:obstructions.append('productCommit-mismatch')
 if source['productTree']!=candidate['productTree']:obstructions.append('productTree-mismatch')
 placements=[]
 for group in ['managed','provenance','runtime']:
  for row in original[group]:
   # Original pins remain historical. New inode/path identities do not exist yet.
   placements.append({'group':group,'original':row,'proposedPath':str(root/group/pathlib.Path(row['path']).name),'newPhysicalPin':None})
 need(len({x['proposedPath']for x in placements})==len(placements),'placement-name-collision')
 graph={'schema':'fsbar.barc-product-source-role-graph/v1','roles':{'fsbarCommit':candidate['productCommit'],'highbarCommit':candidate['highbarCommit']}}
 import json
 graph_body=json.dumps(graph,separators=(',',':')).encode()
 return {'schema':'bar.policy-closure-source-placement-proposal/v1','ready':False,'originalManifest':original_pin,'candidate':candidate,'custodyRoot':str(root),'canonicalNineteenRoles':list(MANAGED+PROVENANCE+RUNTIME),'placements':placements,'runtimeCensus':original['runtime'],'searchLayoutObligation':original['searchLayout'],'productRoleGraphProposal':graph,'productRoleGraphSha256':sha(graph_body),'sourceGraphHistorical':source,'obstructions':obstructions,'historicalRoute':{'publicEvidenceAvailable':False,'privateSelectionRequired':True},'freshBuildProposal':{'project':'tests/Broker.NativeProof/RuntimeEvidence/RuntimeEvidence.Tests.fsproj','selectedSDK':None,'restoreArgs':['restore','tests/Broker.NativeProof/RuntimeEvidence/RuntimeEvidence.Tests.fsproj','--locked-mode','--source','<root-selected-locked-official-feed>','-p:DisableImplicitLibraryPacksFolder=true','-m:1','-nr:false','-p:NuGetAudit=false'],'buildArgs':['build','tests/Broker.NativeProof/RuntimeEvidence/RuntimeEvidence.Tests.fsproj','-c','Release','--no-restore','-p:DisableImplicitLibraryPacksFolder=true','-m:1','-nr:false','-p:NuGetAudit=false','-p:UseSharedCompilation=false','-p:SourceLink=<fresh-exact-commit-sourcelink-file>'],'environment':{'DOTNET_PROCESSOR_COUNT':'1'},'actualOutputs':None,'actualPDBSourceProof':None,'componentReuse':'Retained v5/v6 compile/proof outputs require explicit unchanged input-equivalence joins to candidate361. No prior receipt rewritten.'},'requiredProducerSemantics':['genuine policy/helper/product source identities','locked existing SDK/project/lock inputs','PE/PDB embedded SourceLink and original output correspondence','exact final product graph','complete runtime/dependency census and loaded map/assembly custody'],'receiptRewritePermitted':False,'effectsPerformed':False}
