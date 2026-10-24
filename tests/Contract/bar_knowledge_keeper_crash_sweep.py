"""Crash sweep: os._exit(137) at the Nth rename/replace/fsync of a changed-content cycle, then recover."""
import importlib.util, json, os, shutil, sqlite3, subprocess, sys, tempfile
from pathlib import Path
repo = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2]
child = r'''
import importlib.util, os, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location("k", sys.argv[1]); k = importlib.util.module_from_spec(spec); spec.loader.exec_module(k)
target, count = int(sys.argv[4]), [0]
for name in ("rename", "replace", "fsync"):
    real = getattr(os, name)
    def wrap(*a, _real=real, **kw):
        count[0] += 1
        if count[0] == target: os._exit(137)
        return _real(*a, **kw)
    setattr(k.os, name, wrap)
k.cycle(Path(sys.argv[2]), Path(sys.argv[3]))
print("COMPLETED", count[0])
'''
results = []
for point in range(1, 40):
    base = Path(tempfile.mkdtemp(dir=os.environ.get("TMPDIR")))
    live, root = base / "live.sqlite", base / "state"; root.mkdir()
    subprocess.run([sys.executable, "-I", str(repo / "scripts/bar_knowledge.py"), "--archive", str(repo / "docs/knowledge/bar"),
                    "restore", "--database", str(live)], check=True, capture_output=True)
    subprocess.run([sys.executable, "-I", str(repo / "scripts/bar_knowledge_keeper.py"), "--root", str(root), "once", "--live", str(live)], check=True, capture_output=True)
    with sqlite3.connect(live) as c:
        c.execute("INSERT INTO chapter_documents VALUES ('d'||hex(randomblob(31)),'x','sweep','r','t','body')")
    run = subprocess.run([sys.executable, "-I", "-c", child, str(repo / "scripts/bar_knowledge_keeper.py"), str(live), str(root), str(point)], capture_output=True, text=True)
    done = "COMPLETED" in run.stdout
    rec = subprocess.run([sys.executable, "-I", str(repo / "scripts/bar_knowledge_keeper.py"), "--root", str(root), "once", "--live", str(live)], capture_output=True, text=True)
    health = json.loads(subprocess.run([sys.executable, "-I", str(repo / "scripts/bar_knowledge_keeper.py"), "--root", str(root), "health"], capture_output=True, text=True).stdout)
    ok = rec.returncode == 0 and health["pending"] == 0 and health["staged"] == 0 and health["retainedVersions"] == 2 and not health.get("lastError")
    results.append((point, "completed" if done else f"killed rc={run.returncode}", "RECOVERED" if ok else f"WEDGED rc={rec.returncode} {rec.stderr.strip()[:120]}"))
    shutil.rmtree(base)
    if done:
        break
for row in results: print(*row)
ok = all(r[2] == "RECOVERED" for r in results)
print("ALL RECOVERED" if ok else "SOME WEDGED", len(results), "points")
sys.exit(0 if ok else 1)
