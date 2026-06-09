#!/usr/bin/env bash

# Sandbox execution script
# Receives: language file-to-run test-case-input
LANG=$1
FILE=$2
INPUT=$3

if [ "$LANG" = "python" ]; then
    python3 "$FILE" < "$INPUT"
elif [ "$LANG" = "javascript" ]; then
    node "$FILE" < "$INPUT"
elif [ "$LANG" = "cpp" ]; then
    g++ -O3 "$FILE" -o /tmp/solution
    /tmp/solution < "$INPUT"
else
    echo "Error: Unsupported language $LANG"
    exit 1
fi
