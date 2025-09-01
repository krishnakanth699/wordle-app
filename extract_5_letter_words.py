# This script reads words.txt, extracts all 5-letter words, and writes them to validWords.js as a JS array.
# Usage: Run in the same directory as words.txt and validWords.js

input_file = 'words.txt'
output_file = 'wordleapp/validWords.js'


import re
with open(input_file, 'r') as f:
    words = []
    for w in f:
        cleaned = re.sub(r'[^A-Za-z]', '', w.strip())
        if len(cleaned) == 5:
            words.append(cleaned.upper())

with open(output_file, 'w') as out:
    out.write('export const VALID_WORDS = [\n')
    out.write(',\n'.join(f'"{w}"' for w in words))
    out.write('\n];\n')

print(f"Extracted {len(words)} 5-letter words to {output_file}")
