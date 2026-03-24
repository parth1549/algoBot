import os
import re

directories = ['app', 'components']
base_path = r'c:\Users\parth\OneDrive\Desktop\algoProject\frontend'

# We ONLY update string literals inside className="..." ensuring we aren't breaking logic
# To keep this simple yet robust, we'll do raw string replacements for standard tailwind tail tokens

replacements = {
    # Backgrounds
    r'\bbg-slate-900\b': 'bg-white dark:bg-slate-900',
    r'\bbg-slate-900/50\b': 'bg-white/50 dark:bg-slate-900/50',
    r'\bbg-slate-800\b': 'bg-gray-50 dark:bg-slate-800',
    r'\bbg-slate-800/10\b': 'bg-gray-100/50 dark:bg-slate-800/10',
    r'\bbg-slate-800/20\b': 'bg-gray-50 dark:bg-slate-800/20',
    r'\bbg-slate-800/40\b': 'bg-gray-50 dark:bg-slate-800/40',
    r'\bbg-slate-800/50\b': 'bg-gray-100 dark:bg-slate-800/50',
    r'\bbg-slate-800/60\b': 'bg-gray-100 dark:bg-slate-800/60',
    r'\bbg-slate-700\b': 'bg-gray-200 dark:bg-slate-700',
    r'\bbg-slate-700/50\b': 'bg-gray-200/50 dark:bg-slate-700/50',
    r'\bbg-slate-600\b': 'bg-gray-300 dark:bg-slate-600',
    
    # Hovers
    r'\bhover:bg-slate-800\b': 'hover:bg-gray-100 dark:hover:bg-slate-800',
    r'\bhover:bg-slate-800/50\b': 'hover:bg-gray-100/80 dark:hover:bg-slate-800/50',
    r'\bhover:bg-slate-800/60\b': 'hover:bg-gray-100/90 dark:hover:bg-slate-800/60',
    r'\bhover:bg-slate-700\b': 'hover:bg-gray-200 dark:hover:bg-slate-700',
    r'\bhover:bg-slate-700/50\b': 'hover:bg-gray-200/80 dark:hover:bg-slate-700/50',

    # Borders
    r'\bborder-slate-800\b': 'border-gray-200 dark:border-slate-800',
    r'\bborder-slate-700\b': 'border-gray-200 dark:border-slate-700',
    r'\bborder-slate-700/50\b': 'border-gray-200/80 dark:border-slate-700/50',
    r'\bborder-slate-600\b': 'border-gray-300 dark:border-slate-600',
    r'\bhover:border-slate-600\b': 'hover:border-gray-300 dark:hover:border-slate-600',
    
    # Text
    r'\btext-slate-200\b': 'text-gray-900 dark:text-slate-200',
    r'\btext-slate-200/90\b': 'text-gray-800 dark:text-slate-200/90',
    r'\btext-slate-300\b': 'text-gray-800 dark:text-slate-300',
    r'\btext-slate-400\b': 'text-gray-600 dark:text-slate-400',
    r'\btext-slate-500\b': 'text-gray-500 dark:text-slate-500',
    r'\btext-white\b': 'text-gray-900 dark:text-white',
    r'\bhover:text-white\b': 'hover:text-gray-900 dark:hover:text-white',
    r'\bhover:text-slate-200\b': 'hover:text-gray-800 dark:hover:text-slate-200',
    r'\bhover:text-slate-300\b': 'hover:text-gray-700 dark:hover:text-slate-300',
}

files_modified = 0

for d in directories:
    dir_path = os.path.join(base_path, d)
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for pattern, replacement in replacements.items():
                    # Safely replace only standalone classes using regex boundaries
                    # But avoid replacing ones that are ALREADY dark: prefixed
                    # Negative lookbehind: (?<!dark:)
                    regex_str = r'(?<!dark:)' + pattern
                    new_content = re.sub(regex_str, replacement, new_content)

                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    files_modified += 1
                    print(f"Modified: {file_path}")

print(f"\nDone! Modified {files_modified} files.")
