from __future__ import annotations

import sys

from catalog_registry import ROOT, registry_paths, load_registry, validate_registry


def main() -> int:
    errors = validate_registry(ROOT)
    if errors:
        print("catalog registry failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    count = len(registry_paths(load_registry(ROOT)))
    print(f"catalog registry checks passed: {count} registered pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
