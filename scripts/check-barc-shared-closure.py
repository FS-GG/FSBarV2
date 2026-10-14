#!/usr/bin/env python3
"""Check deployed BAR shared assets and their existing pins/manifest; launch nothing."""
import argparse
import hashlib
import json
import os
import pathlib
import re

SHARED = 'src/Broker.Browser.SharedWasm/'
WASM = 'src/Broker.Browser.Wasm/'
ENTRIES = [SHARED + 'index.js', SHARED + 'fable/Adapter.js',
           SHARED + '_content/FS.GG.Wasm.Browser/worker-client.mjs',
           SHARED + '_content/FS.GG.Wasm.Browser/module-worker.mjs',
           SHARED + '_content/FS.GG.Wasm.Browser/policy/Host.js',
           SHARED + '_content/FS.GG.Wasm.Browser/policy/WorkerEntry.js',
           WASM + 'index.js', WASM + 'barc-wire.js', WASM + 'wasm-profile.js',
           WASM + 'guest-worker.js', WASM + 'guest-supervisor.js']
DIGEST = re.compile(r'[0-9a-f]{64}')

def module_tokens(text):
    """Lex the generated module subset without executing JavaScript.

    Comments and strings cannot conceal imports; template substitutions are
    scanned as code. Ambiguous slash goals and escaped identifiers refuse.
    This is a source guard, not JavaScript syntax/semantic validation.
    """
    tokens = []
    length = len(text)
    line_terminators = '\r\n\u2028\u2029'
    expression_prefixes = {'(', '[', '=', ',', ':', ';', '!', '?', '+', '-', '*',
                           '%', '&', '|', '^', '~', '<', '>', 'return', 'throw',
                           'case', 'delete', 'void', 'typeof', 'yield', 'await', '=>',
                           'else', 'do', 'break', 'continue', 'debugger', 'default',
                           'extends',
                           '/', 'in', 'instanceof', '...', '**', '&&', '||', '??',
                           '<<', '>>', '>>>', '<=', '>=', '==', '!=', '===', '!==',
                           '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**=',
                           '&&=', '||=', '??='}
    operators = sorted(expression_prefixes | {'++', '--', '?.'}, key=len, reverse=True)

    def scan(index, template_expression=False):
        braces = 0
        parens = []
        previous = None
        regex_allowed = True
        while index < length:
            char = text[index]
            if char.isspace():
                index += 1
                continue
            if text.startswith('//', index):
                index += 2
                while index < length and text[index] not in line_terminators:
                    index += 1
                continue
            if text.startswith('/*', index):
                close = text.find('*/', index + 2)
                if close < 0:
                    raise ValueError('unterminated module comment')
                index = close + 2
                continue
            start = index
            if char in ('"', "'"):
                quote = char
                index += 1
                while index < length:
                    if text[index] == '\\':
                        index += 2
                    elif text[index] == quote:
                        index += 1
                        break
                    elif text[index] in '\r\n':
                        raise ValueError('unsupported multiline module string')
                    else:
                        index += 1
                else:
                    raise ValueError('unterminated module string')
                tokens.append(('string', text[start + 1:index - 1], start, index))
                previous, regex_allowed = 'literal', False
                continue
            if char == '`':
                tokens.append(('template', '`', index, index + 1))
                index += 1
                while index < length:
                    if text[index] == '\\':
                        index += 2
                    elif text[index] == '`':
                        index += 1
                        break
                    elif text.startswith('${', index):
                        index = scan(index + 2, True)
                    else:
                        index += 1
                else:
                    raise ValueError('unterminated module template')
                previous, regex_allowed = 'literal', False
                continue
            if char == '/' and previous in ('}', 'of'):
                # `of` is contextual and may also be an ordinary identifier.
                # Refuse this slash rather than guessing a for-of lexical goal.
                raise ValueError('unsupported ambiguous module slash')
            if char == '/' and not regex_allowed and tokens and any(
                    value in line_terminators for value in text[tokens[-1][3]:index]):
                # A labeled break/continue can end by ASI before a regexp. Do
                # not guess that a cross-line slash must be division.
                raise ValueError('unsupported ambiguous multiline module slash')
            if char == '/' and regex_allowed:
                index += 1
                in_class = False
                while index < length:
                    value = text[index]
                    if value == '\\':
                        index += 2
                        continue
                    if value in line_terminators:
                        raise ValueError('unterminated module regexp')
                    if value == '[':
                        in_class = True
                    elif value == ']':
                        in_class = False
                    elif value == '/' and not in_class:
                        index += 1
                        while index < length and text[index].isalpha():
                            index += 1
                        break
                    index += 1
                else:
                    raise ValueError('unterminated module regexp')
                tokens.append(('regexp', '', start, index))
                previous, regex_allowed = 'literal', False
                continue
            if char == '\\':
                raise ValueError('unsupported escaped module identifier')
            if char.isalpha() or char in '_$':
                index += 1
                while index < length and (text[index].isalnum() or text[index] in '_$'):
                    index += 1
                value = text[start:index]
            elif char.isdigit():
                index += 1
                while index < length and (text[index].isalnum() or text[index] in '._'):
                    index += 1
                value = 'number'
            else:
                value = next((operator for operator in operators
                              if not operator[0].isalpha() and text.startswith(operator, index)), char)
                index += len(value)
            tokens.append(('token', value, start, index))
            if value == '(':
                parens.append(previous in {'if', 'while', 'for', 'with', 'switch', 'catch'})
                regex_allowed = True
            elif value == ')':
                regex_allowed = parens.pop() if parens else False
            elif value == '{':
                braces += 1
                regex_allowed = True
            elif value == '}':
                if template_expression and braces == 0:
                    return index
                braces -= 1
                regex_allowed = False
            elif value in ('++', '--'):
                # Prefix operators still expect an operand; postfix operators
                # preserve the division goal of the preceding expression.
                pass
            else:
                regex_allowed = value in expression_prefixes and previous not in ('.', '?.')
            previous = 'property' if previous in ('.', '?.') else value
        if template_expression:
            raise ValueError('unterminated module template substitution')
        return index

    scan(0)
    return tokens


def runtime_imports(text):
    tokens = module_tokens(text)
    imports = []

    def literal(position):
        if position >= len(tokens) or tokens[position][0] != 'string':
            raise ValueError('nonliteral shared runtime import')
        value = tokens[position][1]
        if '\\' in value:
            raise ValueError('escaped shared runtime import')
        return value

    def declaration_end(position):
        if position == len(tokens) or tokens[position][1] == ';':
            return
        if any(char in '\r\n\u2028\u2029' for char in text[tokens[position - 1][3]:tokens[position][2]]):
            return
        raise ValueError('unsupported shared import declaration suffix')

    for index, token in enumerate(tokens):
        if token[0] != 'token' or token[1] not in ('import', 'export'):
            continue
        if index and tokens[index - 1][1] in ('.', '?.'):
            continue
        next_index = index + 1
        if next_index >= len(tokens):
            raise ValueError('incomplete shared import declaration')
        next_value = tokens[next_index][1]
        if token[1] == 'import' and next_value == '.':
            if next_index + 1 >= len(tokens) or tokens[next_index + 1][1] != 'meta':
                raise ValueError('unsupported shared import meta expression')
            continue
        if token[1] == 'import' and next_value == '(':
            target = literal(next_index + 1)
            if next_index + 2 >= len(tokens) or tokens[next_index + 2][1] != ')':
                raise ValueError('nonliteral shared runtime import')
            imports.append(target)
            continue
        if token[1] == 'import' and tokens[next_index][0] == 'string':
            imports.append(literal(next_index))
            declaration_end(next_index + 1)
            continue
        if token[1] == 'export' and next_value not in ('*', '{'):
            continue
        depth = 0
        position = next_index
        while position < len(tokens):
            value = tokens[position][1]
            if value == '{':
                depth += 1
            elif value == '}':
                depth -= 1
            elif depth == 0 and value == 'from':
                imports.append(literal(position + 1))
                declaration_end(position + 2)
                break
            elif depth == 0 and value == ';':
                if token[1] == 'import':
                    raise ValueError('unsupported shared import declaration')
                break
            position += 1
        else:
            if token[1] == 'import':
                raise ValueError('incomplete shared import declaration')
    return imports

def regular(root, relative):
    path = pathlib.PurePosixPath(relative)
    if path.is_absolute() or path.as_posix() != relative or not path.parts or any(part in ('', '.', '..') for part in path.parts):
        raise ValueError('unsafe asset path: ' + relative)
    physical = root
    for part in path.parts:
        physical /= part
        if physical.is_symlink():
            raise ValueError('symlink in asset path: ' + relative)
    if not physical.is_file() or not physical.resolve().is_relative_to(root):
        raise ValueError('missing or escaping asset: ' + relative)
    if physical.stat().st_size > 8 * 1024 * 1024:
        raise ValueError('asset exceeds source inspection bound: ' + relative)
    return physical

def bounded_files(directory):
    # Bound traversal before population growth, including empty/deep directories.
    stack = [(directory, 0)]
    files = directories = 0
    while stack:
        current, depth = stack.pop()
        if depth > 32:
            raise ValueError('deployed directory depth bound exceeded')
        with os.scandir(current) as entries:
            for entry in entries:
                if entry.is_symlink():
                    raise ValueError('symbolic deployed entry: ' + entry.name)
                if entry.is_dir(follow_symlinks=False):
                    directories += 1
                    if directories > 256 or depth == 32:
                        raise ValueError('deployed directory population/depth bound exceeded')
                    stack.append((pathlib.Path(entry.path), depth + 1))
                elif entry.is_file(follow_symlinks=False):
                    files += 1
                    if files > 512:
                        raise ValueError('deployed file population bound exceeded')
                    yield pathlib.Path(entry.path)
                else:
                    raise ValueError('nonregular deployed entry: ' + entry.name)

def digest(root, relative):
    return hashlib.sha256(regular(root, relative).read_bytes()).hexdigest()

def check(root, pins=None, manifest=False):
    root = root.resolve(strict=True)
    assets = set(ENTRIES)
    for subtree in ('fable', '_content'):
        directory = root / SHARED / subtree
        if not directory.is_dir() or directory.is_symlink():
            raise ValueError('missing or symbolic deployed directory: ' + subtree)
        for path in bounded_files(directory):
            assets.add(path.relative_to(root).as_posix())
            if len(assets) > 512:
                raise ValueError('shared asset inspection bound exceeded')
    if len(assets) > 512:
        raise ValueError('shared asset inspection bound exceeded')
    inspected_bytes = 0
    scripts = {}
    for relative in sorted(assets):
        path = regular(root, relative)
        inspected_bytes += path.stat().st_size
        if inspected_bytes > 32 * 1024 * 1024:
            raise ValueError('shared aggregate inspection byte bound exceeded')
        if path.suffix in ('.dll', '.exe', '.so', '.dylib'):
            raise ValueError('assembly in deployed shared graph: ' + relative)
        if path.suffix not in ('.js', '.mjs'):
            continue
        scripts[relative] = path.read_text(encoding='utf-8')
    # Fable copies its complete library, including unused Node-only modules.
    # Inventory and hash every file, but qualify runtime imports from the
    # explicit host/Worker roots rather than treating every copied file as loaded.
    pending = list(ENTRIES)
    visited = set()
    while pending:
        relative = pending.pop()
        if relative in visited:
            continue
        visited.add(relative)
        text = scripts.get(relative)
        if text is None:
            continue
        path = regular(root, relative)
        for specifier in runtime_imports(text):
            if not specifier.startswith('./') and not specifier.startswith('../'):
                raise ValueError('nonrelative shared runtime import: ' + specifier)
            target = (path.parent / specifier).resolve()
            if not target.is_relative_to(root):
                raise ValueError('escaping shared runtime import: ' + specifier)
            target_relative = target.relative_to(root).as_posix()
            if target_relative not in assets:
                raise ValueError('unlisted shared runtime import: ' + target_relative)
            regular(root, target_relative)
            pending.append(target_relative)
    if pins is not None:
        if pins.get('schema') != 'fsbar.barc-live-receiver-pins/v4' or pins.get('runtime') != 'shared-wasm-0.2.0':
            raise ValueError('shared runtime requires explicit v4 pins')
        entries = {entry['archivePath']: entry for entry in pins['files']}
        if len(entries) != len(pins['files']):
            raise ValueError('duplicate pinned archive path')
        selected = {path for path in entries if path.startswith(SHARED)}
        if selected != {path for path in assets if path.startswith(SHARED)}:
            raise ValueError('pinned shared runtime inventory differs from deployed files')
        for relative in assets:
            entry = entries.get(relative)
            if entry is None or entry['sourcePath'] != relative or not DIGEST.fullmatch(entry['sha256']):
                raise ValueError('missing exact source/archive pin: ' + relative)
            expected_role = 'worker' if relative == ENTRIES[3] else 'dependency'
            if entry['role'] != expected_role or digest(root, relative) != entry['sha256']:
                raise ValueError('shared asset role or hash mismatch: ' + relative)
    if manifest:
        expected = {}
        for line in regular(root, 'BARC-PREVIEW.SHA256').read_text().splitlines():
            sha, relative = line.split(maxsplit=1)
            if relative in expected or not DIGEST.fullmatch(sha):
                raise ValueError('invalid or duplicate manifest entry')
            expected[relative] = sha
        actual = set()
        archive_bytes = 0
        for path in bounded_files(root):
            relative = path.relative_to(root).as_posix()
            archive_bytes += regular(root, relative).stat().st_size
            if archive_bytes > 32 * 1024 * 1024:
                raise ValueError('receiver aggregate inspection byte bound exceeded')
            actual.add(relative)
        actual.discard('BARC-PREVIEW.SHA256')
        if set(expected) != actual or not assets.issubset(expected):
            raise ValueError('receiver manifest has missing or unlisted files')
        for relative, sha in expected.items():
            if digest(root, relative) != sha:
                raise ValueError('receiver manifest hash mismatch: ' + relative)
    return sorted(assets)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=pathlib.Path)
    parser.add_argument('--pins', type=pathlib.Path)
    parser.add_argument('--manifest', action='store_true')
    args = parser.parse_args()
    try:
        check(args.root, json.loads(args.pins.read_text()) if args.pins else None, args.manifest)
    except (ValueError, OSError, KeyError, UnicodeError) as error:
        parser.exit(2, 'invalid BAR shared closure: ' + str(error) + '\n')
